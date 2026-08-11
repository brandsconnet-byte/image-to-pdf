import { jsPDF } from 'jspdf';
import Tesseract from 'tesseract.js';
import { ImageItem, PdfSettings, PaperSize, PageMargin } from '../types';

export function getPaperDimensions(size: PaperSize, orientation: 'portrait' | 'landscape' | 'auto', imgWidth: number, imgHeight: number): { width: number; height: number } {
  if (size === 'fit') {
    // Convert pixels to mm approx (72 DPI or 96 DPI: ~0.264583 mm per px)
    const pxToMm = 0.264583;
    return {
      width: Math.max(20, Math.round(imgWidth * pxToMm)),
      height: Math.max(20, Math.round(imgHeight * pxToMm)),
    };
  }

  let dims = { width: 210, height: 297 }; // Default A4 in mm

  switch (size) {
    case 'letter':
      dims = { width: 215.9, height: 279.4 };
      break;
    case 'legal':
      dims = { width: 215.9, height: 355.6 };
      break;
    case 'a3':
      dims = { width: 297, height: 420 };
      break;
    case 'a5':
      dims = { width: 148, height: 210 };
      break;
    case 'a4':
    default:
      dims = { width: 210, height: 297 };
      break;
  }

  // Determine orientation
  let isLandscape = false;
  if (orientation === 'landscape') {
    isLandscape = true;
  } else if (orientation === 'auto') {
    isLandscape = imgWidth > imgHeight;
  }

  if (isLandscape) {
    return { width: Math.max(dims.width, dims.height), height: Math.min(dims.width, dims.height) };
  } else {
    return { width: Math.min(dims.width, dims.height), height: Math.max(dims.width, dims.height) };
  }
}

export function getMarginMm(margin: PageMargin): number {
  switch (margin) {
    case 'none':
      return 0;
    case 'small':
      return 5;
    case 'large':
      return 20;
    case 'normal':
    default:
      return 10;
  }
}

/**
 * Renders an ImageItem to a Canvas with rotation and CSS filters applied
 */
export async function processImageToCanvas(item: ImageItem): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      const isRotated90or270 = item.rotation === 90 || item.rotation === 270;
      const targetWidth = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      const targetHeight = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Apply Filters
      const filterParts: string[] = [];
      if (item.filter.type === 'grayscale') filterParts.push('grayscale(100%)');
      else if (item.filter.type === 'contrast') filterParts.push('contrast(160%) brightness(105%)');
      else if (item.filter.type === 'sepia') filterParts.push('sepia(90%)');
      else if (item.filter.type === 'warm') filterParts.push('sepia(30%) saturate(140%) hue-rotate(-10deg)');
      else if (item.filter.type === 'cool') filterParts.push('saturate(110%) hue-rotate(15deg)');
      else if (item.filter.type === 'vivid') filterParts.push('saturate(180%) contrast(110%)');

      if (item.filter.brightness !== 0) {
        filterParts.push(`brightness(${100 + item.filter.brightness}%)`);
      }
      if (item.filter.contrast !== 0) {
        filterParts.push(`contrast(${100 + item.filter.contrast}%)`);
      }

      ctx.filter = filterParts.length > 0 ? filterParts.join(' ') : 'none';

      // Handle Rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((item.rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      resolve(canvas);
    };
    img.onerror = (err) => reject(err);
    img.src = item.src;
  });
}

export async function generatePdf(
  items: ImageItem[],
  settings: PdfSettings,
  onProgress?: (progress: number, message: string) => void
): Promise<{ blob: Blob; blobUrl: string }> {
  if (items.length === 0) {
    throw new Error('No images selected to convert.');
  }

  onProgress?.(5, 'Initializing PDF document...');

  const qualityRatio = settings.quality === 'high' ? 0.98 : settings.quality === 'standard' ? 0.85 : 0.65;
  const imageFormat = 'JPEG';

  let pdf: jsPDF | null = null;
  const totalItems = items.length;

  for (let i = 0; i < totalItems; i++) {
    const item = items[i];
    const stepPercent = Math.round(10 + ((i + 1) / totalItems) * 80);
    onProgress?.(stepPercent, `Processing image ${i + 1} of ${totalItems}...`);

    const canvas = await processImageToCanvas(item);
    const imgDataUrl = canvas.toDataURL(`image/jpeg`, qualityRatio);

    const paperDims = getPaperDimensions(
      settings.paperSize,
      settings.orientation,
      canvas.width,
      canvas.height
    );

    const margin = getMarginMm(item.customMargin || settings.margin);
    const availWidth = Math.max(10, paperDims.width - margin * 2);
    const availHeight = Math.max(10, paperDims.height - margin * 2);

    // Calculate position and size on page
    const fitMode = item.fit || settings.defaultFit;
    let renderW = availWidth;
    let renderH = availHeight;
    let renderX = margin;
    let renderY = margin;

    const imgAspect = canvas.width / canvas.height;
    const availAspect = availWidth / availHeight;

    if (fitMode === 'contain') {
      if (imgAspect > availAspect) {
        renderW = availWidth;
        renderH = availWidth / imgAspect;
      } else {
        renderH = availHeight;
        renderW = availHeight * imgAspect;
      }
      renderX = margin + (availWidth - renderW) / 2;
      renderY = margin + (availHeight - renderH) / 2;
    } else if (fitMode === 'cover') {
      if (imgAspect > availAspect) {
        renderH = availHeight;
        renderW = availHeight * imgAspect;
      } else {
        renderW = availWidth;
        renderH = availWidth / imgAspect;
      }
      renderX = margin + (availWidth - renderW) / 2;
      renderY = margin + (availHeight - renderH) / 2;
    } else if (fitMode === 'original') {
      const pxToMm = 0.264583;
      renderW = Math.min(availWidth, canvas.width * pxToMm);
      renderH = Math.min(availHeight, canvas.height * pxToMm);
      renderX = margin + (availWidth - renderW) / 2;
      renderY = margin + (availHeight - renderH) / 2;
    } else {
      // stretch
      renderW = availWidth;
      renderH = availHeight;
      renderX = margin;
      renderY = margin;
    }

    if (i === 0) {
      pdf = new jsPDF({
        orientation: paperDims.width > paperDims.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [paperDims.width, paperDims.height],
      });
    } else if (pdf) {
      pdf.addPage([paperDims.width, paperDims.height], paperDims.width > paperDims.height ? 'landscape' : 'portrait');
    }

    if (!pdf) continue;

    // Apply background color if not pure white
    if (settings.backgroundColor && settings.backgroundColor !== '#ffffff') {
      pdf.setFillColor(settings.backgroundColor);
      pdf.rect(0, 0, paperDims.width, paperDims.height, 'F');
    }

    // Add Image to Page
    pdf.addImage(imgDataUrl, imageFormat, renderX, renderY, renderW, renderH);

    // OCR Processing (Searchable Text Layer)
    if (settings.enableOcr) {
      try {
        onProgress?.(
          stepPercent,
          `Scanning text via OCR on page ${i + 1} of ${totalItems}...`
        );
        const ocrLang = settings.ocrLanguage || 'eng';
        const result = await Tesseract.recognize(canvas, ocrLang);
        const data = result?.data as any;

        if (data && Array.isArray(data.words) && data.words.length > 0) {
          const scaleX = renderW / canvas.width;
          const scaleY = renderH / canvas.height;

          for (const word of data.words) {
            if (!word.text || !word.text.trim()) continue;
            const { x0, y0, x1, y1 } = word.bbox;
            const wordHeightMm = Math.max(0.5, (y1 - y0) * scaleY);

            const wordX = renderX + x0 * scaleX;
            const wordY = renderY + y1 * scaleY; // Baseline position at y1

            // Set font size corresponding to word height in points (1 mm = 2.83465 pt)
            const fontSizePt = Math.max(3, Math.round(wordHeightMm * 2.83465));
            pdf.setFontSize(fontSizePt);

            // Embed invisible searchable text on top of image
            pdf.text(word.text, wordX, wordY, {
              renderingMode: 'invisible',
            });
          }
        }
      } catch (ocrError) {
        console.warn(`OCR failed for page ${i + 1}:`, ocrError);
      }
    }

    // Add Header
    if (settings.headerText.trim()) {
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text(settings.headerText.trim(), margin > 0 ? margin : 10, 8);
    }

    // Add Footer
    if (settings.footerText.trim()) {
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text(settings.footerText.trim(), margin > 0 ? margin : 10, paperDims.height - 6);
    }

    // Add Page Numbering
    if (settings.pageNumbers !== 'none') {
      const pageNumStr = `${settings.pageNumberPrefix || 'Page '} ${i + 1} of ${totalItems}`;
      pdf.setFontSize(9);
      pdf.setTextColor(120, 130, 140);

      const textWidth = pdf.getTextWidth(pageNumStr);

      let xPos = paperDims.width / 2 - textWidth / 2;
      let yPos = paperDims.height - 6;

      if (settings.pageNumbers === 'bottom-right') {
        xPos = paperDims.width - (margin > 0 ? margin : 10) - textWidth;
      } else if (settings.pageNumbers === 'bottom-left') {
        xPos = margin > 0 ? margin : 10;
      } else if (settings.pageNumbers === 'top-right') {
        xPos = paperDims.width - (margin > 0 ? margin : 10) - textWidth;
        yPos = 8;
      }

      pdf.text(pageNumStr, xPos, yPos);
    }
  }

  onProgress?.(95, 'Finalizing PDF output...');

  if (!pdf) {
    throw new Error('Failed to create PDF object');
  }

  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  onProgress?.(100, 'Complete!');

  return { blob, blobUrl };
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

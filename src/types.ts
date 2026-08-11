export type PaperSize = 'a4' | 'letter' | 'legal' | 'a3' | 'a5' | 'fit';

export type PageOrientation = 'auto' | 'portrait' | 'landscape';

export type ImageFit = 'contain' | 'cover' | 'stretch' | 'original';

export type ImageFilterType = 'none' | 'grayscale' | 'contrast' | 'sepia' | 'warm' | 'cool' | 'vivid';

export type PageMargin = 'none' | 'small' | 'normal' | 'large';

export type PageNumberPosition = 'none' | 'bottom-center' | 'bottom-right' | 'top-right' | 'bottom-left';

export interface ImageFilterOptions {
  type: ImageFilterType;
  brightness: number; // -50 to 50
  contrast: number;   // -50 to 50
}

export interface ImageItem {
  id: string;
  file?: File;
  name: string;
  size: number; // in bytes
  type: string;
  src: string; // Data URL or Blob URL
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
  filter: ImageFilterOptions;
  fit: ImageFit;
  customMargin?: PageMargin;
  dateAdded: number;
}

export interface PdfSettings {
  paperSize: PaperSize;
  orientation: PageOrientation;
  defaultFit: ImageFit;
  margin: PageMargin;
  quality: 'high' | 'standard' | 'low'; // 1.0, 0.85, 0.65 compression
  filename: string;
  pageNumbers: PageNumberPosition;
  pageNumberPrefix: string;
  headerText: string;
  footerText: string;
  backgroundColor: string; // hex string e.g. '#ffffff'
  enableOcr?: boolean;
  ocrLanguage?: string;
}

export interface GeneratedPdfHistory {
  id: string;
  filename: string;
  pageCount: number;
  fileSize: number;
  timestamp: Date;
  blobUrl: string;
}

export type ViewMode = 'grid' | 'list';

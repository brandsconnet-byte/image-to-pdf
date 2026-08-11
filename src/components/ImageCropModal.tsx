import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Crop, Check, RefreshCw, Maximize2, Move } from 'lucide-react';
import { ImageItem } from '../types';

interface ImageCropModalProps {
  item: ImageItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCrop: (itemId: string, croppedSrc: string, newWidth: number, newHeight: number, newSize: number) => void;
}

type AspectRatioOption = 'free' | '1:1' | '4:3' | '16:9' | '3:4' | 'a4';

interface CropBox {
  x: number;      // 0 to 1 (percentage of image width)
  y: number;      // 0 to 1 (percentage of image height)
  width: number;  // 0 to 1
  height: number; // 0 to 1
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  item,
  isOpen,
  onClose,
  onSaveCrop,
}) => {
  if (!isOpen || !item) return null;

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Crop box in normalized (0..1) units
  const [crop, setCrop] = useState<CropBox>({ x: 0, y: 0, width: 1, height: 1 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('free');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Active drag handle state
  const [dragMode, setDragMode] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialCrop: CropBox }>({
    mouseX: 0,
    mouseY: 0,
    initialCrop: { x: 0, y: 0, width: 1, height: 1 },
  });

  // Reset crop when item changes or modal opens
  useEffect(() => {
    setCrop({ x: 0, y: 0, width: 1, height: 1 });
    setAspectRatio('free');
  }, [item?.id, isOpen]);

  // Handle aspect ratio selection
  const handleApplyAspectRatio = useCallback((ratioKey: AspectRatioOption) => {
    setAspectRatio(ratioKey);
    if (ratioKey === 'free') return;

    let targetRatio = 1; // width / height
    if (ratioKey === '1:1') targetRatio = 1;
    else if (ratioKey === '4:3') targetRatio = 4 / 3;
    else if (ratioKey === '16:9') targetRatio = 16 / 9;
    else if (ratioKey === '3:4') targetRatio = 3 / 4;
    else if (ratioKey === 'a4') targetRatio = 1 / 1.4142; // standard portrait document ratio

    const imgW = item.width || 800;
    const imgH = item.height || 600;
    const currentImgRatio = imgW / imgH;

    // Calculate normalized box that fits within 0..1
    let w = 0.9;
    let h = (w * imgW) / (targetRatio * imgH);

    if (h > 0.9) {
      h = 0.9;
      w = (h * targetRatio * imgH) / imgW;
    }

    const x = Math.max(0, (1 - w) / 2);
    const y = Math.max(0, (1 - h) / 2);

    setCrop({ x, y, width: Math.min(1, w), height: Math.min(1, h) });
  }, [item]);

  const resetCropBox = () => {
    setCrop({ x: 0, y: 0, width: 1, height: 1 });
    setAspectRatio('free');
  };

  // Drag logic relative to standard image element bounding rect
  const handleMouseDown = (
    e: React.MouseEvent | React.TouchEvent,
    mode: 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragMode(mode);
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      initialCrop: { ...crop },
    };
  };

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragMode || !imgRef.current) return;

      const rect = imgRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = (clientX - dragStartRef.current.mouseX) / rect.width;
      const deltaY = (clientY - dragStartRef.current.mouseY) / rect.height;

      const init = dragStartRef.current.initialCrop;
      const minSize = 0.05; // 5% minimum size

      let newX = init.x;
      let newY = init.y;
      let newW = init.width;
      let newH = init.height;

      if (dragMode === 'move') {
        newX = Math.max(0, Math.min(1 - init.width, init.x + deltaX));
        newY = Math.max(0, Math.min(1 - init.height, init.y + deltaY));
      } else {
        // Handle resizing handles
        if (dragMode.includes('e')) {
          newW = Math.max(minSize, Math.min(1 - init.x, init.width + deltaX));
        }
        if (dragMode.includes('s')) {
          newH = Math.max(minSize, Math.min(1 - init.y, init.height + deltaY));
        }
        if (dragMode.includes('w')) {
          const possibleW = Math.max(minSize, init.width - deltaX);
          newX = Math.max(0, init.x + (init.width - possibleW));
          newW = init.x + init.width - newX;
        }
        if (dragMode.includes('n')) {
          const possibleH = Math.max(minSize, init.height - deltaY);
          newY = Math.max(0, init.y + (init.height - possibleH));
          newH = init.y + init.height - newY;
        }
      }

      setCrop({
        x: Math.max(0, newX),
        y: Math.max(0, newY),
        width: Math.min(1 - newX, newW),
        height: Math.min(1 - newY, newH),
      });
    },
    [dragMode]
  );

  const handlePointerUp = useCallback(() => {
    setDragMode(null);
  }, []);

  useEffect(() => {
    if (dragMode) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [dragMode, handlePointerMove, handlePointerUp]);

  // Execute Canvas Cropping
  const handleSave = async () => {
    if (!item || isProcessing) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = item.src;
      });

      const originalW = img.naturalWidth || item.width || 800;
      const originalH = img.naturalHeight || item.height || 600;

      // Calculate pixel crop coordinates
      const cropPxX = Math.round(crop.x * originalW);
      const cropPxY = Math.round(crop.y * originalH);
      const cropPxW = Math.max(1, Math.round(crop.width * originalW));
      const cropPxH = Math.max(1, Math.round(crop.height * originalH));

      // Offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = cropPxW;
      canvas.height = cropPxH;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Draw cropped section
      ctx.drawImage(
        img,
        cropPxX,
        cropPxY,
        cropPxW,
        cropPxH,
        0,
        0,
        cropPxW,
        cropPxH
      );

      const mimeType = item.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const croppedDataUrl = canvas.toDataURL(mimeType, 0.92);

      // Estimate byte size from data URL
      const base64Length = croppedDataUrl.split(',')[1]?.length || 0;
      const estimatedBytes = Math.round((base64Length * 3) / 4);

      onSaveCrop(item.id, croppedDataUrl, cropPxW, cropPxH, estimatedBytes);
      onClose();
    } catch (err) {
      console.error('Cropping failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate pixel preview info
  const previewPixelW = Math.round(crop.width * (item.width || 800));
  const previewPixelH = Math.round(crop.height * (item.height || 600));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Crop Image / Adjust Margins</h3>
              <p className="text-xs text-slate-500">
                Drag handles or frame box to crop page area
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mr-1">
                Presets:
              </span>
              {[
                { id: 'free', label: 'Freeform' },
                { id: 'a4', label: 'A4 Page' },
                { id: '3:4', label: '3:4 Doc' },
                { id: '1:1', label: '1:1 Square' },
                { id: '4:3', label: '4:3 Photo' },
                { id: '16:9', label: '16:9 Wide' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleApplyAspectRatio(r.id as AspectRatioOption)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    aspectRatio === r.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              onClick={resetCropBox}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors ml-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Full Image</span>
            </button>
          </div>

          {/* Canvas Interactive Crop View Area */}
          <div
            ref={containerRef}
            className="relative w-full bg-slate-900 rounded-2xl p-4 flex items-center justify-center min-h-[340px] max-h-[480px] overflow-hidden"
          >
            <div className="relative inline-block max-w-full max-h-[420px]">
              {/* Base Image */}
              <img
                ref={imgRef}
                src={item.src}
                alt="Crop Target"
                className="max-w-full max-h-[420px] object-contain block pointer-events-none rounded-sm"
              />

              {/* Darkened Overlay mask outside crop area */}
              <div
                className="absolute inset-0 bg-black/55 pointer-events-none"
                style={{
                  clipPath: `polygon(
                    0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
                    ${crop.x * 100}% ${crop.y * 100}%,
                    ${crop.x * 100}% ${(crop.y + crop.height) * 100}%,
                    ${(crop.x + crop.width) * 100}% ${(crop.y + crop.height) * 100}%,
                    ${(crop.x + crop.width) * 100}% ${crop.y * 100}%,
                    ${crop.x * 100}% ${crop.y * 100}%
                  )`,
                }}
              />

              {/* Active Crop Box Overlay */}
              <div
                onMouseDown={(e) => handleMouseDown(e, 'move')}
                onTouchStart={(e) => handleMouseDown(e, 'move')}
                className="absolute border-2 border-indigo-400 shadow-[0_0_0_1px_rgba(255,255,255,0.8)] cursor-move group"
                style={{
                  left: `${crop.x * 100}%`,
                  top: `${crop.y * 100}%`,
                  width: `${crop.width * 100}%`,
                  height: `${crop.height * 100}%`,
                }}
              >
                {/* 3x3 Rule-of-Thirds Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-white/60"></div>
                  <div className="border-r border-b border-white/60"></div>
                  <div className="border-b border-white/60"></div>
                  <div className="border-r border-b border-white/60"></div>
                  <div className="border-r border-b border-white/60"></div>
                  <div className="border-b border-white/60"></div>
                  <div className="border-r border-white/60"></div>
                  <div className="border-r border-white/60"></div>
                  <div></div>
                </div>

                {/* Move Hint Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="bg-slate-900/80 text-white text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
                    <Move className="w-3 h-3" /> Drag box to position
                  </span>
                </div>

                {/* Corner Resizing Handles */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'nw')}
                  onTouchStart={(e) => handleMouseDown(e, 'nw')}
                  className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize shadow-md"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'ne')}
                  onTouchStart={(e) => handleMouseDown(e, 'ne')}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize shadow-md"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'sw')}
                  onTouchStart={(e) => handleMouseDown(e, 'sw')}
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize shadow-md"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'se')}
                  onTouchStart={(e) => handleMouseDown(e, 'se')}
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize shadow-md"
                />

                {/* Edge Resizing Handles */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'n')}
                  onTouchStart={(e) => handleMouseDown(e, 'n')}
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-indigo-600 rounded-full cursor-ns-resize shadow-xs"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 's')}
                  onTouchStart={(e) => handleMouseDown(e, 's')}
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-indigo-600 rounded-full cursor-ns-resize shadow-xs"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'w')}
                  onTouchStart={(e) => handleMouseDown(e, 'w')}
                  className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2 h-6 bg-white border border-indigo-600 rounded-full cursor-ew-resize shadow-xs"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'e')}
                  onTouchStart={(e) => handleMouseDown(e, 'e')}
                  className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2 h-6 bg-white border border-indigo-600 rounded-full cursor-ew-resize shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Size & Pixel Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/60">
            <span>
              Target Crop Dimensions: <strong className="text-slate-800">{previewPixelW} × {previewPixelH} px</strong>
            </span>
            <span>
              Area Retained: <strong className="text-indigo-600">{Math.round(crop.width * crop.height * 100)}%</strong>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Cropping Image...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply Crop</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

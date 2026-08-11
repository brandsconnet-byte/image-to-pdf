import React, { useState, useEffect } from 'react';
import { X, RotateCw, Check, Sliders, Maximize, Crop, Sun, Contrast } from 'lucide-react';
import { ImageItem, ImageFilterType, ImageFit, PageMargin } from '../types';

interface ImageEditModalProps {
  item: ImageItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: ImageItem) => void;
  onOpenCrop?: (item: ImageItem) => void;
}

export const ImageEditModal: React.FC<ImageEditModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  onOpenCrop,
}) => {
  if (!isOpen || !item) return null;

  const [rotation, setRotation] = useState<number>(item.rotation);
  const [filterType, setFilterType] = useState<ImageFilterType>(item.filter.type);
  const [brightness, setBrightness] = useState<number>(item.filter.brightness || 0);
  const [contrast, setContrast] = useState<number>(item.filter.contrast || 0);
  const [fit, setFit] = useState<ImageFit>(item.fit || 'contain');
  const [customMargin, setCustomMargin] = useState<PageMargin | undefined>(item.customMargin);

  useEffect(() => {
    setRotation(item.rotation);
    setFilterType(item.filter.type);
    setBrightness(item.filter.brightness || 0);
    setContrast(item.filter.contrast || 0);
    setFit(item.fit || 'contain');
    setCustomMargin(item.customMargin);
  }, [item]);

  const handleApply = () => {
    onSave({
      ...item,
      rotation,
      filter: {
        type: filterType,
        brightness,
        contrast,
      },
      fit,
      customMargin,
    });
    onClose();
  };

  const filterStyle = () => {
    const parts: string[] = [];
    if (filterType === 'grayscale') parts.push('grayscale(100%)');
    else if (filterType === 'contrast') parts.push('contrast(160%) brightness(105%)');
    else if (filterType === 'sepia') parts.push('sepia(90%)');
    else if (filterType === 'warm') parts.push('sepia(30%) saturate(140%) hue-rotate(-10deg)');
    else if (filterType === 'cool') parts.push('saturate(110%) hue-rotate(15deg)');
    else if (filterType === 'vivid') parts.push('saturate(180%) contrast(110%)');

    if (brightness !== 0) parts.push(`brightness(${100 + brightness}%)`);
    if (contrast !== 0) parts.push(`contrast(${100 + contrast}%)`);

    return parts.length > 0 ? parts.join(' ') : undefined;
  };

  const filterPresets: { type: ImageFilterType; label: string; desc: string }[] = [
    { type: 'none', label: 'Original', desc: 'No filter' },
    { type: 'grayscale', label: 'B&W Scan', desc: 'Document grayscale' },
    { type: 'contrast', label: 'High Contrast', desc: 'Boost receipt text' },
    { type: 'sepia', label: 'Vintage', desc: 'Warm sepia' },
    { type: 'warm', label: 'Warm', desc: 'Soft tone' },
    { type: 'cool', label: 'Cool', desc: 'Cool tone' },
    { type: 'vivid', label: 'Vivid', desc: 'Saturate colors' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Edit Page — <span className="text-indigo-600 truncate max-w-[200px] inline-block align-bottom">{item.name}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-y-auto">
          {/* Left Side: Live Image Preview Canvas */}
          <div className="p-6 bg-slate-100/70 flex flex-col items-center justify-center min-h-[280px] border-r border-slate-100 relative">
            <div className="relative w-full h-full flex items-center justify-center max-h-[360px]">
              <img
                src={item.src}
                alt="Preview"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  filter: filterStyle(),
                }}
                className="max-w-full max-h-64 object-contain rounded-lg shadow-md transition-all duration-200"
              />
            </div>
            
            {onOpenCrop && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCrop(item);
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold shadow-xs transition-colors"
              >
                <Crop className="w-4 h-4 text-indigo-600" />
                <span>Open Crop Tool</span>
              </button>
            )}

            <p className="text-xs text-slate-400 mt-2 text-center">
              Real-time preview of page rendering
            </p>
          </div>

          {/* Right Side: Controls & Sliders */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Rotation Controls */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                Page Rotation
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setRotation(deg)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1 ${
                      rotation === deg
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{deg}°</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Presets */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                Document Enhancement Filter
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filterPresets.map((p) => (
                  <button
                    key={p.type}
                    type="button"
                    onClick={() => setFilterType(p.type)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      filterType === p.type
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{p.label}</span>
                      {filterType === p.type && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fine-Tuning Sliders */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Brightness
                  </span>
                  <span>{brightness > 0 ? `+${brightness}` : brightness}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Contrast className="w-3.5 h-3.5 text-indigo-500" /> Contrast
                  </span>
                  <span>{contrast > 0 ? `+${contrast}` : contrast}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Image Fit & Placement */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                Page Placement Mode
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                {[
                  { id: 'contain', label: 'Fit Page (Proportional)' },
                  { id: 'cover', label: 'Fill Page (Crop Edges)' },
                  { id: 'stretch', label: 'Stretch to Edges' },
                  { id: 'original', label: 'Original Scale' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFit(mode.id as ImageFit)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      fit === mode.id
                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, FileImage, ShieldCheck } from 'lucide-react';
import { LanguageCode, getTranslation } from '../utils/i18n';

interface UploadZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  compact?: boolean;
  currentLanguage?: LanguageCode;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  compact = false,
  currentLanguage = 'en',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (key: string) => getTranslation(currentLanguage, key);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFilesSelected(e.dataTransfer.files);
      }
    },
    [onFilesSelected]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle Clipboard Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData || !e.clipboardData.files.length) return;
      const imageFiles: File[] = [];
      for (let i = 0; i < e.clipboardData.files.length; i++) {
        const file = e.clipboardData.files[i];
        if (file.type.startsWith('image/')) {
          imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  if (compact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/60 shadow-inner'
            : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex items-center justify-center gap-3 text-xs font-semibold text-slate-700">
          <UploadCloud className="w-5 h-5 text-indigo-600" />
          <span>{t('addMoreImagesText')}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed transition-all p-8 sm:p-12 text-center bg-white shadow-xs ${
        isDragOver
          ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99] shadow-md'
          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/30'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="max-w-md mx-auto space-y-6">
        {/* Animated Icon Circle */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80 shadow-xs">
          <UploadCloud className="w-10 h-10 stroke-[1.75]" />
        </div>

        {/* Text Instructions */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('dropZoneTitle')}
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            {t('dropZoneSubtitle')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <FileImage className="w-4 h-4" />
            <span>{t('dropZoneButton')}</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400 border-t border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t('privacyNote')}</span>
        </div>
      </div>
    </div>
  );
};

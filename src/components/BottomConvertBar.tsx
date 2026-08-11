import React from 'react';
import { FileText, Sparkles, Download, Eye, Layers } from 'lucide-react';
import { formatBytes } from '../utils/pdfGenerator';
import { PdfSettings } from '../types';
import { LanguageCode, getTranslation } from '../utils/i18n';

interface BottomConvertBarProps {
  imageCount: number;
  totalBytes: number;
  settings: PdfSettings;
  isGenerating: boolean;
  currentLanguage?: LanguageCode;
  onConvert: () => void;
  onOpenPreview: () => void;
}

export const BottomConvertBar: React.FC<BottomConvertBarProps> = ({
  imageCount,
  totalBytes,
  settings,
  isGenerating,
  currentLanguage = 'en',
  onConvert,
  onOpenPreview,
}) => {
  if (imageCount === 0) return null;

  const t = (key: string) => getTranslation(currentLanguage || 'en', key);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-3xl bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:px-6 sm:py-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-3 sm:gap-6 transition-all duration-300">
      {/* Summary Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white truncate">
              {imageCount} {t('imagesSelected')}
            </span>
            <span className="hidden xs:inline-block px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wide border border-indigo-500/30">
              {(settings?.paperSize || 'a4').toUpperCase()} • {t(settings?.orientation || 'portrait')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            Est. payload: {formatBytes(totalBytes)} • {t('readyToSave')}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenPreview}
          disabled={isGenerating}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 disabled:opacity-50 cursor-pointer"
          title={t('quickPreview')}
        >
          <Eye className="w-4 h-4 text-slate-400" />
          <span>{t('quickPreview')}</span>
        </button>

        <button
          type="button"
          onClick={onConvert}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
              <span>{t('convertPdf')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

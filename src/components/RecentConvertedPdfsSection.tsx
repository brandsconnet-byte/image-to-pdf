import React from 'react';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  FileCheck,
  Maximize2
} from 'lucide-react';
import { GeneratedPdfHistory } from '../types';
import { formatBytes } from '../utils/pdfGenerator';
import { triggerFileDownload } from '../utils/downloadHelper';
import { LanguageCode, getTranslation } from '../utils/i18n';

interface RecentConvertedPdfsSectionProps {
  history: GeneratedPdfHistory[];
  onOpenPreview: (historyItem: GeneratedPdfHistory) => void;
  onOpenLibrary: () => void;
  onDeleteItem: (id: string) => void;
  currentLanguage?: LanguageCode;
}

export const RecentConvertedPdfsSection: React.FC<RecentConvertedPdfsSectionProps> = ({
  history,
  onOpenPreview,
  onOpenLibrary,
  onDeleteItem,
  currentLanguage = 'en',
}) => {
  const t = (key: string) => getTranslation(currentLanguage || 'en', key);

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
          <FileCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800">{t('noPdfsConvertedYet')}</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t('convertImagesFirst')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm shadow-indigo-200 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {t('recentlyConvertedPdfs')}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-[11px]">
                {history.length}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Preview, inspect, or download your newly created PDF files directly
            </p>
          </div>
        </div>

        <button
          onClick={onOpenLibrary}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <span>{t('viewAllPdfs')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Converted PDFs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className="group relative bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between gap-3"
          >
            {/* Top row */}
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                PDF
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={item.filename}>
                  {item.filename}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span className="font-semibold bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                    {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
                  </span>
                  <span>•</span>
                  <span>{formatBytes(item.fileSize)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs gap-2">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                <Clock className="w-3 h-3 shrink-0" />
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onOpenPreview(item)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Preview PDF"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={async () => {
                    await triggerFileDownload(item.blobUrl, item.filename);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  title="Download PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete from list"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

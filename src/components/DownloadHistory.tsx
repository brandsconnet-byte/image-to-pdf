import React from 'react';
import { X, FileText, Download, Trash2, Clock, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import { GeneratedPdfHistory } from '../types';
import { formatBytes } from '../utils/pdfGenerator';
import { triggerFileDownload } from '../utils/downloadHelper';
import { LanguageCode, getTranslation } from '../utils/i18n';

interface DownloadHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedPdfHistory[];
  onClearHistory: () => void;
  onPreviewHistoryItem?: (item: GeneratedPdfHistory) => void;
  currentLanguage?: LanguageCode;
}

export const DownloadHistory: React.FC<DownloadHistoryProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onPreviewHistoryItem,
  currentLanguage = 'en',
}) => {
  if (!isOpen) return null;

  const t = (key: string) => getTranslation(currentLanguage, key);

  const handleDownloadItem = async (item: GeneratedPdfHistory) => {
    await triggerFileDownload(item.blobUrl, item.filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t('downloadHistoryTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('savedPdfs')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-300 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-700">{t('noPdfsHistory')}</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {t('historyDescription')}
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-extrabold text-xs">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate" title={item.filename}>
                        {item.filename}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{item.pageCount} {item.pageCount === 1 ? t('page') : t('pages')}</span>
                        <span>•</span>
                        <span>{formatBytes(item.fileSize)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-2">
                    {onPreviewHistoryItem && (
                      <button
                        onClick={() => onPreviewHistoryItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('preview')}</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadItem(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t('saveToDevice')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Clear Action */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {history.length} {history.length === 1 ? 'PDF' : 'PDFs'}
            </span>
            <button
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('clearHistory')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

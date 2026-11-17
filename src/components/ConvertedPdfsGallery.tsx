import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Search,
  ExternalLink,
  Sparkles,
  Clock,
  CheckCircle2,
  FileCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Maximize2
} from 'lucide-react';
import { GeneratedPdfHistory } from '../types';
import { formatBytes } from '../utils/pdfGenerator';
import { triggerFileDownload } from '../utils/downloadHelper';
import { LanguageCode, getTranslation } from '../utils/i18n';

interface ConvertedPdfsGalleryProps {
  history: GeneratedPdfHistory[];
  onClearHistory: () => void;
  onDeleteItem?: (id: string) => void;
  onOpenFullPreview: (item: GeneratedPdfHistory) => void;
  onNavigateToUpload: () => void;
  currentLanguage?: LanguageCode;
  onOpenProModal?: () => void;
}

export const ConvertedPdfsGallery: React.FC<ConvertedPdfsGalleryProps> = ({
  history,
  onClearHistory,
  onDeleteItem,
  onOpenFullPreview,
  onNavigateToUpload,
  currentLanguage = 'en',
  onOpenProModal,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    history.length > 0 ? history[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const t = (key: string) => getTranslation(currentLanguage, key);

  // Filter history by search query
  const filteredHistory = history.filter((item) =>
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItem =
    history.find((item) => item.id === selectedId) ||
    filteredHistory[0] ||
    history[0] ||
    null;

  const handleDownload = async (item: GeneratedPdfHistory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await triggerFileDownload(item.blobUrl, item.filename);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-30 -top-10 w-48 h-48 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateToUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('backToStudio')}</span>
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>PDF Hub & Viewer</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('convertedPdfsTitle')}
            </h2>
            <p className="text-sm text-indigo-200/90 max-w-xl">
              {t('convertedPdfsSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 cursor-pointer backdrop-blur-xs flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4 text-red-300" />
                <span>{t('clearHistory')}</span>
              </button>
            )}

            <button
              onClick={onNavigateToUpload}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-indigo-600/40 cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>+ Convert More Images</span>
            </button>
          </div>
        </div>
      </div>

      {history.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <FileCheck className="w-10 h-10 stroke-[1.75]" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900">{t('noPdfsConvertedYet')}</h3>
            <p className="text-sm text-slate-500">{t('convertImagesFirst')}</p>
          </div>
          <button
            onClick={onNavigateToUpload}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <span>Upload Images Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Split Layout: Gallery List & Interactive PDF Viewer Stage */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: List of Converted PDFs */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPdfs')}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
            </div>

            {/* List Cards */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredHistory.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-xs shadow-xs transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                          }`}
                        >
                          PDF
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={item.filename}>
                            {item.filename}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <span className="font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
                            </span>
                            <span>•</span>
                            <span className="font-semibold">{formatBytes(item.fileSize)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenFullPreview(item);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          title="Inspect Fullscreen"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={(e) => handleDownload(item, e)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                          title="Save to local device"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Embedded PDF Viewer */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4 sticky top-20">
            {selectedItem ? (
              <div className="space-y-4">
                {/* Viewer Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {selectedItem.filename}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {selectedItem.pageCount} Pages • {formatBytes(selectedItem.fileSize)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenFullPreview(selectedItem)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Fullscreen</span>
                    </button>

                    <button
                      onClick={() => handleDownload(selectedItem)}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                {/* Embedded PDF Viewer Box */}
                <div className="w-full h-[520px] rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden relative flex items-center justify-center">
                  <object
                    data={selectedItem.blobUrl}
                    type="application/pdf"
                    className="w-full h-full rounded-2xl"
                  >
                    <div className="p-8 text-center text-slate-300 space-y-3">
                      <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
                      <p className="text-sm font-bold">Preview available</p>
                      <button
                        onClick={() => handleDownload(selectedItem)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                      >
                        Download PDF to View
                      </button>
                    </div>
                  </object>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 space-y-2">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">{t('selectPdfToView')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buy Me a Coffee & Support Pro Card */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-7 h-7 text-amber-200" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Enjoying ImageToPDF? Buy us a coffee!</h3>
            <p className="text-xs text-amber-100/90 mt-0.5">
              Support further development or unlock Lifetime Pro access for just $5 USD.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (onOpenProModal) onOpenProModal();
          }}
          className="px-6 py-3 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <span>☕ Buy Coffee / Unlock Pro ($5)</span>
          <ArrowRight className="w-4 h-4 text-indigo-600" />
        </button>
      </div>
    </div>
  );
};

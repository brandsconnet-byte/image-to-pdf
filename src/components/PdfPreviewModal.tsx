import React, { useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Eye,
  RotateCcw,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { ImageItem, PdfSettings } from '../types';
import { LanguageCode, getTranslation } from '../utils/i18n';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blobUrl: string | null;
  filename: string;
  pageCount: number;
  items?: ImageItem[];
  settings?: PdfSettings;
  currentLanguage?: LanguageCode;
  onDownload: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  blobUrl,
  filename,
  pageCount,
  items = [],
  settings,
  currentLanguage = 'en',
  onDownload,
}) => {
  if (!isOpen || !blobUrl) return null;

  const [activeTab, setActiveTab] = useState<'visual' | 'native'>('visual');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(items.length > 1);

  const t = (key: string) => getTranslation(currentLanguage || 'en', key);

  const fullFilename = filename.trim().endsWith('.pdf') ? filename.trim() : `${filename.trim()}.pdf`;
  const totalPages = Math.max(1, pageCount || items.length);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const currentItem = items[currentPage] || items[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
        {/* Streamlined Un-crowded Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/95 border-b border-slate-800 text-white shrink-0 gap-3">
          {/* Left: Document Identity & Back Button */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-100 truncate max-w-xs sm:max-w-md">
                {fullFilename}
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span className="bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">PDF</span>
                <span>•</span>
                <span>{totalPages} {totalPages === 1 ? t('page') : t('pages')}</span>
              </p>
            </div>
          </div>

          {/* Center: Mode Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('visual')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('layoutView')}</span>
            </button>
            <button
              onClick={() => setActiveTab('native')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'native'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('pdfView')}</span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {items.length > 1 && activeTab === 'visual' && (
              <button
                onClick={() => setShowThumbnails((prev) => !prev)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-semibold ${
                  showThumbnails
                    ? 'bg-slate-800 text-indigo-400 border-indigo-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Toggle Page Navigation Drawer"
              >
                <Layers className="w-4 h-4" />
                <span>Pages</span>
              </button>
            )}

            <button
              onClick={onDownload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('saveToDevice')}</span>
              <span className="sm:hidden">Save</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Container */}
        <div className="flex-1 bg-slate-950 overflow-hidden flex relative">
          {/* Optional Left Sidebar Page Thumbnails */}
          {showThumbnails && activeTab === 'visual' && items.length > 1 && (
            <div className="w-48 bg-slate-900/90 border-r border-slate-800 p-3 overflow-y-auto space-y-2.5 shrink-0 hidden sm:block animate-in slide-in-from-left duration-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
                Document Pages ({items.length})
              </div>
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(idx)}
                  className={`w-full group p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    currentPage === idx
                      ? 'bg-indigo-950/80 border-indigo-500 ring-1 ring-indigo-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <div className="w-full h-24 rounded-lg bg-slate-950 overflow-hidden border border-slate-800/60 flex items-center justify-center p-1">
                    <img
                      src={item.src}
                      alt={`Page ${idx + 1}`}
                      className="max-w-full max-h-full object-contain"
                      style={{ transform: `rotate(${item.rotation || 0}deg)` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold">
                    Page {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Main Stage Viewport */}
          <div className="flex-1 p-4 sm:p-8 overflow-auto flex items-center justify-center relative">
            {activeTab === 'visual' ? (
              <div className="flex flex-col items-center justify-center my-auto transition-transform duration-200 py-4">
                {/* Clean Paper Sheet */}
                <div
                  className="relative bg-white shadow-2xl rounded-sm border border-slate-200/80 overflow-hidden flex flex-col justify-between transition-all"
                  style={{
                    width: `min(100%, ${(540 * (zoomLevel / 100))}px)`,
                    minHeight: `${(680 * (zoomLevel / 100))}px`,
                    backgroundColor: settings?.backgroundColor || '#ffffff',
                    padding:
                      settings?.margin === 'none'
                        ? '0px'
                        : settings?.margin === 'small'
                        ? '16px'
                        : settings?.margin === 'large'
                        ? '36px'
                        : '24px',
                  }}
                >
                  {/* Header text simulation */}
                  {settings?.headerText && (
                    <div className="text-[11px] text-slate-400 font-sans tracking-tight mb-2 border-b border-slate-100 pb-1 text-center">
                      {settings.headerText}
                    </div>
                  )}

                  {/* Main Image content */}
                  <div className="flex-1 flex items-center justify-center overflow-hidden relative min-h-[300px]">
                    {currentItem ? (
                      <img
                        src={currentItem.src}
                        alt={`Page ${currentPage + 1}`}
                        className="max-w-full max-h-[500px] object-contain transition-all duration-200 rounded-xs"
                        style={{
                          transform: `rotate(${currentItem.rotation || 0}deg)`,
                          filter:
                            currentItem.filter?.type === 'grayscale'
                              ? 'grayscale(100%)'
                              : currentItem.filter?.type === 'contrast'
                              ? 'contrast(160%)'
                              : currentItem.filter?.type === 'sepia'
                              ? 'sepia(90%)'
                              : 'none',
                        }}
                      />
                    ) : (
                      <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                        <FileText className="w-10 h-10 opacity-40" />
                        <span>{t('layoutView')}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer text & Page numbering simulation */}
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{settings?.footerText || ''}</span>
                    <span>
                      {settings?.pageNumbers !== 'none'
                        ? `${settings?.pageNumberPrefix || 'Page '} ${currentPage + 1} of ${totalPages}`
                        : ''}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <object
                  data={blobUrl}
                  type="application/pdf"
                  className="w-full h-full rounded-2xl border border-slate-800 bg-white"
                >
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900 text-slate-300 space-y-4">
                    <FileText className="w-16 h-16 text-indigo-400 animate-bounce" />
                    <h4 className="text-lg font-bold text-white">{t('readyToSave')}</h4>
                    <button
                      onClick={onDownload}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md cursor-pointer"
                    >
                      {t('saveToDevice')}
                    </button>
                  </div>
                </object>
              </div>
            )}

            {/* Un-crowded Floating Dock Controls (Bottom Center) */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl text-xs text-slate-300">
              {/* Page Navigation */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('prevPage')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-1.5 font-bold text-slate-100 text-xs">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('nextPage')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-slate-700/80 mx-1" />

              {/* Zoom Controls */}
              <button
                onClick={() => setZoomLevel((z) => Math.max(60, z - 20))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title={t('zoomOut')}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-mono font-bold text-indigo-300 text-[11px]">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(180, z + 20))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title={t('zoomIn')}
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {zoomLevel !== 100 && (
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="w-px h-4 bg-slate-700/80 mx-1 hidden xs:block" />

              {/* Open Raw PDF Tab */}
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xs:inline-flex items-center gap-1 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title={t('openInNewTab')}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { FileText, Download, Trash2, Eye, Plus, Layers, Home, Sparkles } from 'lucide-react';
import { formatBytes } from '../utils/pdfGenerator';
import { LanguageCode, getTranslation } from '../utils/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  imageCount: number;
  totalBytes: number;
  activeTab?: 'editor' | 'converted';
  onTabChange?: (tab: 'editor' | 'converted') => void;
  onGoBack?: () => void;
  onClearAll: () => void;
  onOpenPreview: () => void;
  onGeneratePdf: () => void;
  isGenerating: boolean;
  historyCount: number;
  onToggleHistory: () => void;
  onAddMoreImages: () => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenProModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  imageCount,
  totalBytes,
  activeTab = 'editor',
  onTabChange,
  onClearAll,
  onOpenPreview,
  onGeneratePdf,
  isGenerating,
  historyCount,
  onAddMoreImages,
  currentLanguage,
  onLanguageChange,
  onOpenProModal,
}) => {
  const t = (key: string) => getTranslation(currentLanguage, key);

  const handleHomeClick = () => {
    if (onTabChange) {
      onTabChange('editor');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Home Link */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
            title="Go to Homepage"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                  {t('appTitle')}
                </h1>
                <span className="hidden xs:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden md:block">
                {t('appSubtitle')}
              </p>
            </div>
          </button>
        </div>

        {/* Center: Clean Nav Pills */}
        {onTabChange && (
          <nav className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => onTabChange('editor')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('converterTab')}</span>
              {imageCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold">
                  {imageCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('converted')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'converted'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('convertedPdfsTab')}</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>
        )}

        {/* Right: Focused Action Area */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'converted' ? (
            <button
              onClick={() => onTabChange && onTabChange('editor')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Convert New Images</span>
            </button>
          ) : (
            <>
              {imageCount > 0 && (
                <>
                  <button
                    onClick={onAddMoreImages}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer hidden sm:block"
                    title={t('addImages')}
                  >
                    <Plus className="w-4.5 h-4.5" />
                  </button>

                  <button
                    onClick={onClearAll}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title={t('clearAll')}
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>

                  <button
                    onClick={onOpenPreview}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer hidden md:block"
                    title={t('preview')}
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </button>

                  <button
                    onClick={onGeneratePdf}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span className="hidden xs:inline">{t('convertPdf')}</span>
                  </button>
                </>
              )}
            </>
          )}

          {/* Upgrade Pro ($5) Button */}
          <button
            onClick={onOpenProModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer animate-pulse"
            title="Unlock Lifetime Pro for $5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pro $5</span>
          </button>

          {/* Language Selector */}
          <LanguageSwitcher
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />
        </div>
      </div>
    </header>
  );
};


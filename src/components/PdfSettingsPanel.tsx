import React from 'react';
import {
  FileText,
  Sliders,
  Maximize2,
  FileSpreadsheet,
  Palette,
  AlignLeft,
  Sparkles,
  Info,
  Check,
  Download,
  ScanText,
  Globe
} from 'lucide-react';
import { PdfSettings, PaperSize, PageOrientation, ImageFit, PageMargin, PageNumberPosition } from '../types';
import { LanguageCode, getTranslation } from '../utils/i18n';

interface PdfSettingsPanelProps {
  settings: PdfSettings;
  onChange: (newSettings: PdfSettings) => void;
  onReset: () => void;
  onConvert?: () => void;
  isGenerating?: boolean;
  currentLanguage?: LanguageCode;
}

export const PdfSettingsPanel: React.FC<PdfSettingsPanelProps> = ({
  settings,
  onChange,
  onReset,
  onConvert,
  isGenerating = false,
  currentLanguage = 'en',
}) => {
  const t = (key: string) => getTranslation(currentLanguage, key);

  const handleChange = <K extends keyof PdfSettings>(field: K, value: PdfSettings[K]) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t('pdfDocSettings')}
          </h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          {t('resetDefaults')}
        </button>
      </div>

      {/* 1. Paper Size & Orientation */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-700 block">
          {t('pageSize')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'a4', label: 'A4', desc: '210×297 mm' },
            { id: 'letter', label: 'US Letter', desc: '8.5×11 in' },
            { id: 'legal', label: 'Legal', desc: '8.5×14 in' },
            { id: 'a3', label: 'A3', desc: '297×420 mm' },
            { id: 'a5', label: 'A5', desc: '148×210 mm' },
            { id: 'fit', label: t('fitContain'), desc: 'Custom' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleChange('paperSize', item.id as PaperSize)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                settings.paperSize === item.id
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500 font-semibold'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="text-xs font-bold truncate">{item.label}</div>
              <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Orientation & Margins */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            {t('orientation')}
          </label>
          <select
            value={settings.orientation}
            onChange={(e) => handleChange('orientation', e.target.value as PageOrientation)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="auto">{t('autoOrientation')}</option>
            <option value="portrait">{t('portrait')}</option>
            <option value="landscape">{t('landscape')}</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            {t('margins')}
          </label>
          <select
            value={settings.margin}
            onChange={(e) => handleChange('margin', e.target.value as PageMargin)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="none">{t('none')} (0 mm)</option>
            <option value="small">{t('small')} (5 mm)</option>
            <option value="normal">{t('medium')} (10 mm)</option>
            <option value="large">{t('large')} (20 mm)</option>
          </select>
        </div>
      </div>

      {/* 3. Compression & Quality */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 block">
          {t('quality')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'high', label: '100%', desc: 'Crisp' },
            { id: 'standard', label: '85%', desc: 'Balanced' },
            { id: 'low', label: '65%', desc: 'Compact' },
          ].map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => handleChange('quality', q.id as any)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                settings.quality === q.id
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500 font-semibold'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="text-xs font-bold">{q.label}</div>
              <div className="text-[10px] text-slate-400">{q.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* OCR (Optical Character Recognition) Section */}
      <div className="pt-3 border-t border-slate-100 space-y-2.5">
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={!!settings.enableOcr}
            onChange={(e) => handleChange('enableOcr', e.target.checked)}
            className="mt-0.5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              <ScanText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{t('enableOcr')}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              {t('ocrSubtitle')}
            </p>
          </div>
        </label>

        {settings.enableOcr && (
          <div className="pl-6 pt-1 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{t('ocrLanguage')}</span>
            </label>
            <select
              value={settings.ocrLanguage || 'eng'}
              onChange={(e) => handleChange('ocrLanguage', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="eng">English (eng)</option>
              <option value="spa">Spanish (spa)</option>
              <option value="fra">French (fra)</option>
              <option value="deu">German (deu)</option>
              <option value="por">Portuguese (por)</option>
              <option value="ita">Italian (ita)</option>
              <option value="jpn">Japanese (jpn)</option>
              <option value="chi_sim">Chinese Simplified (chi_sim)</option>
              <option value="ara">Arabic (ara)</option>
              <option value="rus">Russian (rus)</option>
            </select>
          </div>
        )}
      </div>

      {/* 4. Page Numbering & Header/Footer */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 block">
          {t('pageNumbers')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[11px] text-slate-500 mb-1 block">{t('pageNumbers')}</span>
            <select
              value={settings.pageNumbers}
              onChange={(e) => handleChange('pageNumbers', e.target.value as PageNumberPosition)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 cursor-pointer"
            >
              <option value="none">{t('none')}</option>
              <option value="bottom-center">{t('bottomCenter')}</option>
              <option value="bottom-right">{t('bottomRight')}</option>
            </select>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 mb-1 block">{t('filename')}</span>
            <input
              type="text"
              value={settings.filename}
              onChange={(e) => handleChange('filename', e.target.value)}
              placeholder="my_document"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[11px] text-slate-500 mb-1 block">{t('headerText')}</span>
            <input
              type="text"
              value={settings.headerText}
              onChange={(e) => handleChange('headerText', e.target.value)}
              placeholder="Project 2026"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <span className="text-[11px] text-slate-500 mb-1 block">{t('footerText')}</span>
            <input
              type="text"
              value={settings.footerText}
              onChange={(e) => handleChange('footerText', e.target.value)}
              placeholder="Confidential"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* 5. Output Filename & Action */}
      <div className="pt-2 border-t border-slate-100">
        {onConvert && (
          <button
            type="button"
            onClick={onConvert}
            disabled={isGenerating}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>{t('convertAndDownload')}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

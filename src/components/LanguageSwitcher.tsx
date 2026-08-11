import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LanguageCode, languageOptions } from '../utils/i18n';

interface LanguageSwitcherProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOpt = languageOptions.find((opt) => opt.code === currentLanguage) || languageOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: LanguageCode, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLanguageChange(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all border border-slate-200/90 cursor-pointer shadow-xs active:scale-95"
        title="Switch Interface Language"
      >
        <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
        <span className="text-base leading-none">{selectedOpt.flag}</span>
        <span className="hidden md:inline text-xs font-bold text-slate-800">{selectedOpt.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-[100] animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
            <span>Language / Idioma</span>
            <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">10 Available</span>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {languageOptions.map((opt) => {
              const isSelected = opt.code === currentLanguage;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={(e) => handleSelectLanguage(opt.code, e)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{opt.flag}</span>
                    <span className="text-xs font-semibold">{opt.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

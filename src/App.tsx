/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ImageList } from './components/ImageList';
import { PdfSettingsPanel } from './components/PdfSettingsPanel';
import { ImageEditModal } from './components/ImageEditModal';
import { ImageCropModal } from './components/ImageCropModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { DownloadHistory } from './components/DownloadHistory';
import { BottomConvertBar } from './components/BottomConvertBar';
import { ConvertedPdfsGallery } from './components/ConvertedPdfsGallery';
import { RecentConvertedPdfsSection } from './components/RecentConvertedPdfsSection';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { ImageItem, PdfSettings, ViewMode, GeneratedPdfHistory, ImageFilterType } from './types';
import { LanguageCode } from './utils/i18n';
import { generatePdf } from './utils/pdfGenerator';
import { triggerFileDownload } from './utils/downloadHelper';
import { FileText, Sliders, Layers, Check, AlertCircle, Sparkles, FileCheck, ArrowRight } from 'lucide-react';

const DEFAULT_SETTINGS: PdfSettings = {
  paperSize: 'a4',
  orientation: 'auto',
  defaultFit: 'contain',
  margin: 'normal',
  quality: 'high',
  filename: 'converted_images',
  pageNumbers: 'bottom-center',
  pageNumberPrefix: 'Page',
  headerText: '',
  footerText: '',
  backgroundColor: '#ffffff',
  enableOcr: false,
  ocrLanguage: 'eng',
};

export default function App() {
  const [mainTab, setMainTab] = useState<'editor' | 'converted'>('editor');
  const [lastTab, setLastTab] = useState<'editor' | 'converted'>('editor');

  const handleTabChange = useCallback((newTab: 'editor' | 'converted') => {
    setMainTab((prev) => {
      if (prev !== newTab) {
        setLastTab(prev);
      }
      return newTab;
    });
  }, []);

  const handleGoBack = useCallback(() => {
    setMainTab((prev) => {
      const target = lastTab === prev ? (prev === 'converted' ? 'editor' : 'converted') : lastTab;
      setLastTab(prev);
      return target;
    });
  }, [lastTab]);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [settings, setSettings] = useState<PdfSettings>(DEFAULT_SETTINGS);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{ percent: number; message: string } | null>(null);

  const [editingItem, setEditingItem] = useState<ImageItem | null>(null);
  const [croppingItem, setCroppingItem] = useState<ImageItem | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [history, setHistory] = useState<GeneratedPdfHistory[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<'pages' | 'settings'>('pages');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check for successful payment return from Polar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast('🎉 Pro Unlocked Successfully! Thank you for your support!');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Helper to process uploaded File objects into ImageItem models
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const newItems: ImageItem[] = [];
    const now = Date.now();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const url = URL.createObjectURL(file);

      // Measure image dimensions
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ width: 800, height: 600 });
        img.src = url;
      });

      newItems.push({
        id: `img-${now}-${i}-${Math.random().toString(36).substr(2, 6)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        src: url,
        width: dimensions.width,
        height: dimensions.height,
        rotation: 0,
        filter: { type: 'none', brightness: 0, contrast: 0 },
        fit: 'contain',
        dateAdded: now + i,
      });
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      showToast(`Added ${newItems.length} image ${newItems.length === 1 ? 'file' : 'files'}`);
    }
  }, []);

  const handleClearAll = useCallback(() => {
    if (items.length === 0) return;
    if (confirm('Are you sure you want to clear all images?')) {
      // Revoke URLs to free memory
      items.forEach((item) => {
        if (item.src.startsWith('blob:')) {
          URL.revokeObjectURL(item.src);
        }
      });
      setItems([]);
      setSelectedIds([]);
      showToast('Cleared all pages');
    }
  }, [items]);

  // Selection handlers
  const handleSelectToggle = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(items.map((item) => item.id));
  }, [items]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Single Item modifications
  const handleRotateItem = useCallback((id: string, degrees: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newRot = (item.rotation + degrees + 360) % 360;
          return { ...item, rotation: newRot };
        }
        return item;
      })
    );
  }, []);

  const handleRotateSelected = useCallback((degrees: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (selectedIds.includes(item.id)) {
          const newRot = (item.rotation + degrees + 360) % 360;
          return { ...item, rotation: newRot };
        }
        return item;
      })
    );
    showToast(`Rotated ${selectedIds.length} pages`);
  }, [selectedIds]);

  const handleApplyFilterSelected = useCallback((filterType: ImageFilterType) => {
    setItems((prev) =>
      prev.map((item) => {
        if (selectedIds.includes(item.id)) {
          return {
            ...item,
            filter: { ...item.filter, type: filterType },
          };
        }
        return item;
      })
    );
    showToast(`Applied ${filterType} filter to selected pages`);
  }, [selectedIds]);

  const handleDeleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    showToast(`Deleted ${selectedIds.length} pages`);
    setSelectedIds([]);
  }, [selectedIds]);

  // Reordering Logic
  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setItems((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setItems((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  }, []);

  const handleReorder = useCallback((dragIndex: number, hoverIndex: number) => {
    setItems((prev) => {
      const result = [...prev];
      const [removed] = result.splice(dragIndex, 1);
      result.splice(hoverIndex, 0, removed);
      return result;
    });
  }, []);

  const handleSort = useCallback((sortType: 'name-asc' | 'name-desc' | 'size' | 'date') => {
    setItems((prev) => {
      const sorted = [...prev];
      if (sortType === 'name-asc') {
        sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      } else if (sortType === 'name-desc') {
        sorted.sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true }));
      } else if (sortType === 'size') {
        sorted.sort((a, b) => b.size - a.size);
      } else if (sortType === 'date') {
        sorted.sort((a, b) => a.dateAdded - b.dateAdded);
      }
      return sorted;
    });
    showToast('Reordered pages');
  }, []);

  const handleReverseOrder = useCallback(() => {
    setItems((prev) => [...prev].reverse());
    showToast('Reversed page sequence');
  }, []);

  // Update Item from Edit Modal
  const handleSaveEditedItem = useCallback((updatedItem: ImageItem) => {
    setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    showToast(`Updated ${updatedItem.name}`);
  }, []);

  // Update Item from Crop Modal
  const handleSaveCroppedItem = useCallback(
    (itemId: string, croppedSrc: string, newWidth: number, newHeight: number, newSize: number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                src: croppedSrc,
                width: newWidth,
                height: newHeight,
                size: newSize,
              }
            : item
        )
      );
      showToast('Image cropped successfully');
    },
    []
  );

  // Trigger saving PDF to user's device
  const handleDownloadPdf = useCallback(
    async (targetUrl?: string, targetFilename?: string) => {
      const urlToSave = targetUrl || previewBlobUrl;
      if (!urlToSave) return;

      const nameToUse = targetFilename || settings.filename;
      const actualFilename = nameToUse.trim()
        ? nameToUse.trim().endsWith('.pdf')
          ? nameToUse.trim()
          : `${nameToUse.trim()}.pdf`
        : 'converted_images.pdf';

      const success = await triggerFileDownload(urlToSave, actualFilename);
      if (success) {
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
        showToast(`Saved ${actualFilename} to local device!`);
      } else {
        showToast(`Opened ${actualFilename} in download window`);
      }
    },
    [previewBlobUrl, settings.filename, showToast]
  );

  // Generate & Download PDF Logic (Defaults to opening preview modal first as requested)
  const handleGeneratePdf = async (openPreviewFirst = true) => {
    if (items.length === 0) {
      showToast('Please upload or select at least one image.');
      return;
    }

    setIsGenerating(true);
    setProgress({ percent: 5, message: 'Starting PDF conversion...' });

    try {
      const { blob, blobUrl } = await generatePdf(items, settings, (percent, message) => {
        setProgress({ percent, message });
      });

      const actualFilename = settings.filename.trim()
        ? settings.filename.trim().endsWith('.pdf')
          ? settings.filename.trim()
          : `${settings.filename.trim()}.pdf`
        : 'converted_images.pdf';

      // Save to Session History
      const newHistoryItem: GeneratedPdfHistory = {
        id: `pdf-${Date.now()}`,
        filename: actualFilename,
        pageCount: items.length,
        fileSize: blob.size,
        timestamp: new Date(),
        blobUrl,
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
      setPreviewBlobUrl(blobUrl);

      if (openPreviewFirst) {
        setIsPreviewOpen(true);
        showToast(`PDF conversion complete! Preview ready.`);
      } else {
        await handleDownloadPdf(blobUrl, actualFilename);
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Error generating PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  const totalBytes = items.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        imageCount={items.length}
        totalBytes={totalBytes}
        activeTab={mainTab}
        onTabChange={handleTabChange}
        onGoBack={handleGoBack}
        onClearAll={handleClearAll}
        onOpenPreview={() => handleGeneratePdf(true)}
        onGeneratePdf={() => handleGeneratePdf(false)}
        isGenerating={isGenerating}
        historyCount={history.length}
        onToggleHistory={() => handleTabChange('converted')}
        onAddMoreImages={() => {
          const el = document.getElementById('hidden-file-input');
          if (el) el.click();
        }}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onOpenProModal={() => setIsProModalOpen(true)}
      />

      {/* Hidden File Input for header button */}
      <input
        id="hidden-file-input"
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
            e.target.value = '';
          }
        }}
        className="hidden"
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Progress Bar overlay if generating */}
        {isGenerating && progress && (
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl p-4 shadow-xl flex items-center gap-4 animate-fade-in border border-indigo-400/30">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>{progress.message}</span>
                <span>{progress.percent}%</span>
              </div>
              <div className="w-full bg-indigo-950/40 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-200 rounded-full shadow-xs"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Workspace Tab Content */}
        {mainTab === 'converted' ? (
          <ConvertedPdfsGallery
            history={history}
            onClearHistory={() => setHistory([])}
            onDeleteItem={(id) => setHistory((prev) => prev.filter((h) => h.id !== id))}
            onOpenFullPreview={(historyItem) => {
              setPreviewBlobUrl(historyItem.blobUrl);
              setIsPreviewOpen(true);
            }}
            onNavigateToUpload={() => handleTabChange('editor')}
            currentLanguage={currentLanguage}
            onOpenProModal={() => setIsProModalOpen(true)}
          />
        ) : (
          <div className="space-y-8">
            {items.length === 0 ? (
              /* Empty State: Upload Zone & Frontpage Pro Banner */
              <div className="max-w-3xl mx-auto py-4 space-y-8">
                <UploadZone
                  onFilesSelected={processFiles}
                  currentLanguage={currentLanguage}
                />

                {/* Frontpage Pro Feature Banner */}
                <div className="bg-gradient-to-r from-indigo-900 via-violet-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-indigo-500/30 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30 shadow-inner">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold">ImageToPDF PRO Lifetime Pass</h3>
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black">
                          $5 USD
                        </span>
                      </div>
                      <p className="text-xs text-indigo-200 mt-0.5">
                        Unlock unlimited batch conversion, OCR text search, and priority support forever.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsProModalOpen(true)}
                    className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 relative z-10"
                  >
                    <span>Upgrade to PRO</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Main Dashboard Layout: Split View on Desktop */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Mobile Tab Switcher */}
                <div className="flex lg:hidden bg-slate-200/80 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => setActiveMobileTab('pages')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      activeMobileTab === 'pages' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Pages ({items.length})
                  </button>
                  <button
                    onClick={() => setActiveMobileTab('settings')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      activeMobileTab === 'settings' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    PDF Settings
                  </button>
                </div>

                {/* Left Column: Image List & Reordering */}
                <div
                  className={`lg:col-span-8 space-y-4 ${
                    activeMobileTab === 'pages' ? 'block' : 'hidden lg:block'
                  }`}
                >
                  <ImageList
                    items={items}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    selectedIds={selectedIds}
                    onSelectToggle={handleSelectToggle}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                    onRotateItem={handleRotateItem}
                    onRotateSelected={handleRotateSelected}
                    onApplyFilterSelected={handleApplyFilterSelected}
                    onDeleteSelected={handleDeleteSelected}
                    onEditModal={(item) => setEditingItem(item)}
                    onCropModal={(item) => setCroppingItem(item)}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onDelete={handleDeleteItem}
                    onReorder={handleReorder}
                    onSort={handleSort}
                    onReverseOrder={handleReverseOrder}
                    onAddMoreImages={() => {
                      const el = document.getElementById('hidden-file-input');
                      if (el) el.click();
                    }}
                    currentLanguage={currentLanguage}
                  />

                  {/* Compact drop area to add more files to existing list */}
                  <UploadZone
                    onFilesSelected={processFiles}
                    compact={true}
                    currentLanguage={currentLanguage}
                  />
                </div>

                {/* Right Column: PDF Settings Panel */}
                <div
                  className={`lg:col-span-4 sticky top-20 ${
                    activeMobileTab === 'settings' ? 'block' : 'hidden lg:block'
                  }`}
                >
                  <PdfSettingsPanel
                    settings={settings}
                    onChange={setSettings}
                    onReset={() => setSettings(DEFAULT_SETTINGS)}
                    onConvert={() => handleGeneratePdf(true)}
                    isGenerating={isGenerating}
                    currentLanguage={currentLanguage}
                  />
                </div>
              </div>
            )}

            {/* Front Page Converted PDFs Showcase Section */}
            {history.length > 0 && (
              <div className="max-w-7xl mx-auto pt-2">
                <RecentConvertedPdfsSection
                  history={history}
                  onOpenPreview={(historyItem) => {
                    setPreviewBlobUrl(historyItem.blobUrl);
                    setIsPreviewOpen(true);
                  }}
                  onOpenLibrary={() => handleTabChange('converted')}
                  onDeleteItem={(id) => setHistory((prev) => prev.filter((h) => h.id !== id))}
                  currentLanguage={currentLanguage}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Convert Action Bar when images are uploaded */}
      <BottomConvertBar
        imageCount={items.length}
        totalBytes={totalBytes}
        settings={settings}
        isGenerating={isGenerating}
        currentLanguage={currentLanguage}
        onConvert={() => handleGeneratePdf(true)}
        onOpenPreview={() => handleGeneratePdf(true)}
      />

      {/* Edit Page Modal */}
      <ImageEditModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEditedItem}
        onOpenCrop={(item) => setCroppingItem(item)}
      />

      {/* Interactive Image Crop Modal */}
      <ImageCropModal
        item={croppingItem}
        isOpen={Boolean(croppingItem)}
        onClose={() => setCroppingItem(null)}
        onSaveCrop={handleSaveCroppedItem}
      />

      {/* PDF Live Preview Modal */}
      <PdfPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        blobUrl={previewBlobUrl}
        filename={settings.filename}
        pageCount={items.length}
        items={items}
        settings={settings}
        currentLanguage={currentLanguage}
        onDownload={() => handleDownloadPdf()}
      />

      {/* Download History Drawer */}
      <DownloadHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
        currentLanguage={currentLanguage}
        onPreviewHistoryItem={(historyItem) => {
          setPreviewBlobUrl(historyItem.blobUrl);
          setIsHistoryOpen(false);
          setIsPreviewOpen(true);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-bounce-short">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />
    </div>
  );
}

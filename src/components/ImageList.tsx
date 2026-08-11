import React, { useState } from 'react';
import {
  LayoutGrid,
  List,
  ArrowUpDown,
  RotateCw,
  Trash2,
  CheckSquare,
  Square,
  SlidersHorizontal,
  RefreshCw,
  Plus
} from 'lucide-react';
import { ImageItem, ViewMode, ImageFilterType } from '../types';
import { ImageCard } from './ImageCard';
import { LanguageCode, getTranslation } from '../utils/i18n';

interface ImageListProps {
  items: ImageItem[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRotateItem: (id: string, degrees: number) => void;
  onRotateSelected: (degrees: number) => void;
  onApplyFilterSelected: (filterType: ImageFilterType) => void;
  onDeleteSelected: () => void;
  onEditModal: (item: ImageItem) => void;
  onCropModal: (item: ImageItem) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  onSort: (sortType: 'name-asc' | 'name-desc' | 'size' | 'date') => void;
  onReverseOrder: () => void;
  onAddMoreImages?: () => void;
  currentLanguage?: LanguageCode;
}

export const ImageList: React.FC<ImageListProps> = ({
  items,
  viewMode,
  onViewModeChange,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  onDeselectAll,
  onRotateItem,
  onRotateSelected,
  onApplyFilterSelected,
  onDeleteSelected,
  onEditModal,
  onCropModal,
  onMoveUp,
  onMoveDown,
  onDelete,
  onReorder,
  onSort,
  onReverseOrder,
  onAddMoreImages,
  currentLanguage = 'en',
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const t = (key: string) => getTranslation(currentLanguage, key);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onReorder(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className="space-y-4">
      {/* List Toolbar Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Left Side: Multi-select & Batch Actions */}
        <div className="flex items-center gap-2">
          {onAddMoreImages && (
            <button
              onClick={onAddMoreImages}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
              title={t('addImages')}
            >
              <Plus className="w-4 h-4" />
              <span>{t('addImages')}</span>
            </button>
          )}

          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {allSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-400" />}
            <span>{allSelected ? t('deselectAll') : t('selectAll')}</span>
          </button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                {selectedIds.length} {t('imagesSelected')}
              </span>

              <button
                onClick={() => onRotateSelected(90)}
                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                title={t('rotateAll')}
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={onDeleteSelected}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title={t('deleteSelected')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Sorting & Layout Toggle */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              onChange={(e) => onSort(e.target.value as any)}
              defaultValue=""
              className="bg-transparent border-none text-xs font-medium focus:ring-0 cursor-pointer pr-2 py-0.5 text-slate-700"
            >
              <option value="" disabled>
                Sort...
              </option>
              <option value="name-asc">{t('sortByName')} (A → Z)</option>
              <option value="name-desc">{t('sortByName')} (Z → A)</option>
              <option value="size">{t('sortBySize')}</option>
            </select>
          </div>

          {/* Reverse Order */}
          <button
            onClick={onReverseOrder}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={t('reverseOrder')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Grid/List View Switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Helper Drag & Drop Reorder Tip */}
      <div className="text-xs text-slate-400 px-1 flex items-center justify-between">
        <span>{t('reorderPages')}</span>
        <span>{items.length} {items.length === 1 ? t('page') : t('pages')}</span>
      </div>

      {/* Items Container */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-2.5'
        }
      >
        {items.map((item, index) => (
          <ImageCard
            key={item.id}
            item={item}
            index={index}
            totalCount={items.length}
            viewMode={viewMode}
            isSelected={selectedIds.includes(item.id)}
            onSelectToggle={onSelectToggle}
            onRotate={onRotateItem}
            onEditModal={onEditModal}
            onCropModal={onCropModal}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDelete={onDelete}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            isDragTarget={dragOverIndex === index}
          />
        ))}

        {/* Add More Images Interactive Tile */}
        {onAddMoreImages && (
          <button
            type="button"
            onClick={onAddMoreImages}
            className={`group rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/40 text-slate-500 hover:text-indigo-600 transition-all cursor-pointer flex flex-col items-center justify-center ${
              viewMode === 'grid'
                ? 'p-6 min-h-[220px]'
                : 'p-3.5 flex-row gap-3 min-h-[60px]'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-indigo-100 flex items-center justify-center shadow-xs transition-colors shrink-0">
              <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <div className={viewMode === 'grid' ? 'text-center mt-3' : 'text-left'}>
              <span className="font-semibold text-xs sm:text-sm text-slate-700 group-hover:text-indigo-700 block">
                {t('addImages')}
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import {
  RotateCw,
  RotateCcw,
  Sliders,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Check,
  Maximize2,
  Crop
} from 'lucide-react';
import { ImageItem, ViewMode } from '../types';
import { formatBytes } from '../utils/pdfGenerator';

interface ImageCardProps {
  item: ImageItem;
  index: number;
  totalCount: number;
  viewMode: ViewMode;
  isSelected: boolean;
  onSelectToggle: (id: string) => void;
  onRotate: (id: string, deltaDegrees: number) => void;
  onEditModal: (item: ImageItem) => void;
  onCropModal: (item: ImageItem) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (id: string) => void;
  // Drag & Drop handlers
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragTarget?: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  item,
  index,
  totalCount,
  viewMode,
  isSelected,
  onSelectToggle,
  onRotate,
  onEditModal,
  onCropModal,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragTarget = false,
}) => {
  const filterStyle = () => {
    const parts: string[] = [];
    if (item.filter.type === 'grayscale') parts.push('grayscale(100%)');
    else if (item.filter.type === 'contrast') parts.push('contrast(150%)');
    else if (item.filter.type === 'sepia') parts.push('sepia(80%)');
    else if (item.filter.type === 'warm') parts.push('sepia(30%) saturate(140%)');
    else if (item.filter.type === 'cool') parts.push('saturate(110%) hue-rotate(15deg)');
    else if (item.filter.type === 'vivid') parts.push('saturate(180%)');

    if (item.filter.brightness !== 0) parts.push(`brightness(${100 + item.filter.brightness}%)`);
    if (item.filter.contrast !== 0) parts.push(`contrast(${100 + item.filter.contrast}%)`);

    return parts.length > 0 ? parts.join(' ') : undefined;
  };

  const isRotated90or270 = item.rotation === 90 || item.rotation === 270;

  if (viewMode === 'list') {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        onDragOver={(e) => onDragOver(e, index)}
        onDrop={(e) => onDrop(e, index)}
        onDragEnd={onDragEnd}
        className={`group relative flex items-center gap-4 p-3 bg-white rounded-xl border transition-all ${
          isDragTarget ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/30 shadow-md' : 'border-slate-200 hover:border-slate-300'
        } ${isSelected ? 'bg-indigo-50/20 border-indigo-200' : ''}`}
      >
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-600 p-1 transition-colors" title="Drag to reorder page">
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Selection Checkbox */}
        <button
          onClick={() => onSelectToggle(item.id)}
          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
            isSelected
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Page Index Badge */}
        <span className="w-14 text-center font-bold text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
          Page {index + 1}
        </span>

        {/* Small Thumbnail */}
        <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative">
          <img
            src={item.src}
            alt={item.name}
            style={{
              transform: `rotate(${item.rotation}deg)`,
              filter: filterStyle(),
            }}
            className="max-w-full max-h-full object-contain transition-transform"
          />
        </div>

        {/* File Name & Metadata */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 truncate" title={item.name}>
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
            <span>{formatBytes(item.size)}</span>
            <span>•</span>
            <span>
              {isRotated90or270 ? `${item.height} x ${item.width} px` : `${item.width} x ${item.height} px`}
            </span>
            {item.filter.type !== 'none' && (
              <>
                <span>•</span>
                <span className="text-indigo-600 font-medium capitalize">
                  {item.filter.type} filter
                </span>
              </>
            )}
            {item.rotation !== 0 && (
              <>
                <span>•</span>
                <span className="text-slate-600 font-medium">
                  {item.rotation}°
                </span>
              </>
            )}
          </p>
        </div>

        {/* Reorder Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30"
            title="Move Page Up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalCount - 1}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30"
            title="Move Page Down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCropModal(item)}
            className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
            title="Crop Image Area"
          >
            <Crop className="w-4 h-4" />
          </button>

          <button
            onClick={() => onRotate(item.id, 90)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEditModal(item)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Edit Page Filters & Scaling"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Remove Page"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Grid Mode Card
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`group relative flex flex-col bg-white rounded-2xl border transition-all overflow-hidden ${
        isDragTarget
          ? 'border-indigo-500 ring-2 ring-indigo-300 shadow-lg scale-[1.02]'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
      } ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}`}
    >
      {/* Top Header Bar inside Card */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50/80 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <div className="cursor-grab active:cursor-grabbing text-slate-400 group-hover:text-slate-600 transition-colors" title="Drag to reorder page">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Page Badge */}
          <span className="font-bold text-slate-700 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md text-[11px]">
            Page {index + 1}
          </span>
        </div>

        {/* Selection Checkbox */}
        <button
          onClick={() => onSelectToggle(item.id)}
          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
            isSelected
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>
      </div>

      {/* Image Thumbnail Container */}
      <div
        onClick={() => onCropModal(item)}
        className="relative w-full h-48 bg-slate-100/60 p-3 flex items-center justify-center overflow-hidden cursor-pointer group-hover:bg-slate-100 transition-colors"
      >
        <img
          src={item.src}
          alt={item.name}
          style={{
            transform: `rotate(${item.rotation}deg)`,
            filter: filterStyle(),
          }}
          className="max-w-full max-h-full object-contain shadow-xs rounded-xs transition-transform duration-200"
        />

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
          <Crop className="w-4 h-4" />
          <span>Click to Crop / Edit</span>
        </div>

        {/* Badges for Rotation / Filter */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          {item.rotation !== 0 && (
            <span className="px-1.5 py-0.5 rounded bg-slate-900/75 text-white text-[10px] font-medium backdrop-blur-xs">
              {item.rotation}°
            </span>
          )}
          {item.filter.type !== 'none' && (
            <span className="px-1.5 py-0.5 rounded bg-indigo-600/90 text-white text-[10px] font-medium backdrop-blur-xs capitalize">
              {item.filter.type}
            </span>
          )}
        </div>
      </div>

      {/* Card Info & Quick Actions */}
      <div className="p-3 bg-white flex flex-col justify-between flex-1 gap-2 border-t border-slate-100">
        <div>
          <h4 className="text-xs font-bold text-slate-800 truncate" title={item.name}>
            {item.name}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>{formatBytes(item.size)}</span>
            <span>
              {isRotated90or270 ? `${item.height}×${item.width}` : `${item.width}×${item.height}`}
            </span>
          </p>
        </div>

        {/* Bottom Button Bar */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-500">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onCropModal(item)}
              className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
              title="Crop Image Area"
            >
              <Crop className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onRotate(item.id, -90)}
              className="p-1.5 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
              title="Rotate Counter-Clockwise"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onRotate(item.id, 90)}
              className="p-1.5 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
              title="Rotate Clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEditModal(item)}
              className="p-1.5 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
              title="Fine-tune Page Filters & Scaling"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-20"
              title="Move Left"
            >
              <ChevronUp className="w-3.5 h-3.5 -rotate-90" />
            </button>
            <button
              onClick={() => onMoveDown(index)}
              disabled={index === totalCount - 1}
              className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-20"
              title="Move Right"
            >
              <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-1"
              title="Delete Page"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

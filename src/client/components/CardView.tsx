import React from 'react';
import { CardInstance } from '../../engine/types';
import { CardRegistry } from '../../engine/CardRegistry';

interface CardViewProps {
  card?: CardInstance;
  defId?: string;
  isSelected?: boolean;
  onClick?: () => void;
  isCompact?: boolean;
  disabled?: boolean;
  highlight?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Bảng màu Full-Color nguyên bản của Exploding Kittens
const CARD_PALETTE: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  exploding_kitten: { bg: '#18181b', border: '#ef4444', text: '#ffffff', badge: 'MÈO NỔ' },
  defuse:           { bg: '#16a34a', border: '#86efac', text: '#ffffff', badge: 'GỠ BOM' },
  attack:           { bg: '#ea580c', border: '#fed7aa', text: '#ffffff', badge: 'TẤN CÔNG 2X' },
  skip:             { bg: '#0284c7', border: '#bae6fd', text: '#ffffff', badge: 'BỎ LƯỢT' },
  favor:            { bg: '#27272a', border: '#71717a', text: '#ffffff', badge: 'XIN XỎ' },
  shuffle:          { bg: '#65a30d', border: '#d9f99d', text: '#ffffff', badge: 'XÀO BÀI' },
  see_the_future:   { bg: '#c026d3', border: '#f5d0fe', text: '#ffffff', badge: 'TƯƠNG LAI 3X' },
  nope:             { bg: '#dc2626', border: '#fecaca', text: '#ffffff', badge: 'NOPE!' },
  cat_tacocat:      { bg: '#d97706', border: '#fde68a', text: '#ffffff', badge: 'TACO CAT' },
  cat_potato:       { bg: '#d97706', border: '#fde68a', text: '#ffffff', badge: 'KHOAI TÂY' },
  cat_cattermelon:  { bg: '#d97706', border: '#fde68a', text: '#ffffff', badge: 'DƯA HẤU' },
  cat_beard:        { bg: '#d97706', border: '#fde68a', text: '#ffffff', badge: 'RÂU XỒM' },
  cat_rainbow:      { bg: '#d97706', border: '#fde68a', text: '#ffffff', badge: 'CẦU VỒNG' }
};

export const CardView: React.FC<CardViewProps> = ({
  card,
  defId,
  isSelected = false,
  onClick,
  isCompact = false,
  disabled = false,
  highlight = false,
  className = '',
  style = {}
}) => {
  const definitionId = defId || card?.defId || 'defuse';
  const def = CardRegistry.getCard(definitionId);
  const theme = CARD_PALETTE[definitionId] || { bg: '#334155', border: '#94a3b8', text: '#ffffff', badge: 'LÁ BÀI' };

  if (!def) {
    return (
      <div className="w-20 h-32 bg-slate-800 rounded-xl flex items-center justify-center text-xs">
        Lá bài ?
      </div>
    );
  }

  // Kiểu dáng thẻ bài thu nhỏ (Compact cho modal hoặc history)
  if (isCompact) {
    return (
      <div
        onClick={!disabled ? onClick : undefined}
        style={{ backgroundColor: theme.bg, borderColor: theme.border, ...style }}
        className={`relative w-22 h-34 sm:w-24 sm:h-38 rounded-2xl border-2 p-1.5 flex flex-col justify-between select-none transition-all duration-200 card-shadow text-white ${
          isSelected ? 'ring-4 ring-yellow-400 scale-105 z-30' : ''
        } ${!disabled && onClick ? 'cursor-pointer hover:scale-105 hover:brightness-110' : ''} ${className}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-base">{def.icon}</span>
          <span className="text-[8px] font-black tracking-tight px-1 py-0.2 rounded bg-black/40 text-white">
            {theme.badge}
          </span>
        </div>
        <div className="bg-white/95 text-slate-900 rounded-xl p-1 my-0.5 text-center shadow-inner border border-black/20">
          <div className="text-2xl">{def.icon}</div>
          <p className="text-[10px] font-black leading-tight line-clamp-1">{def.nameVi}</p>
        </div>
        <div className="text-[8px] font-bold text-center text-white/90 truncate">
          {def.nameEn}
        </div>
      </div>
    );
  }

  // Kiểu dáng Full-Color Minimal chuẩn gốc Exploding Kittens - Tối ưu tỷ lệ không tràn chữ
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        backgroundColor: theme.bg,
        borderColor: isSelected ? '#facc15' : theme.border,
        ...style
      }}
      className={`relative w-[116px] h-[180px] sm:w-[136px] sm:h-[212px] md:w-[148px] md:h-[228px] rounded-2xl border-2 sm:border-3 p-2 flex flex-col justify-between select-none transition-all duration-200 card-shadow text-white overflow-hidden ${
        isSelected ? 'ring-4 ring-yellow-400 -translate-y-4 scale-105 z-40 shadow-2xl brightness-110' : ''
      } ${highlight ? 'animate-pulse' : ''} ${
        !disabled && onClick ? 'cursor-pointer' : 'cursor-default'
      } ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''} ${className}`}
    >
      {/* 1. Header: Biểu tượng & Tên danh mục in hoa */}
      <div className="flex items-center justify-between flex-shrink-0 mb-1">
        <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-md border border-white/20">
          <span className="text-xs">{def.icon}</span>
          <span className="text-[9px] font-black uppercase tracking-wider text-white">
            {theme.badge}
          </span>
        </div>
        <span className="text-[8px] sm:text-[9px] font-bold text-white/80 uppercase truncate max-w-[65px]">
          {def.nameEn}
        </span>
      </div>

      {/* 2. Khung tranh truyện tranh trung tâm (Comic Illustration Plate) */}
      <div className="bg-white rounded-xl py-1 px-1.5 flex flex-col items-center justify-center text-slate-950 border-2 border-black/30 shadow-sm flex-shrink-0">
        <div className="text-2xl sm:text-3xl filter drop-shadow">
          {def.icon}
        </div>
        <h4 className="text-[10px] sm:text-[11px] font-black text-slate-900 tracking-tight leading-tight text-center mt-0.5">
          {def.nameVi}
        </h4>
      </div>

      {/* 3. Khung hướng dẫn: Đầy đủ không gian, hiển thị toàn bộ chữ không bị cắt bớt */}
      <div className="my-auto py-1 px-1.5 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center text-center overflow-visible">
        <p className="text-[8px] sm:text-[9px] font-semibold leading-tight text-white/95 break-words">
          {def.description}
        </p>
      </div>

      {/* 4. Footer đối xứng gọn gàng */}
      <div className="flex justify-between items-center text-[7px] text-white/50 flex-shrink-0 pt-0.5">
        <span>EK ORIGINAL</span>
        <span className="font-mono font-black">{def.icon}</span>
      </div>

      {/* Dấu tích khi đang chọn bài */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 text-slate-950 rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 border-slate-900 z-50 animate-bounce-short">
          ✓
        </div>
      )}
    </div>
  );
};

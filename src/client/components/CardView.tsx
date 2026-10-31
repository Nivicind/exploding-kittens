import React from 'react';
import { CardInstance } from '../../engine/types';
import { CardRegistry } from '../../engine/CardRegistry';
import { CARD_I18N, Language } from '../i18n';

interface CardViewProps {
  card?: CardInstance;
  defId?: string;
  isSelected?: boolean;
  onClick?: () => void;
  isCompact?: boolean;
  isMini?: boolean;
  disabled?: boolean;
  highlight?: boolean;
  isBlind?: boolean;
  className?: string;
  style?: React.CSSProperties;
  lang?: Language;
}

// Bảng màu Full-Color nguyên bản của Exploding Kittens
const CARD_PALETTE: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  exploding_kitten:   { bg: '#18181b', border: '#ef4444', text: '#ffffff', badge: 'MÈO NỔ' },
  defuse:             { bg: '#16a34a', border: '#86efac', text: '#ffffff', badge: 'GỠ BOM' },
  attack:             { bg: '#ea580c', border: '#fed7aa', text: '#ffffff', badge: 'TẤN CÔNG 2X' },
  skip:               { bg: '#0284c7', border: '#bae6fd', text: '#ffffff', badge: 'BỎ LƯỢT' },
  favor:              { bg: '#27272a', border: '#71717a', text: '#ffffff', badge: 'XIN XỎ' },
  shuffle:            { bg: '#65a30d', border: '#d9f99d', text: '#ffffff', badge: 'XÀO BÀI' },
  see_the_future:     { bg: '#c026d3', border: '#f5d0fe', text: '#ffffff', badge: 'TƯƠNG LAI 3X' },
  nope:               { bg: '#dc2626', border: '#fecaca', text: '#ffffff', badge: 'NOPE!' },
  cat_tacocat:        { bg: '#d97706', border: '#fde68a', text: '#ffffff', badge: 'TACO CAT' },
  cat_potato:         { bg: '#d97706', border: '#fde68a', text: '#ffffff', badge: 'KHOAI TÂY' },
  cat_cattermelon:    { bg: '#d97706', border: '#fde68a', text: '#ffffff', badge: 'DƯA HẤU' },
  cat_beard:          { bg: '#d97706', border: '#fde68a', text: '#ffffff', badge: 'RÂU XỒM' },
  cat_rainbow:        { bg: '#d97706', border: '#fde68a', text: '#ffffff', badge: 'CẦU VỒNG' },
  imploding_kitten:   { bg: '#2e1065', border: '#c084fc', text: '#ffffff', badge: 'MÈO TỰ NỔ' },
  targeted_attack:    { bg: '#7c2d12', border: '#fdba74', text: '#ffffff', badge: 'TẤN CÔNG 🎯' },
  alter_the_future:   { bg: '#581c87', border: '#e9d5ff', text: '#ffffff', badge: 'ĐỔI TƯƠNG LAI' },
  draw_from_bottom:   { bg: '#134e4a', border: '#5eead4', text: '#ffffff', badge: 'RÚT ĐÁY' },
  reverse:            { bg: '#1e3a8a', border: '#93c5fd', text: '#ffffff', badge: 'ĐẢO CHIỀU' },
  feral_cat:          { bg: '#78350f', border: '#fcd34d', text: '#ffffff', badge: 'MÈO HOANG' },
  streaking_kitten:   { bg: '#c2410c', border: '#fed7aa', text: '#ffffff', badge: 'KHỎA THÂN ⚡' },
  super_skip:         { bg: '#0369a1', border: '#bae6fd', text: '#ffffff', badge: 'SIÊU BỎ LƯỢT ⏩' },
  see_the_future_5x:  { bg: '#7e22ce', border: '#f3e8ff', text: '#ffffff', badge: 'TƯƠNG LAI 5X 🔮' },
  alter_the_future_5x:{ bg: '#6b21a8', border: '#e9d5ff', text: '#ffffff', badge: 'ĐỔI 5X 🌀' },
  swap_top_bottom:    { bg: '#047857', border: '#a7f3d0', text: '#ffffff', badge: 'TRÁO ĐỈNH ĐÁY ↕️' },
  garbage_collection: { bg: '#475569', border: '#cbd5e1', text: '#ffffff', badge: 'THU GOM RÁC 🚛' },
  catomic_bomb:       { bg: '#b91c1c', border: '#fecaca', text: '#ffffff', badge: 'HẠT NHÂN ☢️' },
  mark:               { bg: '#b45309', border: '#fde68a', text: '#ffffff', badge: 'ĐÁNH DẤU 👁️' },
  curse_of_cat_butt:  { bg: '#be185d', border: '#fbcfe8', text: '#ffffff', badge: 'MÔNG MÈO 🍑' }
};

export const CardView: React.FC<CardViewProps> = ({
  card,
  defId,
  isSelected = false,
  onClick,
  isCompact = false,
  isMini = false,
  disabled = false,
  highlight = false,
  isBlind = false,
  className = '',
  style = {},
  lang
}) => {
  const currentLang: Language = lang || (typeof window !== 'undefined' ? (localStorage.getItem('ek_lang') as Language || 'vi') : 'vi');

  // Nếu người chơi đang bị Mù (Curse of Cat Butt), lá bài trên tay bị úp thành hình Mông Mèo 🍑
  if (isBlind) {
    if (isMini) {
      return (
        <div
          onClick={!disabled ? onClick : undefined}
          style={style}
          className={`relative w-[56px] h-[88px] xs:w-[64px] xs:h-[100px] sm:w-[84px] sm:h-[126px] rounded-xl border-2 border-pink-500 bg-gradient-to-br from-pink-950 via-rose-950 to-slate-950 p-1 flex flex-col justify-between items-center select-none text-white overflow-hidden ${
            isSelected ? 'ring-3 ring-yellow-400 scale-105 z-30 shadow-lg' : ''
          } ${className}`}
        >
          <div className="text-[6.5px] font-black uppercase text-pink-300 bg-black/45 px-1 py-0.5 rounded-full border border-pink-500/40">
            🍑 MÔNG
          </div>
          <span className="text-2xl filter drop-shadow my-auto">🍑</span>
          <div className="text-[6px] text-pink-400/60 font-mono font-bold">EK</div>
        </div>
      );
    }
    return (
      <div
        onClick={!disabled ? onClick : undefined}
        style={style}
        className={`relative w-[116px] h-[180px] sm:w-[136px] sm:h-[212px] md:w-[148px] md:h-[228px] rounded-2xl border-3 border-pink-500 bg-gradient-to-br from-pink-950 via-rose-950 to-slate-950 p-2 flex flex-col justify-between items-center select-none transition-all duration-200 card-shadow text-white overflow-hidden ${
          isSelected ? 'ring-4 ring-yellow-400 -translate-y-4 scale-105 z-40 shadow-2xl' : ''
        } ${!disabled && onClick ? 'cursor-pointer hover:scale-105 hover:brightness-110 active:scale-95' : 'cursor-default'} ${
          disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="text-[8px] sm:text-[9px] font-black uppercase text-pink-300 tracking-wider bg-black/45 px-2 py-0.5 rounded-full border border-pink-500/40">
          {currentLang === 'en' ? '🍑 CAT BUTT' : '🍑 MÔNG MÈO'}
        </div>
        <div className="flex flex-col items-center my-auto">
          <span className="text-4xl sm:text-5xl filter drop-shadow">🍑</span>
          <p className="text-[10px] sm:text-xs font-black text-pink-200 text-center mt-2 px-1">
            {currentLang === 'en' ? 'BLIND CARD' : 'BÀI BỊ MÙ'}
          </p>
          <p className="text-[7.5px] sm:text-[8px] text-pink-300/70 text-center mt-0.5">
            {currentLang === 'en' ? 'Play blindly' : 'Đánh mò cầu may'}
          </p>
        </div>
        <div className="text-[7.5px] text-pink-400/60 font-mono font-bold tracking-wider">
          EK STREAKING
        </div>
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 text-slate-950 rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 border-slate-900 z-50">
            ✓
          </div>
        )}
      </div>
    );
  }

  const definitionId = defId || card?.defId || 'defuse';
  const def = CardRegistry.getCard(definitionId);
  const theme = CARD_PALETTE[definitionId] || { bg: '#334155', border: '#94a3b8', text: '#ffffff', badge: 'LÁ BÀI' };
  const i18nData = CARD_I18N[definitionId]?.[currentLang];

  if (!def) {
    return (
      <div className="w-20 h-32 bg-slate-800 rounded-xl flex items-center justify-center text-xs">
        Lá bài ?
      </div>
    );
  }

  const cardName = i18nData?.name || (currentLang === 'en' ? def.nameEn : def.nameVi);
  const cardBadge = i18nData?.badge || theme.badge;
  const subName = i18nData?.subName || (currentLang === 'en' ? def.nameVi : def.nameEn);
  const descText = i18nData?.description || def.description;

  // Kiểu dáng thẻ bài siêu thu nhỏ (Mini - chuyên dụng cho Alter/See 5X trên mobile)
  if (isMini) {
    return (
      <div
        onClick={!disabled ? onClick : undefined}
        style={{ backgroundColor: theme.bg, borderColor: isSelected ? '#facc15' : theme.border, ...style }}
        className={`relative w-[56px] h-[88px] xs:w-[64px] xs:h-[100px] sm:w-[84px] sm:h-[126px] rounded-xl border-2 p-1 flex flex-col justify-between select-none transition-all duration-200 card-shadow text-white ${
          isSelected ? 'ring-3 ring-yellow-400 scale-105 z-30 shadow-lg' : ''
        } ${!disabled && onClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'} ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''} ${className}`}
      >
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] sm:text-sm">{def.icon}</span>
          <span className="text-[6px] sm:text-[7.5px] font-black tracking-tight px-1 py-0.2 rounded bg-black/50 text-white truncate max-w-[34px] sm:max-w-[48px]">
            {cardBadge}
          </span>
        </div>
        <div className="bg-white/95 text-slate-900 rounded-lg p-0.5 my-0.5 text-center shadow-inner border border-black/20">
          <div className="text-base sm:text-xl leading-none py-0.5">{def.icon}</div>
          <p className="text-[7.5px] sm:text-[9.5px] font-black leading-tight line-clamp-1">{cardName}</p>
        </div>
        <div className="text-[6px] sm:text-[7.5px] font-bold text-center text-white/90 truncate px-0.5">
          {subName}
        </div>
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
        <div className="flex items-center justify-between px-0.5">
          <span className="text-base">{def.icon}</span>
          <span className="text-[8px] font-black tracking-tight px-1.5 py-0.5 rounded bg-black/45 text-white">
            {cardBadge}
          </span>
        </div>
        <div className="bg-white/95 text-slate-900 rounded-xl p-1.5 my-0.5 text-center shadow-inner border border-black/20">
          <div className="text-2xl">{def.icon}</div>
          <p className="text-[10px] font-black leading-tight line-clamp-1">{cardName}</p>
        </div>
        <div className="text-[8px] font-bold text-center text-white/90 truncate px-0.5">
          {subName}
        </div>
      </div>
    );
  }

  // Kiểu dáng Full-Color Minimal chuẩn gốc Exploding Kittens - Tối ưu tỷ lệ không tràn chữ & khoảng cách cân đối
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
      <div className="flex items-center justify-between flex-shrink-0 mb-1 px-0.5">
        <div className="flex items-center gap-1 bg-black/45 px-1.5 py-0.5 rounded-md border border-white/20">
          <span className="text-xs">{def.icon}</span>
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white">
            {cardBadge}
          </span>
        </div>
        <span className="text-[7.5px] sm:text-[8.5px] font-bold text-white/80 uppercase truncate max-w-[65px] px-0.5">
          {subName}
        </span>
      </div>

      {/* 2. Khung tranh truyện tranh trung tâm (Comic Illustration Plate) */}
      <div className="bg-white rounded-xl py-1.5 px-2 flex flex-col items-center justify-center text-slate-950 border-2 border-black/30 shadow-sm flex-shrink-0 mx-0.5">
        <div className="text-2xl sm:text-3xl filter drop-shadow">
          {def.icon}
        </div>
        <h4 className="text-[10px] sm:text-[11px] font-black text-slate-900 tracking-tight leading-tight text-center mt-0.5 px-1 truncate w-full">
          {cardName}
        </h4>
      </div>

      {/* 3. Khung hướng dẫn: Dynamic font size & đệm viền đồng đều (không bao giờ sát mép) */}
      <div className="my-auto p-1.5 sm:p-2 bg-black/45 rounded-xl border border-white/15 flex items-center justify-center text-center overflow-hidden">
        <p className={`font-semibold text-white/95 break-words text-center px-0.5 ${
          descText.length > 85
            ? 'text-[7px] sm:text-[7.5px] md:text-[8px] leading-tight'
            : descText.length > 55
            ? 'text-[7.5px] sm:text-[8.5px] md:text-[9px] leading-snug'
            : 'text-[8.5px] sm:text-[9.5px] md:text-[10px] leading-snug'
        }`}>
          {descText}
        </p>
      </div>

      {/* 4. Footer đối xứng gọn gàng */}
      <div className="flex justify-between items-center text-[7px] text-white/50 flex-shrink-0 pt-0.5 px-0.5">
        <span>EK {currentLang === 'en' ? 'EDITION' : 'ORIGINAL'}</span>
        <span className="font-mono font-black">{def.icon}</span>
      </div>

      {/* Huy hiệu Bị Đánh Dấu (Marked Card) công khai cho cả bàn */}
      {card?.isMarked && (
        <div className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg border border-yellow-200 flex items-center gap-0.5 animate-pulse z-20">
          <span>👁️</span>
          <span>{currentLang === 'en' ? 'REVEALED' : 'BỊ LỘ'}</span>
        </div>
      )}

      {/* Dấu tích khi đang chọn bài */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 text-slate-950 rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 border-slate-900 z-50 animate-bounce-short">
          ✓
        </div>
      )}
    </div>
  );
};

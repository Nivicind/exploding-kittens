import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { CardInstance } from '../../engine/types';
import { CardView } from './CardView';
import { sound } from '../../engine/audio/SoundEffects';
import { Language } from '../i18n';

interface AlterFutureModalProps {
  cards: CardInstance[];
  onConfirm: (reorderedCards: CardInstance[]) => void;
  onClose: () => void;
  lang?: Language;
}

export const AlterFutureModal: React.FC<AlterFutureModalProps> = ({
  cards: initialCards,
  onConfirm,
  onClose,
  lang = 'vi'
}) => {
  const [items, setItems] = useState<CardInstance[]>(initialCards);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleSwap = (idx1: number, idx2: number) => {
    if (idx1 < 0 || idx1 >= items.length || idx2 < 0 || idx2 >= items.length) return;
    sound.playCardPlay();
    const next = [...items];
    const temp = next[idx1];
    next[idx1] = next[idx2];
    next[idx2] = temp;
    setItems(next);
  };

  const handleCardClick = (idx: number) => {
    if (selectedIdx === null) {
      sound.playCardPlay();
      setSelectedIdx(idx);
    } else if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else {
      handleSwap(selectedIdx, idx);
      setSelectedIdx(null);
    }
  };

  const handleConfirm = () => {
    sound.playCardPlay();
    onConfirm(items);
  };

  const isManyCards = items.length > 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border-4 border-purple-500 rounded-3xl p-4 sm:p-7 max-w-xl w-full text-center space-y-3.5 shadow-2xl shadow-purple-950/80">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-300 text-xs font-black uppercase tracking-wider mb-2">
            <span>🔮</span>
            <span>{lang === 'en' ? `ALTER THE FUTURE ${items.length}X` : `THAY ĐỔI TƯƠNG LAI ${items.length}X`}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-purple-400 uppercase tracking-wide">
            {lang === 'en' ? `Rearrange Top ${items.length} Cards` : `Sắp Xếp Lại ${items.length} Lá Trên Cùng`}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-300 mt-1 max-w-md mx-auto">
            {lang === 'en' 
              ? `Tap two cards to swap, drag to reorder, or use the ◀ ▶ buttons:` 
              : `Chạm 2 lá bất kỳ để đổi chỗ, kéo thả hoặc dùng nút mũi tên ◀ ▶:`}
          </p>
        </div>

        {/* Khung Kéo Thả / Chạm hoán đổi các lá bài */}
        <Reorder.Group
          axis="x"
          values={items}
          onReorder={setItems}
          className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 py-2 max-w-full px-1"
        >
          {items.map((card, idx) => {
            const isTop = idx === 0;
            const isSelected = selectedIdx === idx;
            const slotTitle = isTop
              ? (lang === 'en' ? '🥇 TOP' : '🥇 ĐỈNH')
              : (lang === 'en' ? `#${idx + 1}` : `Lá ${idx + 1}`);

            return (
              <Reorder.Item
                key={card.uid}
                value={card}
                className="flex flex-col items-center gap-1 flex-shrink-0 cursor-grab active:cursor-grabbing"
              >
                {/* Huy hiệu thứ tự */}
                <div
                  className={`px-1.5 xs:px-2 py-0.5 rounded-full text-[9px] xs:text-[10px] font-black uppercase tracking-wider shadow-md ${
                    isTop
                      ? 'bg-purple-600 text-white ring-2 ring-purple-300 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {slotTitle}
                </div>

                {/* Thẻ bài */}
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleCardClick(idx)}
                  className={`rounded-2xl transition-all ${
                    isSelected ? 'ring-4 ring-yellow-400 scale-105 z-20 shadow-lg shadow-yellow-500/40' : ''
                  }`}
                >
                  <CardView
                    card={card}
                    isSelected={isSelected}
                    isMini={isManyCards}
                    isCompact={!isManyCards}
                    lang={lang}
                  />
                </motion.div>

                {/* Cụm nút mũi tên hỗ trợ hoán đổi nhanh trên điện thoại */}
                <div className="flex items-center gap-1 mt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwap(idx, idx - 1);
                    }}
                    disabled={idx === 0}
                    className="w-6 h-6 xs:w-7 xs:h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-20 disabled:pointer-events-none cursor-pointer border border-slate-700 active:scale-90 flex items-center justify-center"
                    title={lang === 'en' ? 'Move Left' : 'Dời Trái'}
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwap(idx, idx + 1);
                    }}
                    disabled={idx === items.length - 1}
                    className="w-6 h-6 xs:w-7 xs:h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-20 disabled:pointer-events-none cursor-pointer border border-slate-700 active:scale-90 flex items-center justify-center"
                    title={lang === 'en' ? 'Move Right' : 'Dời Phải'}
                  >
                    ▶
                  </button>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        {selectedIdx !== null && (
          <div className="text-[11px] font-bold text-yellow-300 animate-pulse">
            {lang === 'en'
              ? `Card #${selectedIdx + 1} selected. Tap another card to swap places!`
              : `Đã chọn lá thứ #${selectedIdx + 1}. Chạm vào lá khác để đổi chỗ!`}
          </div>
        )}

        {/* Nút bấm xác nhận & Giữ nguyên */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black text-xs sm:text-sm uppercase rounded-2xl shadow-xl shadow-purple-600/30 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>✓</span>
            <span>{lang === 'en' ? 'CONFIRM NEW CARD ORDER' : 'XÁC NHẬN THỨ TỰ BÀI MỚI'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            {lang === 'en' ? 'Keep Current Order & Close' : 'Giữ Nguyên Thứ Tự & Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
};

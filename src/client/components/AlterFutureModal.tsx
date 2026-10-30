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

  const handleSwap = (idx1: number, idx2: number) => {
    if (idx1 < 0 || idx1 >= items.length || idx2 < 0 || idx2 >= items.length) return;
    sound.playCardPlay();
    const next = [...items];
    const temp = next[idx1];
    next[idx1] = next[idx2];
    next[idx2] = temp;
    setItems(next);
  };

  const handleConfirm = () => {
    sound.playCardPlay();
    onConfirm(items);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border-4 border-purple-500 rounded-3xl p-5 sm:p-8 max-w-lg w-full text-center space-y-4 shadow-2xl shadow-purple-950/80">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-300 text-xs font-black uppercase tracking-wider mb-2">
            <span>🔮</span>
            <span>{lang === 'en' ? `ALTER THE FUTURE ${items.length}X` : `THAY ĐỔI TƯƠNG LAI ${items.length}X`}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-purple-400 uppercase tracking-wide">
            {lang === 'en' ? `Rearrange Top ${items.length} Cards` : `Sắp Xếp Lại ${items.length} Lá Trên Cùng`}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-300 mt-1">
            {lang === 'en' 
              ? `Drag and drop or use arrows to rearrange the top ${items.length} cards in the draw pile:` 
              : `Kéo thả hoặc bấm nút mũi tên để hoán đổi thứ tự ${items.length} lá trên cùng của xấp bài rút:`}
          </p>
        </div>

        {/* Khung Kéo Thả các lá bài (Reorder Group) */}
        <Reorder.Group
          axis="x"
          values={items}
          onReorder={setItems}
          className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-4 py-3 overflow-x-auto max-w-full px-2"
        >
          {items.map((card, idx) => {
            const isTop = idx === 0;
            const slotTitle = isTop
              ? (lang === 'en' ? '🥇 TOP (1ST)' : '🥇 ĐỈNH (LÁ 1)')
              : (lang === 'en' ? `Card ${idx + 1}` : `Lá thứ ${idx + 1}`);

            return (
              <Reorder.Item
                key={card.uid}
                value={card}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-grab active:cursor-grabbing"
              >
                {/* Huy hiệu thứ tự */}
                <div
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${
                    isTop
                      ? 'bg-purple-600 text-white ring-2 ring-purple-300 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {slotTitle}
                </div>

                {/* Thẻ bài */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-2xl transition-transform"
                >
                  <CardView card={card} isSelected={false} lang={lang} />
                </motion.div>

                {/* Cụm nút mũi tên hỗ trợ hoán đổi nhanh trên điện thoại */}
                <div className="flex items-center gap-1 mt-1">
                  <button
                    type="button"
                    onClick={() => handleSwap(idx, idx - 1)}
                    disabled={idx === 0}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-slate-700"
                    title={lang === 'en' ? 'Move Left' : 'Dời Trái'}
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwap(idx, idx + 1)}
                    disabled={idx === items.length - 1}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-slate-700"
                    title={lang === 'en' ? 'Move Right' : 'Dời Phải'}
                  >
                    ▶
                  </button>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        {/* Nút bấm xác nhận & Giữ nguyên */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black text-sm uppercase rounded-2xl shadow-xl shadow-purple-600/30 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
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

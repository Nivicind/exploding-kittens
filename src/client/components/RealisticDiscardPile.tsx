import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardInstance } from '../../engine/types';
import { CardView } from './CardView';
import { Language } from '../i18n';

interface RealisticDiscardPileProps {
  discardPile: CardInstance[];
  onOpenModal: () => void;
  lang?: Language;
}

// Danh sách các góc xoay xô lệch ngẫu nhiên nhẹ cho từng tầng bài trong xấp
const STACK_ROTATIONS = [-3, 3, -2, 4, -1, 3, -4, 2];

export const RealisticDiscardPile: React.FC<RealisticDiscardPileProps> = ({
  discardPile,
  onOpenModal,
  lang = 'vi'
}) => {
  const topCards = discardPile.slice(-4); // Lấy tối đa 4 lá gần nhất để tạo độ dày
  const topCard = topCards[topCards.length - 1];

  return (
    <div className="flex flex-col items-center justify-start flex-shrink-0">
      {/* Tiêu đề & huy hiệu số lượng bài bỏ: Cân đối hoàn hảo với bên Trồng Bài Bốc */}
      <div className="h-10 sm:h-11 mb-2 text-center flex flex-col items-center justify-end">
        <span className="h-4 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-300 block mb-0.5 leading-none whitespace-nowrap">
          {lang === 'en' ? 'DISCARD PILE' : 'BÀI ĐÃ ĐÁNH RA'}
        </span>
        <div className="h-5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-700/80 bg-slate-800/60 text-[9px] sm:text-[10px] font-bold text-slate-300 leading-none whitespace-nowrap">
          <span>🗑️ {lang === 'en' ? `Discarded: ${discardPile.length}` : `Đã đánh: ${discardPile.length} lá`}</span>
        </div>
      </div>

      {/* Khung chứa các lá bài: Kích thước w-[116px] h-[180px] sm:w-[136px] sm:h-[212px] md:w-[148px] md:h-[228px] khớp 100% với Trồng Bài Bốc */}
      <div
        onClick={onOpenModal}
        className="relative cursor-pointer transition hover:scale-105 group w-[116px] h-[180px] sm:w-[136px] sm:h-[212px] md:w-[148px] md:h-[228px] flex items-center justify-center"
      >
        {topCards.length === 0 ? (
          <div className="w-full h-full rounded-2xl border-2 sm:border-3 border-dashed border-slate-700 bg-gradient-to-b from-slate-800/80 to-slate-950/90 flex flex-col items-center justify-between p-2.5 sm:p-3 card-shadow text-center">
            <div className="w-full flex justify-between text-slate-500 font-bold text-[9px] uppercase">
              <span>🗑️</span>
              <span>{lang === 'en' ? 'DISCARD' : 'BÀI BỎ'}</span>
            </div>
            
            <div className="my-auto flex flex-col items-center">
              <span className="text-3xl sm:text-4xl mb-1 text-slate-600">🗑️</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">
                {lang === 'en' ? 'No cards discarded' : 'Chưa có bài bỏ'}
              </span>
            </div>

            <div className="w-full py-1 text-[9px] text-slate-500 uppercase font-semibold">
              {lang === 'en' ? 'Ready for discards' : 'Sẵn sàng nhận bài'}
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Các lá bài lót bên dưới tạo độ xô lệch dày dặn chân thực */}
            {topCards.slice(0, -1).map((card, idx) => {
              const rotation = STACK_ROTATIONS[(card.uid.charCodeAt(card.uid.length - 1) || idx) % STACK_ROTATIONS.length];
              const offsetX = (idx % 2 === 0 ? 1 : -1) * (idx + 1) * 2;
              const offsetY = (idx + 1) * 2;

              return (
                <div
                  key={`stack_${card.uid}_${idx}`}
                  style={{
                    transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`,
                    zIndex: idx
                  }}
                  className="absolute inset-0 pointer-events-none opacity-85 flex items-center justify-center"
                >
                  <CardView card={card} isCompact={false} className="!w-full !h-full" />
                </div>
              );
            })}

            {/* Lá bài trên cùng với animation hạ cánh của Framer Motion */}
            <AnimatePresence mode="popLayout">
              {topCard && (
                <motion.div
                  key={`top_${topCard.uid}`}
                  initial={{ scale: 1.25, y: -20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1, rotate: STACK_ROTATIONS[discardPile.length % STACK_ROTATIONS.length] }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute inset-0 z-10 flex items-center justify-center"
                >
                  <CardView card={topCard} isCompact={false} className="!w-full !h-full" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lớp phủ khi hover xem toàn bộ */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition z-20">
              <span className="text-[10px] font-black text-white bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700 shadow-xl">
                🔍 Xem xấp bài ({discardPile.length})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Nút xem chi tiết ở dưới: Cùng chiều cao mt-2 text-[10px] với dòng 'Còn X lá' bên bài bốc */}
      <button
        onClick={onOpenModal}
        className="h-4 mt-2 text-[10px] text-slate-400 hover:text-white font-semibold transition flex items-center justify-center gap-1 cursor-pointer leading-none"
      >
        <span>🔍</span> Chi tiết ({discardPile.length} lá)
      </button>
    </div>
  );
};

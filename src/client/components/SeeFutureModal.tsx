import React from 'react';
import { CardInstance } from '../../engine/types';
import { CardView } from './CardView';

interface SeeFutureModalProps {
  cards: CardInstance[];
  onClose: () => void;
}

export const SeeFutureModal: React.FC<SeeFutureModalProps> = ({ cards, onClose }) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px] p-4 sm:p-6 animate-fade-in select-none cursor-pointer"
    >
      {/* Container nội dung dạng Lõi Công Nghệ (TFT / Balatro Augments) - Nền chỉ tối nhẹ 10-15% để quan sát bàn chơi */}
      <div
        onClick={e => e.stopPropagation()}
        className="flex flex-col items-center max-w-4xl w-full cursor-default"
      >
        {/* Header vi diệu */}
        <div className="text-center mb-4 sm:mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 border border-fuchsia-400/50 text-fuchsia-300 text-xs font-black uppercase tracking-widest shadow-lg mb-1.5 backdrop-blur-md">
            <span>🔮</span>
            <span>SEE THE FUTURE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-200 to-pink-300 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(217,70,239,0.5)]">
            Tương Lai Của Xấp Bài
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-md mx-auto drop-shadow">
            Chỉ riêng bạn nhìn thấy! Đây là <strong>3 lá bài tiếp theo</strong> trên đỉnh bộ bài (xếp theo thứ tự sẽ được rút):
          </p>
        </div>

        {/* 3 Lá bài đứng song song, căn đều chuẩn xác 100% theo grid 3 cột */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-xl sm:max-w-2xl mx-auto items-start justify-items-center my-2">
          {cards.map((card, idx) => (
            <div
              key={card.uid || idx}
              className="flex flex-col items-center w-full transform hover:scale-105 hover:-translate-y-2 transition-all duration-300"
            >
              {/* Huy hiệu thứ tự rút bài cố định chiều cao giúp 3 lá bài ngang hàng nhau 100% */}
              <div className="h-7 sm:h-8 flex items-center justify-center mb-2 w-full">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-center whitespace-nowrap border shadow-md ${
                  idx === 0
                    ? 'bg-rose-900/80 text-rose-200 border-rose-400 ring-2 ring-rose-500/50'
                    : idx === 1
                    ? 'bg-amber-900/80 text-amber-200 border-amber-400'
                    : 'bg-fuchsia-900/80 text-fuchsia-200 border-fuchsia-400'
                }`}>
                  {idx === 0
                    ? '🥇 1. Đỉnh Xấp'
                    : idx === 1
                    ? '🥈 2. Tiếp Theo'
                    : '🥉 3. Kế Tiếp'}
                </span>
              </div>

              {/* Thẻ bài kích thước chuẩn sắc nét */}
              <div className="filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]">
                <CardView card={card} isCompact={false} />
              </div>
            </div>
          ))}

          {cards.length === 0 && (
            <div className="col-span-3 text-slate-200 italic text-sm py-8 drop-shadow">
              Xấp bài rút đang cạn kiệt.
            </div>
          )}
        </div>

        {/* Nút đóng thanh thoát */}
        <div className="mt-6 sm:mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-2xl shadow-fuchsia-600/40 border border-fuchsia-300/40 transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>Tôi Đã Nhớ Thứ Tự Bài</span>
            <span className="text-base">✕</span>
          </button>
          <div className="text-[10px] text-slate-300 text-center mt-1.5 drop-shadow">
            (Hoặc nhấp vào bất kỳ vùng nào bên ngoài để đóng)
          </div>
        </div>
      </div>
    </div>
  );
};

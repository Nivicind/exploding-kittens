import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PendingAction, PlayerState } from '../../engine/types';
import { CardRegistry } from '../../engine/CardRegistry';
import { sound } from '../../engine/audio/SoundEffects';

interface ActionBannerProps {
  pendingAction: PendingAction;
  currentPlayer: PlayerState;
  onPassNope: () => void;
}

export const ActionBanner: React.FC<ActionBannerProps> = ({
  pendingAction,
  currentPlayer,
  onPassNope
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(3.5);

  const cardPlayed = pendingAction.cardsPlayed[0];
  const cardDef = cardPlayed ? CardRegistry.getCard(cardPlayed.defId) : null;
  const isNegated = pendingAction.nopeCount % 2 === 1;
  const hasNopeInHand = currentPlayer.hand.some(c => c.defId === 'nope');
  const hasPassed = pendingAction.passedPlayerIds.includes(currentPlayer.id);

  useEffect(() => {
    sound.playTicking();
    const interval = setInterval(() => {
      const remaining = Math.max(0, (pendingAction.expiresAt - Date.now()) / 1000);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [pendingAction.expiresAt]);

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / 3.5) * 100));

  return (
    /* Trên mobile: Đặt ở khoảng trống phía trên bàn chơi (top-28), thiết kế dạng con nhộng siêu gọn, không che bài / đối thủ.
       Trên desktop: Đặt ở góc phải bên dưới (bottom-[285px] right-5). */
    <div className="fixed top-28 left-1/2 -translate-x-1/2 sm:top-auto sm:left-auto sm:bottom-[285px] sm:right-5 sm:translate-x-0 z-40 w-[92vw] max-w-sm sm:w-80 pointer-events-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -10 }}
        className="bg-slate-950/95 border border-rose-500/80 sm:border-2 sm:border-rose-500 rounded-2xl p-2 sm:p-3 shadow-2xl shadow-rose-950/80 backdrop-blur-md flex flex-col gap-1.5 sm:gap-2"
      >
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Thông tin hành động */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm sm:text-base animate-pulse flex-shrink-0">⚡</span>
            <div className="min-w-0 truncate">
              <span className="text-slate-400 font-semibold text-[9px] sm:text-[10px] hidden sm:block">
                Hành động đang chờ:
              </span>
              <span className="font-black text-white text-xs truncate flex items-center gap-1">
                <span className="text-slate-400 text-[10px] sm:hidden">Chờ Nope:</span>
                <span>{cardDef?.icon}</span>
                <span className="text-yellow-300 font-bold truncate">{cardDef?.nameVi || 'Combo'}</span>
              </span>
            </div>
          </div>

          {/* Đồng hồ & Nút Pass */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <span className="text-[10px] sm:text-xs font-mono font-black text-yellow-300 whitespace-nowrap">
              ⏱️ {timeLeft.toFixed(1)}s
            </span>

            <button
              onClick={onPassNope}
              disabled={hasPassed}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl font-black text-[9px] sm:text-[10px] transition whitespace-nowrap ${
                hasPassed
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-600/70 active:scale-95 cursor-pointer'
              }`}
            >
              {hasPassed ? 'Đã Pass ✓' : 'Bỏ qua'}
            </button>
          </div>
        </div>

        {/* Thanh đếm ngược tiến trình thời gian */}
        <div className="w-full bg-slate-900 rounded-full h-1 sm:h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${isNegated ? 'bg-rose-500' : 'bg-yellow-400'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Trạng thái hiện tại & Lời nhắc */}
        <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold">
          <span className={isNegated ? 'text-rose-400' : 'text-emerald-400'}>
            {isNegated ? '🛑 ĐANG BỊ NOPE!' : '✅ ĐANG CÓ HIỆU LỰC'}
          </span>
          {hasNopeInHand && !hasPassed ? (
            <span className="text-rose-300 animate-pulse font-extrabold truncate ml-1">
              👉 Bấm [ĐÁNH NOPE] trên bài bạn!
            </span>
          ) : (
            <span className="text-slate-500 hidden sm:inline">
              (Không có bài Nope)
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};

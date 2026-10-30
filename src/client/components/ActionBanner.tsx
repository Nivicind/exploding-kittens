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
    /* Đặt cố định ở BÊN PHẢI (fixed right-3 sm:right-5), CÙNG CHIỀU CAO VỚI LỊCH SỬ VÁN ĐẤU (bottom-[275px] md:bottom-[285px])
       Hoàn toàn không đẩy hoặc làm dịch chuyển bất kỳ thành phần nào trên bàn cờ */
    <div className="fixed bottom-[275px] md:bottom-[285px] right-3 sm:right-5 z-40 w-72 sm:w-80 pointer-events-auto">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, x: 20 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        exit={{ scale: 0.85, opacity: 0, x: 20 }}
        className="bg-slate-950/95 border-2 border-rose-500 rounded-2xl p-2.5 sm:p-3 shadow-2xl shadow-rose-950/70 backdrop-blur-md flex flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-2">
          {/* Thông tin hành động */}
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-lg animate-pulse">⚡</span>
            <div className="truncate">
              <span className="text-slate-400 font-semibold text-[10px] block">Hành động đang chờ:</span>
              <span className="font-black text-white text-xs truncate flex items-center gap-1">
                <span>{cardDef?.icon}</span>
                <span>{cardDef?.nameVi || 'Combo Đặc Biệt'}</span>
              </span>
            </div>
          </div>

          {/* Đồng hồ & Nút Pass */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-mono font-black text-yellow-300">
                ⏱️ {timeLeft.toFixed(1)}s
              </span>
            </div>

            <button
              onClick={onPassNope}
              disabled={hasPassed}
              className={`px-2.5 py-1 rounded-xl font-black text-[10px] transition ${
                hasPassed
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
              }`}
            >
              {hasPassed ? 'Đã Pass ✓' : 'Bỏ qua'}
            </button>
          </div>
        </div>

        {/* Thanh đếm ngược tiến trình thời gian */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${isNegated ? 'bg-rose-500' : 'bg-yellow-400'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Trạng thái hiện tại & Lời nhắc */}
        <div className="flex items-center justify-between text-[9px] font-bold">
          <span className={isNegated ? 'text-rose-400' : 'text-emerald-400'}>
            {isNegated ? '🛑 ĐANG BỊ NOPE!' : '✅ ĐANG CÓ HIỆU LỰC'}
          </span>
          {hasNopeInHand && !hasPassed ? (
            <span className="text-rose-300 animate-pulse font-extrabold">
              👉 Bấm [ĐÁNH NOPE] trên bài bạn!
            </span>
          ) : (
            <span className="text-slate-500">
              (Không có bài Nope)
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};

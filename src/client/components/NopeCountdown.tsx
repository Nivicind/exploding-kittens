import React, { useEffect, useState } from 'react';
import { PendingAction, PlayerState } from '../../engine/types';
import { CardRegistry } from '../../engine/CardRegistry';
import { sound } from '../../engine/audio/SoundEffects';

interface NopeCountdownProps {
  pendingAction: PendingAction;
  currentPlayer: PlayerState;
  onPlayNope: (cardUid: string) => void;
  onPassNope: () => void;
}

export const NopeCountdown: React.FC<NopeCountdownProps> = ({
  pendingAction,
  currentPlayer,
  onPlayNope,
  onPassNope
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(3.5);

  const cardPlayed = pendingAction.cardsPlayed[0];
  const cardDef = cardPlayed ? CardRegistry.getCard(cardPlayed.defId) : null;
  const nopeCard = currentPlayer.hand.find(c => c.defId === 'nope');
  const hasPassed = pendingAction.passedPlayerIds.includes(currentPlayer.id);
  const isNegated = pendingAction.nopeCount % 2 === 1;

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

  const handleNopeClick = () => {
    if (nopeCard) {
      sound.playNope();
      onPlayNope(nopeCard.uid);
    }
  };

  const handlePassClick = () => {
    onPassNope();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border-4 border-rose-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-pulse-fast">
        {/* Banner tiêu đề */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl animate-bounce">⏱️</span>
          <h3 className="text-2xl sm:text-3xl font-black text-rose-500 uppercase tracking-wider">
            Cơ Hội NOPE!
          </h3>
        </div>

        {/* Thông tin lá bài vừa đánh */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
            Hành động đang diễn ra:
          </div>
          <div className="text-lg font-black text-white flex items-center justify-center gap-2">
            <span>{cardDef?.icon}</span>
            <span>{cardDef?.nameVi || 'Combo Đặc Biệt'}</span>
          </div>
          <div className="mt-2 text-xs font-semibold">
            Trạng thái hiện tại:{' '}
            <span className={isNegated ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {isNegated ? '🛑 ĐANG BỊ NOPE (HỦY HIỆU LỰC)' : '✅ ĐANG CÓ HIỆU LỰC'}
            </span>
          </div>
        </div>

        {/* Vòng đếm ngược trực quan */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                className="text-rose-500 transition-all duration-100"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 * (1 - Math.min(1, timeLeft / 3.5))}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-3xl font-black text-white">
              {timeLeft.toFixed(1)}s
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Bấm NOPE để chặn, hoặc Pass để bỏ qua
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-3 justify-center pt-2">
          {nopeCard ? (
            <button
              onClick={handleNopeClick}
              className="flex-1 py-3 px-6 bg-rose-600 hover:bg-rose-500 text-white font-black text-lg rounded-xl shadow-lg shadow-rose-600/50 transform active:scale-95 transition flex items-center justify-center gap-2 border-2 border-rose-400"
            >
              <span>🚫</span> ĐÁNH NOPE!
            </button>
          ) : (
            <div className="flex-1 py-3 px-4 bg-slate-800 text-slate-500 font-bold text-sm rounded-xl border border-slate-700 flex items-center justify-center">
              (Bạn không có lá NOPE)
            </div>
          )}

          <button
            onClick={handlePassClick}
            disabled={hasPassed}
            className={`py-3 px-6 rounded-xl font-bold text-sm transition ${
              hasPassed
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            {hasPassed ? 'Đã Pass ✓' : 'Bỏ qua (Pass)'}
          </button>
        </div>
      </div>
    </div>
  );
};


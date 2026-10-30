import React, { useState } from 'react';
import { CustomDeckConfig } from '../../engine/types';
import { CardRegistry } from '../../engine/CardRegistry';

interface CustomDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: CustomDeckConfig;
  onSave: (config: CustomDeckConfig) => void;
  playerCount: number;
}

export const CustomDeckModal: React.FC<CustomDeckModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  playerCount
}) => {
  if (!isOpen) return null;

  const defaultHandSize = playerCount <= 5 ? 7 : 4;
  const allCards = CardRegistry.getAllCards(['base']).filter(
    c => c.type !== 'KITTEN' && c.type !== 'DEFUSE'
  );

  const [handSize, setHandSize] = useState<number>(config?.handSize ?? defaultHandSize);
  const [defuseInDeck, setDefuseInDeck] = useState<number>(config?.defuseInDeck ?? 2);
  const [cardCounts, setCardCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const card of allCards) {
      initial[card.id] = config?.cardCounts?.[card.id] ?? card.defaultCount;
    }
    return initial;
  });

  const totalRegularCards = Object.values(cardCounts).reduce((a, b) => a + b, 0);

  const handleCountChange = (defId: string, delta: number) => {
    setCardCounts(prev => {
      const current = prev[defId] ?? 0;
      const next = Math.max(0, Math.min(15, current + delta));
      return { ...prev, [defId]: next };
    });
  };

  const handleReset = () => {
    setHandSize(playerCount <= 5 ? 7 : 4);
    setDefuseInDeck(2);
    const resetCounts: Record<string, number> = {};
    for (const card of allCards) {
      resetCounts[card.id] = card.defaultCount;
    }
    setCardCounts(resetCounts);
  };

  const handleSave = () => {
    onSave({
      handSize,
      defuseInDeck,
      cardCounts
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-black text-yellow-400 flex items-center gap-2">
              <span>🛠️</span> Tùy Chỉnh Bộ Bài (Deck Setup)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Điều chỉnh số lượng từng loại lá bài và luật chia bài cho trận đấu ({playerCount} người chơi).
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Nội dung cấu hình cuộn được */}
        <div className="overflow-y-auto flex-1 my-4 pr-2 space-y-5">
          {/* Cấu hình lượt chia & Defuse */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">
                Số bài phát đầu trận mỗi người: <span className="text-yellow-400 text-sm">{handSize} lá</span> (+1 Defuse)
              </label>
              <input
                type="range"
                min="2"
                max="8"
                value={handSize}
                onChange={e => setHandSize(parseInt(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                (Gốc: 7 lá cho ≤5 người, 4 lá cho 6-10 người)
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">
                Số lá Defuse dư trong xấp rút: <span className="text-emerald-400 text-sm">{defuseInDeck} lá</span>
              </label>
              <input
                type="range"
                min="0"
                max="6"
                value={defuseInDeck}
                onChange={e => setDefuseInDeck(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                (Mỗi người đã nhận sẵn 1 lá Defuse lúc đầu)
              </p>
            </div>
          </div>

          {/* Thống kê tổng quan */}
          <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-300">
              Tổng số lá bài thường: <strong className="text-yellow-400">{totalRegularCards} lá</strong>
            </span>
            <span className="text-slate-300">
              Số Mèo Nổ tự cân bằng: <strong className="text-rose-500">{Math.max(1, playerCount - 1)} lá</strong>
            </span>
          </div>

          {/* Danh sách từng loại lá bài */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Số lượng từng loại thẻ bài trong bộ:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allCards.map(card => {
                const count = cardCounts[card.id] ?? card.defaultCount;
                return (
                  <div
                    key={card.id}
                    className="flex items-center justify-between bg-slate-800/40 border border-slate-700/50 p-2.5 rounded-lg hover:border-slate-600 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{card.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{card.nameVi}</div>
                        <div className="text-[10px] text-slate-400">{card.nameEn} (Gốc: {card.defaultCount})</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCountChange(card.id, -1)}
                        className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold text-sm flex items-center justify-center transition"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-extrabold text-sm text-yellow-300">
                        {count}
                      </span>
                      <button
                        onClick={() => handleCountChange(card.id, 1)}
                        className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold text-sm flex items-center justify-center transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            ↺ Khôi phục Mặc Định
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-slate-900 bg-yellow-400 hover:bg-yellow-300 rounded-lg shadow-md transition"
            >
              Lưu Cấu Hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { PlayerState } from '../../engine/types';
import { sound } from '../../engine/audio/SoundEffects';

interface DefuseModalProps {
  drawPileCount: number;
  players?: PlayerState[];
  turnDirection?: 1 | -1;
  myPlayerId?: string;
  onConfirm: (insertIndex: number) => void;
}

export const DefuseModal: React.FC<DefuseModalProps> = ({
  drawPileCount,
  players = [],
  turnDirection = 1,
  myPlayerId,
  onConfirm
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Tính toán người đi kế tiếp để người chơi dễ lên chiến thuật ám sát hoặc né bom
  const alivePlayers = players.filter(p => p.isAlive);
  const myIdx = alivePlayers.findIndex(p => p.id === myPlayerId);
  const nextPlayer = alivePlayers.length > 1 && myIdx !== -1
    ? alivePlayers[(myIdx + turnDirection + alivePlayers.length) % alivePlayers.length]
    : null;
  const afterNextPlayer = alivePlayers.length > 2 && myIdx !== -1
    ? alivePlayers[(myIdx + turnDirection * 2 + alivePlayers.length * 2) % alivePlayers.length]
    : null;

  const handleConfirm = () => {
    sound.playDefuse();
    onConfirm(selectedIndex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] p-3 sm:p-4 animate-fade-in select-none">
      <div className="bg-slate-900/95 border-3 border-emerald-500 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl text-center space-y-4 backdrop-blur-md max-h-[92vh] overflow-y-auto">
        {/* Tiêu đề cứu nguy */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
            <span>🔧</span>
            <span>GỠ BOM THÀNH CÔNG</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-400 uppercase tracking-wide">
            Chọn Vị Trí Giấu Lại Mèo Nổ
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-300 mt-1">
            Bạn đã dùng <strong>Defuse</strong> để sống sót! Hãy bí mật nhét chú Mèo Nổ này trở lại xấp bài rút.
          </p>
        </div>

        {/* Thanh hiển thị thứ tự lượt đi kế tiếp (giúp nhìn rõ ai sẽ bốc bài tiếp theo) */}
        {nextPlayer && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-bold text-[11px]">Lượt kế tiếp:</span>
            <span className="font-black text-yellow-400 flex items-center gap-1">
              <span>👉 {nextPlayer.name}</span>
              {nextPlayer.turnsToTake > 1 ? `(${nextPlayer.turnsToTake}L)` : ''}
            </span>
            {afterNextPlayer && (
              <>
                <span className="text-slate-600">➔</span>
                <span className="font-bold text-slate-400">{afterNextPlayer.name}</span>
              </>
            )}
          </div>
        )}

        {/* Các nút chọn nhanh chiến thuật */}
        <div className="grid grid-cols-2 gap-2.5 text-xs font-bold text-left">
          <button
            type="button"
            onClick={() => setSelectedIndex(0)}
            className={`p-3 rounded-xl border-2 transition ${
              selectedIndex === 0
                ? 'bg-rose-600/30 border-rose-500 text-rose-300 ring-2 ring-rose-500'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <div className="text-base mb-1">🎯 Đỉnh xấp bài (Trên cùng)</div>
            <div className="text-[10px] text-rose-300 font-normal leading-tight">
              Ám sát {nextPlayer ? nextPlayer.name : 'người đi sau'} ngay lập tức!
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedIndex(1)}
            disabled={drawPileCount < 1}
            className={`p-3 rounded-xl border-2 transition ${
              selectedIndex === 1
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <div className="text-base mb-1">🥈 Vị trí thứ 2</div>
            <div className="text-[10px] text-slate-400 font-normal leading-tight">
              Né {nextPlayer ? nextPlayer.name : 'người kế tiếp'}, nhắm vào người sau
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedIndex(drawPileCount)}
            className={`p-3 rounded-xl border-2 transition ${
              selectedIndex === drawPileCount
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <div className="text-base mb-1">⚓ Đáy xấp bài (Dưới cùng)</div>
            <div className="text-[10px] text-slate-400 font-normal leading-tight">
              An toàn nhất cho tất cả mọi người
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedIndex(Math.floor(Math.random() * (drawPileCount + 1)))}
            className="p-3 rounded-xl border-2 bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500 transition"
          >
            <div className="text-base mb-1">🎲 Vị trí ngẫu nhiên</div>
            <div className="text-[10px] text-slate-400 font-normal leading-tight">
              Tùy duyên số trời xắp đặt
            </div>
          </button>
        </div>

        {/* Thanh trượt tùy chỉnh vị trí chính xác */}
        <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="text-slate-400">Vị trí chính xác trong xấp:</span>
            <span className="text-emerald-400 font-mono font-black text-sm">
              {selectedIndex === 0 ? 'Đỉnh xấp (0)' : selectedIndex === drawPileCount ? `Đáy xấp (${drawPileCount})` : `Lá thứ ${selectedIndex + 1}`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={drawPileCount}
            value={selectedIndex}
            onChange={e => setSelectedIndex(parseInt(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
            <span>Đỉnh bài (0)</span>
            <span>Đáy bài ({drawPileCount})</span>
          </div>
        </div>

        {/* Nút xác nhận */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-500/30 transition transform active:scale-95 cursor-pointer"
        >
          Xác Nhận Giấu Mèo Nổ 💣
        </button>
      </div>
    </div>
  );
};

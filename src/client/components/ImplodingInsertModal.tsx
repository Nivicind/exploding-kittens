import React, { useState } from 'react';
import { PlayerState } from '../../engine/types';
import { sound } from '../../engine/audio/SoundEffects';
import { Language } from '../i18n';

interface ImplodingInsertModalProps {
  drawPileCount: number;
  players?: PlayerState[];
  turnDirection?: 1 | -1;
  myPlayerId?: string;
  onConfirm: (insertIndex: number) => void;
  lang?: Language;
}

export const ImplodingInsertModal: React.FC<ImplodingInsertModalProps> = ({
  drawPileCount,
  players = [],
  turnDirection = 1,
  myPlayerId,
  onConfirm,
  lang = 'vi'
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isRandomSecret, setIsRandomSecret] = useState<boolean>(false);

  // Tính toán người đi kế tiếp
  const alivePlayers = players.filter(p => p.isAlive);
  const myIdx = alivePlayers.findIndex(p => p.id === myPlayerId);
  const nextPlayer = alivePlayers.length > 1 && myIdx !== -1
    ? alivePlayers[(myIdx + turnDirection + alivePlayers.length) % alivePlayers.length]
    : null;
  const afterNextPlayer = alivePlayers.length > 2 && myIdx !== -1
    ? alivePlayers[(myIdx + turnDirection * 2 + alivePlayers.length * 2) % alivePlayers.length]
    : null;

  const handleConfirm = () => {
    sound.playCardPlay();
    if (isRandomSecret) {
      const finalRandomIndex = Math.floor(Math.random() * (drawPileCount + 1));
      onConfirm(finalRandomIndex);
    } else {
      onConfirm(selectedIndex);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-[2px] p-3 sm:p-4 animate-fade-in select-none">
      <div className="bg-slate-900/95 border-3 border-purple-500 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl text-center space-y-4 backdrop-blur-md max-h-[92vh] overflow-y-auto">
        {/* Tiêu đề */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-300 text-xs font-black uppercase tracking-wider mb-2">
            <span>🌀</span>
            <span>{lang === 'en' ? 'FACE-UP REINSERTION' : 'LẬT NGỬA MÈO TỰ NỔ'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-purple-400 uppercase tracking-wide">
            {lang === 'en' ? 'Choose Insertion Position' : 'Chọn Vị Trí Đặt Lại Mèo Tự Nổ'}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-300 mt-1">
            {lang === 'en' 
              ? 'The Imploding Kitten will be inserted FACE-UP at your chosen depth. Anyone who draws it next will IMPLODE INSTANTLY (Defuse is useless)!' 
              : 'Lá Mèo Tự Nổ sẽ được lật NGỬA MẶT vào vị trí bạn chọn. Bất kỳ ai rút trúng nó lần sau sẽ NỔ TUNG NGAY LẬP TỨC (Defuse vô dụng)!'}
          </p>
        </div>

        {/* Thanh hiển thị thứ tự lượt đi kế tiếp */}
        {nextPlayer && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-bold text-[11px]">
              {lang === 'en' ? 'Next turn:' : 'Lượt kế tiếp:'}
            </span>
            <span className="font-black text-yellow-400 flex items-center gap-1">
              <span>👉 {nextPlayer.name}</span>
              {nextPlayer.turnsToTake > 1 ? `(${nextPlayer.turnsToTake}T)` : ''}
            </span>
            {afterNextPlayer && (
              <>
                <span className="text-slate-600">➔</span>
                <span className="text-slate-400 text-[11px]">{afterNextPlayer.name}</span>
              </>
            )}
          </div>
        )}

        {/* Các nút bấm chọn nhanh chiến thuật */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setIsRandomSecret(false);
              setSelectedIndex(0);
            }}
            className={`p-2.5 rounded-2xl border font-black transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
              !isRandomSecret && selectedIndex === 0
                ? 'bg-purple-600 text-white border-purple-300 shadow-lg shadow-purple-600/40 scale-102'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span className="text-base">💀</span>
            <span className="text-[11px]">{lang === 'en' ? 'TOP CARD' : 'ĐỈNH BÀI (LÁ 1)'}</span>
            <span className="text-[9.5px] font-normal text-purple-200">
              {nextPlayer ? (lang === 'en' ? `Trap ${nextPlayer.name}` : `Bẫy ${nextPlayer.name}`) : (lang === 'en' ? 'Next player' : 'Người kế tiếp')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRandomSecret(false);
              setSelectedIndex(1);
            }}
            disabled={drawPileCount < 1}
            className={`p-2.5 rounded-2xl border font-black transition cursor-pointer flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 ${
              !isRandomSecret && selectedIndex === 1
                ? 'bg-purple-600 text-white border-purple-300 shadow-lg shadow-purple-600/40 scale-102'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span className="text-base">⏳</span>
            <span className="text-[11px]">{lang === 'en' ? '2ND CARD' : 'LÁ THỨ 2'}</span>
            <span className="text-[9.5px] font-normal text-purple-200">
              {afterNextPlayer ? (lang === 'en' ? `Trap ${afterNextPlayer.name}` : `Hại ${afterNextPlayer.name}`) : (lang === 'en' ? 'Skip 1 turn' : 'Qua 1 lượt')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRandomSecret(false);
              setSelectedIndex(drawPileCount);
            }}
            className={`p-2.5 rounded-2xl border font-black transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
              !isRandomSecret && selectedIndex === drawPileCount
                ? 'bg-purple-600 text-white border-purple-300 shadow-lg shadow-purple-600/40 scale-102'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span className="text-base">⚓</span>
            <span className="text-[11px]">{lang === 'en' ? 'BOTTOM' : 'ĐÁY XẤP BÀI'}</span>
            <span className="text-[9.5px] font-normal text-slate-400">
              {lang === 'en' ? `Last (${drawPileCount + 1})` : `Lá cuối (${drawPileCount + 1})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsRandomSecret(true)}
            className={`p-2.5 rounded-2xl border font-black transition cursor-pointer flex flex-col items-center justify-center gap-0.5 col-span-2 sm:col-span-3 ${
              isRandomSecret
                ? 'bg-amber-600/30 text-amber-300 border-amber-400 shadow-lg shadow-amber-500/20 scale-102 ring-2 ring-amber-400'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span className="text-base">🎲</span>
            <span className="text-[11px]">{lang === 'en' ? 'SECRET RANDOM (100% UNKNOWN)' : 'NGẪU NHIÊN BÍ MẬT (100% KHÔNG AI BIẾT)'}</span>
            <span className="text-[9.5px] font-normal text-amber-300/90">
              {isRandomSecret
                ? (lang === 'en' ? '✓ Randomly placed (You do not know position)' : '✓ Đang chọn ngẫu nhiên bí mật (Bạn cũng không biết nằm ở đâu)')
                : (lang === 'en' ? 'Neither you nor others know where it lands' : 'Tùy duyên, bạn và đối thủ đều không biết nằm ở vị trí nào')}
            </span>
          </button>
        </div>

        {/* Thanh trượt chọn vị trí chính xác */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-left">
          <div className="flex justify-between items-center text-xs font-bold text-slate-300">
            <span>{lang === 'en' ? 'Position in draw pile:' : 'Vị trí trong xấp bài:'}</span>
            <span className={`font-mono font-black text-sm ${isRandomSecret ? 'text-amber-400 animate-pulse' : 'text-purple-400'}`}>
              {isRandomSecret
                ? (lang === 'en' ? '❓ Secret Random (Unknown to you as well!)' : '❓ Vị trí bí mật (Bạn cũng không biết!)')
                : selectedIndex === 0 
                ? (lang === 'en' ? 'Top card (Next draw)' : 'Đỉnh xấp bài (Bốc kế)') 
                : selectedIndex === drawPileCount 
                ? (lang === 'en' ? 'Bottom of deck' : 'Đáy xấp bài') 
                : (lang === 'en' ? `Card #${selectedIndex + 1} from top` : `Lá thứ ${selectedIndex + 1} từ trên xuống`)}
            </span>
          </div>

          {isRandomSecret ? (
            <div className="py-2.5 px-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px] text-left flex items-center gap-2">
              <span className="text-base">🎲</span>
              <span>
                {lang === 'en'
                  ? `Imploding Kitten will be secretly placed into a random spot among ${drawPileCount + 1} cards.`
                  : `Mèo Tự Nổ sẽ được nhét ngẫu nhiên vào 1 vị trí bí mật bất kỳ trong ${drawPileCount + 1} lá bài.`}
              </span>
            </div>
          ) : (
            <>
              <input
                type="range"
                min={0}
                max={drawPileCount}
                value={selectedIndex}
                onChange={(e) => {
                  setIsRandomSecret(false);
                  setSelectedIndex(parseInt(e.target.value, 10));
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />

              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>{lang === 'en' ? 'Top (Lá 1)' : 'Đỉnh (Lá 1)'}</span>
                <span>{lang === 'en' ? `Total: ${drawPileCount + 1} cards` : `Tổng xấp bài: ${drawPileCount + 1} lá`}</span>
                <span>{lang === 'en' ? 'Bottom (Đáy)' : 'Đáy'}</span>
              </div>
            </>
          )}
        </div>

        {/* Nút bấm xác nhận đặt lại */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black text-sm uppercase rounded-2xl shadow-xl shadow-purple-600/30 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🎯</span>
          <span>{lang === 'en' ? 'CONFIRM FACE-UP POSITION' : 'XÁC NHẬN ĐẶT LẠI MÈO TỰ NỔ NGỬA MẶT'}</span>
        </button>
      </div>
    </div>
  );
};

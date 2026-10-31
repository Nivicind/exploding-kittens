import React, { useState } from 'react';
import { CustomDeckConfig } from '../../engine/types';
import { CardRegistry } from '../../engine/CardRegistry';
import { Language } from '../i18n';

interface CustomDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: CustomDeckConfig;
  onSave: (config: CustomDeckConfig) => void;
  playerCount: number;
  lang?: Language;
}

export const CustomDeckModal: React.FC<CustomDeckModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  playerCount,
  lang = 'vi'
}) => {
  if (!isOpen) return null;

  const [hasImploding, setHasImploding] = useState<boolean>(() => {
    return config?.activeExpansions ? config.activeExpansions.includes('imploding') : false;
  });

  const [hasStreaking, setHasStreaking] = useState<boolean>(() => {
    return config?.activeExpansions ? config.activeExpansions.includes('streaking') : false;
  });

  const [streakingKittensCount, setStreakingKittensCount] = useState<number>(() => {
    if (config?.streakingKittensCount !== undefined) {
      return Math.max(0, Math.min(1, config.streakingKittensCount));
    }
    if (config?.cardCounts?.['streaking_kitten'] !== undefined) {
      return Math.max(0, Math.min(1, config.cardCounts['streaking_kitten']));
    }
    return config?.activeExpansions?.includes('streaking') ? 1 : 1;
  });

  const activePacks: string[] = ['base'];
  if (hasImploding) activePacks.push('imploding');
  if (hasStreaking) activePacks.push('streaking');

  const allCards = CardRegistry.getAllCards(activePacks).filter(
    c => c.type !== 'KITTEN' && c.type !== 'DEFUSE' && c.id !== 'streaking_kitten'
  );

  const totalBombs = (hasStreaking && streakingKittensCount > 0) ? playerCount : Math.max(1, playerCount - 1);
  const minRequiredBombs = (hasStreaking && streakingKittensCount > 0) ? playerCount : Math.max(1, playerCount - 1);
  const defaultHandSize = playerCount <= 5 ? 7 : 4;
  const [handSize, setHandSize] = useState<number>(config?.handSize ?? defaultHandSize);
  const [defuseInDeck, setDefuseInDeck] = useState<number>(config?.defuseInDeck ?? 2);

  const defaultImploding = hasImploding ? Math.min(1, totalBombs) : 0;
  const [implodingKittensCount, setImplodingKittensCount] = useState<number>(() => {
    if (!hasImploding) return 0;
    if (config?.implodingKittensCount !== undefined) {
      return Math.max(0, Math.min(totalBombs, config.implodingKittensCount));
    }
    return defaultImploding;
  });

  const explodingKittensCount = totalBombs - (hasImploding ? implodingKittensCount : 0);
  const currentTotalBombs = explodingKittensCount + (hasImploding ? implodingKittensCount : 0);
  const isBombCountValid = currentTotalBombs >= minRequiredBombs;

  const [cardCounts, setCardCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const card of allCards) {
      initial[card.id] = config?.cardCounts?.[card.id] ?? card.defaultCount;
    }
    return initial;
  });

  const totalRegularCards = allCards.reduce((acc, c) => acc + (cardCounts[c.id] ?? c.defaultCount), 0);

  const handleToggleImploding = () => {
    const nextHasImploding = !hasImploding;
    setHasImploding(nextHasImploding);

    if (nextHasImploding) {
      setImplodingKittensCount(Math.min(1, totalBombs));
    } else {
      setImplodingKittensCount(0);
    }
  };

  const handleToggleStreaking = () => {
    const nextHasStreaking = !hasStreaking;
    setHasStreaking(nextHasStreaking);
    const nextStreakingCount = nextHasStreaking ? 1 : 0;
    setStreakingKittensCount(nextStreakingCount);
    const nextTotalBombs = (nextHasStreaking && nextStreakingCount > 0) ? playerCount : Math.max(1, playerCount - 1);
    if (hasImploding) {
      setImplodingKittensCount(prev => Math.min(prev, nextTotalBombs));
    }
  };

  const handleStreakingCountChange = (count: number) => {
    const nextCount = Math.max(0, Math.min(1, count));
    setStreakingKittensCount(nextCount);
    const nextTotalBombs = (hasStreaking && nextCount > 0) ? playerCount : Math.max(1, playerCount - 1);
    if (hasImploding) {
      setImplodingKittensCount(prev => Math.min(prev, nextTotalBombs));
    }
  };

  const handleCountChange = (defId: string, delta: number) => {
    setCardCounts(prev => {
      const current = prev[defId] ?? CardRegistry.getCard(defId)?.defaultCount ?? 0;
      const next = Math.max(0, Math.min(15, current + delta));
      return { ...prev, [defId]: next };
    });
  };

  const handleReset = () => {
    setHasImploding(false);
    setHasStreaking(false);
    setStreakingKittensCount(1);
    setHandSize(playerCount <= 5 ? 7 : 4);
    setDefuseInDeck(2);
    setImplodingKittensCount(0);
    const resetCounts: Record<string, number> = {};
    const baseCards = CardRegistry.getAllCards(['base']).filter(c => c.type !== 'KITTEN' && c.type !== 'DEFUSE' && c.id !== 'streaking_kitten');
    for (const card of baseCards) {
      resetCounts[card.id] = card.defaultCount;
    }
    setCardCounts(resetCounts);
  };

  const handleSave = () => {
    if (!isBombCountValid) return;
    const finalImploding = hasImploding ? Math.max(0, Math.min(totalBombs, implodingKittensCount)) : 0;
    const finalExploding = totalBombs - finalImploding;
    const finalStreaking = hasStreaking ? streakingKittensCount : 0;
    const finalCardCounts = {
      ...cardCounts,
      streaking_kitten: finalStreaking
    };
    onSave({
      handSize,
      defuseInDeck,
      cardCounts: finalCardCounts,
      explodingKittensCount: finalExploding,
      implodingKittensCount: finalImploding,
      streakingKittensCount: finalStreaking,
      activeExpansions: activePacks
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-4 sm:p-6 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-yellow-400 flex items-center gap-2">
              <span>🛠️</span> {lang === 'en' ? 'Customize Deck (Deck Setup)' : 'Tùy Chỉnh Bộ Bài (Deck Setup)'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {lang === 'en' 
                ? `Configure card counts and expansion rules for ${playerCount} players.`
                : `Điều chỉnh số lượng từng loại lá bài và luật mở rộng cho ${playerCount} người chơi.`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Nội dung cấu hình cuộn được */}
        <div className="overflow-y-auto flex-1 my-3 pr-1 sm:pr-2 space-y-4">
          {/* BANNER BẬT/TẮT BẢN MỞ RỘNG IMPLODING KITTENS */}
          <div 
            onClick={handleToggleImploding}
            className={`p-3.5 sm:p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 shadow-lg select-none ${
              hasImploding
                ? 'bg-gradient-to-r from-purple-950/80 to-slate-900 border-purple-500 shadow-purple-950/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-3xl animate-bounce-short">🌀</span>
              <div>
                <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-purple-300">
                  <span>{lang === 'en' ? 'Expansion: Imploding Kittens 💣💥' : 'Bản Mở Rộng: Imploding Kittens 💣💥'}</span>
                  {hasImploding && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                      {lang === 'en' ? 'ACTIVE' : 'ĐANG BẬT'}
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                  {lang === 'en'
                    ? 'Adds 6 new cards: Imploding Kitten, Targeted Attack, Alter Future, Draw Bottom, Reverse, Feral Cat.'
                    : 'Tích hợp 6 lá bài mới: Mèo Tự Nổ, Tấn Công Mục Tiêu, Đổi Tương Lai, Rút Đáy, Đảo Chiều, Mèo Hoang.'}
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <div className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full p-0.5 sm:p-1 flex items-center transition flex-shrink-0 ${hasImploding ? 'bg-purple-600 justify-end' : 'bg-slate-800 justify-start'}`}>
              <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition" />
            </div>
          </div>

          {/* BANNER BẬT/TẮT BẢN MỞ RỘNG STREAKING KITTENS */}
          <div 
            onClick={handleToggleStreaking}
            className={`p-3.5 sm:p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 shadow-lg select-none ${
              hasStreaking
                ? 'bg-gradient-to-r from-orange-950/80 to-slate-900 border-orange-500 shadow-orange-950/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-3xl animate-bounce-short">⚡</span>
              <div>
                <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-orange-300">
                  <span>{lang === 'en' ? 'Expansion: Streaking Kittens 🐱⚡' : 'Bản Mở Rộng: Streaking Kittens 🐱⚡'}</span>
                  {hasStreaking && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                      {lang === 'en' ? 'ACTIVE' : 'ĐANG BẬT'}
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                  {lang === 'en'
                    ? 'Adds 8 official cards: Streaking Kitten, Super Skip, See Future 5X, Alter Future 5X, Swap Top/Bottom, Catomic Bomb, Mark, Curse of Cat Butt.'
                    : 'Tích hợp 8 lá bài chính thức: Mèo Khỏa Thân, Siêu Bỏ Lượt, Xem Tương Lai 5X, Đổi Tương Lai 5X, Tráo Đỉnh Đáy, Bom Hạt Nhân, Đánh Dấu, Lời Nguyền Mông Mèo.'}
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <div className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full p-0.5 sm:p-1 flex items-center transition flex-shrink-0 ${hasStreaking ? 'bg-orange-600 justify-end' : 'bg-slate-800 justify-start'}`}>
              <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition" />
            </div>
          </div>

          {/* Cấu hình lượt chia & Defuse */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">
                {lang === 'en' ? 'Initial cards dealt per player:' : 'Số bài phát đầu trận mỗi người:'} <span className="text-yellow-400 font-black">{handSize} {lang === 'en' ? 'cards' : 'lá'}</span> (+1 Defuse)
              </label>
              <input
                type="range"
                min="2"
                max="8"
                value={handSize}
                onChange={e => setHandSize(parseInt(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === 'en' ? '(Default: 7 cards for ≤5 players, 4 cards for 6-10)' : '(Gốc: 7 lá cho ≤5 người, 4 lá cho 6-10 người)'}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">
                {lang === 'en' ? 'Extra Defuse cards in draw pile:' : 'Số lá Defuse dư trong xấp rút:'} <span className="text-emerald-400 font-black">{defuseInDeck} {lang === 'en' ? 'cards' : 'lá'}</span>
              </label>
              <input
                type="range"
                min="0"
                max="6"
                value={defuseInDeck}
                onChange={e => setDefuseInDeck(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === 'en' ? '(Each player already receives 1 Defuse at start)' : '(Mỗi người đã nhận sẵn 1 lá Defuse lúc đầu)'}
              </p>
            </div>
          </div>

          {/* Cấu hình Số lượng Bom & Mèo Đặc Biệt (Kitten Cards) */}
          <div className="bg-slate-950/80 p-3.5 sm:p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg">🐱</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-rose-400 uppercase tracking-wide">
                    {lang === 'en' ? 'Special Kitten Cards & Lethal Bombs' : 'Các Thẻ Mèo Đặc Biệt & Số Lượng Bom'}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {hasStreaking && streakingKittensCount > 0
                      ? (lang === 'en'
                          ? `With 1 Streaking Kitten, total lethal bombs = ${playerCount} cards (1 player can secretly hold a bomb).`
                          : `Với 1 lá Streaking Kitten, tổng số bom = ${playerCount} lá (vì 1 người có thể ôm bom an toàn).`)
                      : (lang === 'en' 
                          ? `Total lethal bombs is strictly fixed = ${playerCount} - 1 = ${totalBombs} cards to ensure 1 sole winner.` 
                          : `Tổng số bom bắt buộc cố định = ${playerCount} - 1 = ${totalBombs} lá để luôn tìm ra duy nhất 1 người thắng.`)}
                  </p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-mono font-black text-xs sm:text-sm whitespace-nowrap">
                🔒 {totalBombs} {lang === 'en' ? 'bombs' : 'bom'}
              </div>
            </div>

            {/* Cảnh báo nếu số bom không hợp lệ */}
            {!isBombCountValid && (
              <div className="p-2.5 bg-rose-950/80 border-2 border-rose-500 text-rose-200 rounded-xl text-xs flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <div className="font-black uppercase tracking-wide">
                    {lang === 'en' ? 'Invalid Bomb Count!' : 'Số Lượng Bom Không Hợp Lệ!'}
                  </div>
                  <div className="text-[11px] text-rose-300/90 mt-0.5">
                    {lang === 'en'
                      ? `At least ${minRequiredBombs} bombs are required for ${playerCount} players. Otherwise the deck will run out of bombs with 2 survivors!`
                      : `Cần tối thiểu ${minRequiredBombs} bom cho ${playerCount} người chơi. Nếu ít hơn, xấp bài sẽ cạn sạch bom khi còn 2 người và không thể tìm ra người chiến thắng!`}
                  </div>
                </div>
              </div>
            )}

            <div className={`grid grid-cols-1 ${hasImploding && hasStreaking ? 'sm:grid-cols-3' : (hasImploding || hasStreaking) ? 'sm:grid-cols-2' : ''} gap-3`}>
              {/* Thẻ Mèo Nổ (Exploding Kittens) - CỐ ĐỊNH / TỰ ĐỘNG CÂN BẰNG, KHÔNG CHO CHỈNH TỰ DO */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-200 mb-1">
                    <span className="flex items-center gap-1.5 text-rose-400 font-black">
                      <span>💣</span> {lang === 'en' ? 'Exploding Kittens:' : 'Mèo Nổ (Exploding):'}
                    </span>
                    <span className="font-mono text-rose-400 font-black text-sm">
                      {explodingKittensCount} {lang === 'en' ? 'cards' : 'lá'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                    {hasImploding 
                      ? (lang === 'en' 
                          ? `Auto-balanced = ${totalBombs} total - ${implodingKittensCount} Imploding.` 
                          : `Tự động cân bằng = Tổng ${totalBombs} bom - ${implodingKittensCount} Mèo Tự Nổ.`) 
                      : (lang === 'en' 
                          ? `Fixed = ${totalBombs} cards (${playerCount} players - 1).` 
                          : `Cố định = ${totalBombs} lá (${playerCount} người chơi - 1).`)}
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <span>🔒</span>
                  <span>{lang === 'en' ? 'Auto-balanced' : 'Tự cân bằng theo tổng bom'}</span>
                </div>
              </div>

              {/* Thẻ Mèo Tự Nổ (Imploding Kittens) - CHỈ HIỆN KHI BẬT MỞ RỘNG VÀ ĐƯỢC PHÉP CHỈNH TỪ 0 ĐẾN TOTAL BOMBS */}
              {hasImploding && (
                <div className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-200 mb-1">
                      <span className="flex items-center gap-1.5 text-purple-400 font-black">
                        <span>🌀</span> {lang === 'en' ? 'Imploding Kittens:' : 'Mèo Tự Nổ (Imploding):'}
                      </span>
                      <span className="font-mono text-purple-400 font-black text-sm">
                        {implodingKittensCount} {lang === 'en' ? 'cards' : 'lá'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={totalBombs}
                      value={implodingKittensCount}
                      onChange={e => {
                        const val = Math.max(0, Math.min(totalBombs, parseInt(e.target.value) || 0));
                        setImplodingKittensCount(val);
                      }}
                      className="w-full accent-purple-500 cursor-pointer my-1.5"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>0 ({lang === 'en' ? 'Min' : 'Thấp nhất'})</span>
                      <span className="text-purple-300 font-bold">{lang === 'en' ? 'Adjustable' : 'Tùy chỉnh'}</span>
                      <span>{totalBombs} ({lang === 'en' ? 'Max' : 'Tối đa'})</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-purple-300/80 leading-relaxed mt-1">
                    {lang === 'en'
                      ? 'Adjustable from 0 to total bombs. Defuse is useless!'
                      : 'Có thể chỉnh từ 0 đến tối đa tổng bom. Rút trúng lần 2 sẽ chết ngay!'}
                  </p>
                </div>
              )}

              {/* Thẻ Mèo Khỏa Thân (Streaking Kitten ⚡) - TỐI ĐA 1 LÁ, TỐI THIỂU 0 LÁ */}
              {hasStreaking && (
                <div className="bg-orange-950/30 border border-orange-500/40 rounded-xl p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-200 mb-1">
                      <span className="flex items-center gap-1.5 text-orange-400 font-black">
                        <span>⚡</span> {lang === 'en' ? 'Streaking Kitten:' : 'Mèo Khỏa Thân (Streaking):'}
                      </span>
                      <span className="font-mono text-orange-400 font-black text-sm">
                        {streakingKittensCount} {lang === 'en' ? 'card' : 'lá'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 my-2 bg-slate-900/80 p-1.5 rounded-lg border border-orange-500/20">
                      <span className="text-[10px] text-slate-300 font-bold">
                        {lang === 'en' ? 'Quantity (0 - 1):' : 'Số lượng (0 - 1):'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStreakingCountChange(0)}
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                            streakingKittensCount === 0 
                              ? 'bg-orange-500 text-slate-950 shadow-md font-black' 
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          0
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStreakingCountChange(1)}
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                            streakingKittensCount === 1 
                              ? 'bg-orange-500 text-slate-950 shadow-md font-black' 
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          1
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-orange-300/80 leading-relaxed mt-1">
                    {lang === 'en'
                      ? 'Min 0, Max 1 card. Allows secretly holding 1 Exploding Kitten!'
                      : 'Tối thiểu 0, tối đa 1 lá. Cho phép bí mật ôm 1 Mèo Nổ trên tay an toàn!'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Thống kê tổng quan */}
          <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 sm:p-3 rounded-lg border border-slate-800">
            <span className="text-slate-300">
              {lang === 'en' ? 'Total regular cards:' : 'Tổng số lá bài thường:'} <strong className="text-yellow-400">{totalRegularCards} {lang === 'en' ? 'cards' : 'lá'}</strong>
            </span>
            <span className="text-slate-300">
              {lang === 'en' ? 'Total lethal cards:' : 'Tổng số bom:'} <strong className="text-rose-500 font-mono font-black">{totalBombs} {lang === 'en' ? 'cards' : 'lá'}</strong> <span className="text-slate-500 text-[10px]">({explodingKittensCount} 💣 + {hasImploding ? implodingKittensCount : 0} 🌀)</span>
            </span>
          </div>

          {/* Danh sách từng loại lá bài */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {lang === 'en' ? 'Card count per type in deck:' : 'Số lượng từng loại thẻ bài trong bộ:'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allCards.map(card => {
                const count = cardCounts[card.id] ?? card.defaultCount;
                return (
                  <div
                    key={card.id}
                    className="flex items-center justify-between bg-slate-800/40 border border-slate-700/50 p-2 sm:p-2.5 rounded-lg hover:border-slate-600 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{card.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {lang === 'en' ? card.nameEn : card.nameVi}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {lang === 'en' ? `Default: ${card.defaultCount}` : `Gốc: ${card.defaultCount}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleCountChange(card.id, -1)}
                        className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm flex items-center justify-center transition cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-extrabold text-xs sm:text-sm text-yellow-300 font-mono">
                        {count}
                      </span>
                      <button
                        onClick={() => handleCountChange(card.id, 1)}
                        className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm flex items-center justify-center transition cursor-pointer"
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
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
          >
            {lang === 'en' ? '↺ Reset to Default' : '↺ Khôi phục Mặc Định'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              {lang === 'en' ? 'Cancel' : 'Hủy'}
            </button>
            <button
              onClick={handleSave}
              disabled={!isBombCountValid}
              className="px-4 py-1.5 text-xs font-bold text-slate-900 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-md transition cursor-pointer"
            >
              {lang === 'en' ? 'Save Settings' : 'Lưu Cấu Hình'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



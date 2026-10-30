import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardInstance, PlayerState } from '../../engine/types';
import { CardRegistry } from '../../engine/CardRegistry';
import { CardView } from './CardView';
import { sound } from '../../engine/audio/SoundEffects';
import { Language, UI_TEXT, CARD_I18N } from '../i18n';

interface PlayerHandProps {
  player: PlayerState;
  isMyTurn: boolean;
  isNopeWindow?: boolean;
  isGiveFavorMode?: boolean;
  favorInitiatorName?: string;
  onGiveFavorCard?: (cardUid: string) => void;
  stolenNotification?: string | null;
  onPlaySingleCard: (cardUid: string, defId: string) => void;
  onPlayComboTwo: (cardUids: [string, string]) => void;
  onPlayComboThree: (cardUids: [string, string, string]) => void;
  onPlayComboFive: (cardUids: string[]) => void;
  onPlayNope?: (cardUid: string) => void;
  disabled?: boolean;
  lang?: Language;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  isMyTurn,
  isNopeWindow = false,
  isGiveFavorMode = false,
  favorInitiatorName = 'Đối thủ',
  onGiveFavorCard,
  stolenNotification = null,
  onPlaySingleCard,
  onPlayComboTwo,
  onPlayComboThree,
  onPlayComboFive,
  onPlayNope,
  disabled = false,
  lang = 'vi'
}) => {
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Tự động lọc bỏ các UID bài đã bị mất / bị cướp / đã đánh ra khỏi tay
  useEffect(() => {
    setSelectedUids(prev => prev.filter(uid => player.hand.some(c => c.uid === uid)));
  }, [player.hand]);

  // Xóa lựa chọn khi hết lượt (nếu không ở chế độ giao nộp Favor)
  useEffect(() => {
    if (!isMyTurn && !isGiveFavorMode) {
      setSelectedUids([]);
    }
  }, [isMyTurn, isGiveFavorMode]);

  const handleCardClick = (card: CardInstance) => {
    // Nếu đang trong cửa sổ Nope và lá được click là Nope -> đánh Nope ngay!
    if (isNopeWindow && card.defId === 'nope' && onPlayNope) {
      sound.playNope();
      onPlayNope(card.uid);
      return;
    }

    // Nếu đang trong chế độ chọn bài để đưa cho người xin (Favor)
    if (isGiveFavorMode) {
      sound.playCardPlay();
      setSelectedUids([card.uid]);
      return;
    }

    if (disabled) return;
    sound.playCardPlay();

    setSelectedUids(prev => {
      if (prev.includes(card.uid)) {
        return prev.filter(uid => uid !== card.uid);
      } else {
        return [...prev, card.uid];
      }
    });
  };

  const clearSelection = () => {
    setSelectedUids([]);
  };

  // Phân tích các lá bài đang chọn
  const selectedCards = player.hand.filter(c => selectedUids.includes(c.uid));
  const count = selectedCards.length;

  let canPlaySingle = false;
  let singleCardDef: any = null;
  let canPlayComboTwo = false;
  let canPlayComboThree = false;
  let canPlayComboFive = false;

  if (count === 1) {
    singleCardDef = CardRegistry.getCard(selectedCards[0].defId);
    if (singleCardDef && singleCardDef.type !== 'CAT' && singleCardDef.type !== 'DEFUSE' && singleCardDef.type !== 'KITTEN') {
      canPlaySingle = true;
    }
  } else if (count === 2) {
    if (selectedCards[0].defId === selectedCards[1].defId) {
      canPlayComboTwo = true;
    }
  } else if (count === 3) {
    if (
      selectedCards[0].defId === selectedCards[1].defId &&
      selectedCards[1].defId === selectedCards[2].defId
    ) {
      canPlayComboThree = true;
    }
  } else if (count === 5) {
    const uniqueDefs = new Set(selectedCards.map(c => c.defId));
    if (uniqueDefs.size === 5) {
      canPlayComboFive = true;
    }
  }

  const executePlay = () => {
    if (!isMyTurn && !selectedCards.some(c => c.defId === 'nope')) return;

    if (canPlaySingle) {
      onPlaySingleCard(selectedCards[0].uid, selectedCards[0].defId);
      clearSelection();
    } else if (canPlayComboTwo) {
      onPlayComboTwo([selectedCards[0].uid, selectedCards[1].uid]);
      clearSelection();
    } else if (canPlayComboThree) {
      onPlayComboThree([selectedCards[0].uid, selectedCards[1].uid, selectedCards[2].uid]);
      clearSelection();
    } else if (canPlayComboFive) {
      onPlayComboFive(selectedCards.map(c => c.uid));
      clearSelection();
    }
  };

  const totalCards = player.hand.length;
  const midIndex = (totalCards - 1) / 2;

  // Tính khoảng gối đầu linh hoạt theo số bài (nhiều bài thì gối sâu hơn để luôn vừa màn hình)
  const overlapClass = totalCards > 7 
    ? '-space-x-14 sm:-space-x-16 md:-space-x-12' 
    : totalCards > 4 
      ? '-space-x-10 sm:-space-x-12 md:-space-x-8' 
      : '-space-x-6 sm:-space-x-8';

  const singleCardName = selectedCards[0]
    ? (CARD_I18N[selectedCards[0].defId]?.[lang]?.name || singleCardDef?.nameVi || selectedCards[0].defId)
    : '';

  return (
    <div className="flex flex-col items-center w-full relative h-full justify-end overflow-visible">
      {/* 1. THÔNG BÁO BỊ CƯỚP BÀI / BỊ TẤN CÔNG (HIỂN THỊ NỔI PHÍA TRÊN BÀN TAY) */}
      {stolenNotification && !isGiveFavorMode && (
        <div className="absolute -top-12 sm:-top-14 z-50 flex items-center gap-2 bg-rose-950/95 border-2 border-rose-500 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in max-w-[90vw]">
          <span className="text-sm sm:text-base animate-bounce">🦹‍♂️</span>
          <span className="text-[11px] sm:text-xs font-black text-rose-200 truncate px-0.5">
            {stolenNotification}
          </span>
        </div>
      )}

      {/* Thông báo lượt đi & số lá bài phải bốc (luôn hiển thị rõ ràng khi đến lượt) */}
      {isMyTurn && !stolenNotification && !isGiveFavorMode && count === 0 && (
        <div className={`absolute -top-12 sm:-top-14 z-40 px-3.5 sm:px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-1.5 sm:gap-2 animate-pulse max-w-[92vw] ${
          player.turnsToTake > 1
            ? 'bg-amber-950/95 border-2 border-amber-400/90'
            : 'bg-emerald-950/95 border-2 border-emerald-400/90'
        }`}>
          <span className="text-sm sm:text-base">{player.turnsToTake > 1 ? '⚔️' : '👉'}</span>
          <span className={`text-[10px] sm:text-xs font-black truncate px-0.5 ${player.turnsToTake > 1 ? 'text-amber-300' : 'text-emerald-300'}`}>
            {player.turnsToTake > 1
              ? UI_TEXT[lang].yourTurnAttack(player.turnsToTake)
              : UI_TEXT[lang].yourTurnDraw1}
          </span>
        </div>
      )}

      {/* 2. CHẾ ĐỘ XIN XỎ (FAVOR): CHỌN BÀI TRỰC TIẾP TRÊN TAY KHÔNG CẦN POPUP */}
      {isGiveFavorMode && (
        <div className="absolute -top-14 z-50 flex items-center gap-2.5 animate-fade-in">
          {count === 1 ? (
            <div className="flex items-center gap-2.5 bg-slate-900/95 border-2 border-teal-400 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md">
              <span className="text-xs font-bold text-slate-200">
                🎁 {lang === 'en' ? 'Give' : 'Giao nộp lá'} <strong className="text-teal-300">{singleCardName}</strong> {lang === 'en' ? 'to' : 'cho'} <strong className="text-yellow-400">{favorInitiatorName}</strong>:
              </span>
              <button
                type="button"
                onClick={() => {
                  if (onGiveFavorCard && selectedCards[0]) {
                    onGiveFavorCard(selectedCards[0].uid);
                    clearSelection();
                  }
                }}
                className="py-1 px-3.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
              >
                {UI_TEXT[lang].confirmGive}
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded transition cursor-pointer"
              >
                {UI_TEXT[lang].changeCard}
              </button>
            </div>
          ) : (
            <div className="bg-teal-950/95 border-2 border-teal-400/90 px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-pulse">
              <span className="text-base">🎁</span>
              <span className="text-xs font-black text-teal-300">
                {UI_TEXT[lang].favorAskNotify(favorInitiatorName)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. THANH CÔNG CỤ KHI CHỌN BÀI ĐỂ ĐÁNH BÌNH THƯỜNG */}
      {!isGiveFavorMode && count > 0 && (
        <div className="absolute -top-14 z-50 flex items-center gap-2 bg-slate-900/95 border-2 border-yellow-400 px-3.5 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in">
          <span className="text-[11px] font-bold text-slate-300">
            {UI_TEXT[lang].selectedCards} <strong className="text-yellow-400">{count} {UI_TEXT[lang].cardsUnit}</strong>
          </span>

          {canPlaySingle && (
            <button
              onClick={executePlay}
              className="py-1 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] uppercase rounded-xl shadow-md transition"
            >
              {UI_TEXT[lang].playCardBtn(singleCardName)}
            </button>
          )}

          {canPlayComboTwo && (
            <button
              onClick={executePlay}
              className="py-1 px-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-[11px] uppercase rounded-xl shadow-md transition"
            >
              {UI_TEXT[lang].combo2Btn}
            </button>
          )}

          {canPlayComboThree && (
            <button
              onClick={executePlay}
              className="py-1 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] uppercase rounded-xl shadow-md transition"
            >
              {UI_TEXT[lang].combo3Btn}
            </button>
          )}

          {canPlayComboFive && (
            <button
              onClick={executePlay}
              className="py-1 px-3 bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-black text-[11px] uppercase rounded-xl shadow-md transition"
            >
              {UI_TEXT[lang].combo5Btn}
            </button>
          )}

          {!canPlaySingle && !canPlayComboTwo && !canPlayComboThree && !canPlayComboFive && (
            <span className="text-[10px] text-slate-400 italic px-1">
              {count === 1 && selectedCards[0]?.defId.startsWith('cat_')
                ? UI_TEXT[lang].catCardHint
                : UI_TEXT[lang].invalidCombo}
            </span>
          )}

          <button
            onClick={clearSelection}
            className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded transition cursor-pointer"
          >
            {UI_TEXT[lang].deselect}
          </button>
        </div>
      )}

      {/* DANH SÁCH LÁ BÀI XÒE QUẠT SO LE & HOVER TÁCH BÀI (HỖ TRỢ CẢ MOBILE VÀ PC - KHÔNG BỊ CẮT ĐỨT) */}
      <div className={`w-full overflow-x-auto sm:overflow-visible overflow-y-visible pt-16 sm:pt-20 pb-3 px-8 flex justify-start sm:justify-center items-end ${overlapClass} touch-pan-x`}>
        <AnimatePresence initial={false}>
          {player.hand.map((card, idx) => {
            const isSelected = selectedUids.includes(card.uid);
            const isNopeCard = card.defId === 'nope';
            const showNopeGlow = isNopeWindow && isNopeCard;
            const isHovered = hoveredIndex === idx;

            // Tính toán góc nghiêng hình cánh quạt nhẹ
            const diff = idx - midIndex;
            const angleStep = Math.min(2.8, 24 / Math.max(1, totalCards));
            const naturalRotate = diff * angleStep;

            // Uốn cung nhẹ lên trên ở giữa để phần description của tất cả các lá luôn nằm trên mép màn hình
            const normDiff = Math.abs(diff) / Math.max(1, midIndex);
            const naturalY = -(1 - Math.pow(normDiff, 2)) * 6;

            // Khi hover lá bài: lá bài bên cạnh né sang một chút để tách bài kiểu Balatro
            let shiftX = 0;
            if (hoveredIndex !== null) {
              if (idx < hoveredIndex) shiftX = -12;
              if (idx > hoveredIndex) shiftX = 12;
            }

            return (
              <motion.div
                key={card.uid}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{
                  opacity: 1,
                  rotate: isHovered || isSelected ? 0 : naturalRotate,
                  y: isSelected ? -26 : isHovered ? -36 : naturalY,
                  x: isHovered ? 0 : shiftX,
                  scale: isHovered ? 1.15 : isSelected ? 1.08 : 1,
                  zIndex: isHovered ? 70 : isSelected ? 50 : idx + 10
                }}
                exit={{
                  y: -90,
                  opacity: 0,
                  scale: 0.85,
                  rotate: 6,
                  filter: 'brightness(1.5)',
                  transition: { duration: 0.6, ease: 'easeOut' }
                }}
                onMouseEnter={() => {
                  setHoveredIndex(idx);
                  sound.playCardPlay();
                }}
                onMouseLeave={() => setHoveredIndex(null)}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 25
                }}
                className="relative flex-shrink-0 cursor-pointer origin-bottom"
              >
                {/* Nút bấm Đánh NOPE nổi ngay trên đầu lá bài (Căn giữa chuẩn xác, không bị cắt xén) */}
                {showNopeGlow && (
                  <div className="absolute -top-9 sm:-top-10 inset-x-0 flex items-center justify-center z-50 pointer-events-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playNope();
                        if (onPlayNope) onPlayNope(card.uid);
                      }}
                      className="py-1 px-2.5 sm:px-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] sm:text-xs uppercase rounded-full shadow-2xl shadow-rose-600/90 border-2 border-rose-300 flex items-center gap-1 animate-bounce cursor-pointer whitespace-nowrap"
                    >
                      <span>🚫</span> {lang === 'en' ? 'PLAY NOPE!' : 'ĐÁNH NOPE!'}
                    </button>
                  </div>
                )}

                <CardView
                  card={card}
                  lang={lang}
                  isSelected={isSelected}
                  onClick={() => handleCardClick(card)}
                  disabled={disabled && !showNopeGlow && !isGiveFavorMode}
                  highlight={showNopeGlow || (isGiveFavorMode && !isSelected)}
                  className={
                    showNopeGlow 
                      ? 'ring-4 ring-rose-500 shadow-rose-600/90 shadow-2xl' 
                      : isGiveFavorMode && isSelected 
                      ? 'ring-4 ring-teal-400 shadow-teal-500/80 shadow-2xl' 
                      : ''
                  }
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

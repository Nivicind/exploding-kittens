import React, { useState } from 'react';
import { PlayerState, CardDefinition } from '../../engine/types';
import { CardRegistry } from '../../engine/CardRegistry';
import { CardView } from './CardView';
import { Language } from '../i18n';

interface ComboTargetModalProps {
  mode: 'FAVOR_TARGET' | 'COMBO_TWO' | 'COMBO_THREE' | 'GIVE_FAVOR_CARD' | 'TARGETED_ATTACK';
  opponents?: PlayerState[];
  myHand?: PlayerState['hand'];
  initiatorName?: string;
  onConfirmTarget: (targetPlayerId: string, targetCardDefId?: string) => void;
  onGiveCard?: (cardUid: string) => void;
  onCancel?: () => void;
  lang?: Language;
}

export const ComboTargetModal: React.FC<ComboTargetModalProps> = ({
  mode,
  opponents = [],
  myHand = [],
  initiatorName = '',
  onConfirmTarget,
  onGiveCard,
  onCancel,
  lang = 'vi'
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(opponents[0]?.id || '');
  const [selectedCardDefId, setSelectedCardDefId] = useState<string>('defuse');
  const [selectedMyCardUid, setSelectedMyCardUid] = useState<string>(myHand[0]?.uid || '');

  // Toàn bộ các định nghĩa bài có thể đòi (cho Combo 3) - hỗ trợ cả bản gốc và mở rộng Imploding
  const availableDefs = CardRegistry.getAllCards(['base', 'imploding']);

  // Trường hợp nạn nhân phải chọn 1 lá bài trên tay để đưa (GIVE_FAVOR_CARD)
  if (mode === 'GIVE_FAVOR_CARD') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in select-none">
        <div className="bg-slate-900 border-4 border-cyan-500 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-center space-y-5">
          <div>
            <div className="w-16 h-16 bg-cyan-500/20 border-2 border-cyan-500 rounded-full flex items-center justify-center mx-auto text-3xl mb-2">
              🤝
            </div>
            <h3 className="text-2xl font-black text-cyan-400 uppercase tracking-wide">
              {lang === 'en' ? `Give Card to ${initiatorName}` : `Đưa Bài Cho ${initiatorName}`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {lang === 'en' 
                ? `${initiatorName} played a Favor card on you! You must select 1 card from your hand to surrender.` 
                : `${initiatorName} vừa dùng lá Xin Xỏ (Favor) với bạn! Bạn phải tự chọn 1 lá bài từ tay của mình để cống nạp.`}
            </p>
          </div>

          {/* Danh sách bài trên tay để chọn */}
          <div className="flex flex-wrap justify-center gap-2 max-h-60 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
            {myHand.map(card => (
              <div key={card.uid} onClick={() => setSelectedMyCardUid(card.uid)} className="cursor-pointer">
                <CardView
                  card={card}
                  isCompact={true}
                  isSelected={selectedMyCardUid === card.uid}
                  lang={lang}
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => onGiveCard && onGiveCard(selectedMyCardUid)}
            disabled={!selectedMyCardUid}
            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base rounded-2xl shadow-lg shadow-cyan-500/30 transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {lang === 'en' ? 'Confirm Give This Card ➔' : 'Xác Nhận Đưa Lá Bài Này ➔'}
          </button>
        </div>
      </div>
    );
  }

  // Tiêu đề tương ứng với mode
  const title = mode === 'TARGETED_ATTACK'
    ? (lang === 'en' ? 'Targeted Attack 2X: Choose Target' : 'Tấn Công Có Mục Tiêu (Targeted Attack 2X)')
    : mode === 'FAVOR_TARGET' 
    ? (lang === 'en' ? 'Favor: Choose Player to Ask' : 'Chọn Người Chơi Để Xin Bài (Favor)')
    : mode === 'COMBO_TWO' 
      ? (lang === 'en' ? '2-Card Combo: Choose Player to Steal Randomly' : 'Combo 2 Lá: Chọn Mục Tiêu Cướp Bài Ngẫu Nhiên')
      : (lang === 'en' ? '3-Card Combo: Choose Player & Name a Card' : 'Combo 3 Lá: Chọn Mục Tiêu & Gọi Tên Lá Bài');

  const subtitle = mode === 'TARGETED_ATTACK'
    ? (lang === 'en' ? 'The selected player will immediately take 2 turns in a row!' : 'Người chơi được chọn sẽ lập tức bị ép đi 2 lượt liên tiếp!')
    : mode === 'COMBO_THREE'
    ? (lang === 'en' ? 'If they have the named card, they must give it to you. If not, you get nothing!' : 'Nếu mục tiêu có lá bài bạn gọi tên, họ bắt buộc phải đưa cho bạn. Nếu không, bạn nhận số 0!')
    : (lang === 'en' ? 'Choose 1 living opponent to target.' : 'Chọn 1 đối thủ còn sống để thực thi hành động.');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className={`bg-slate-900 border-4 ${mode === 'TARGETED_ATTACK' ? 'border-orange-500 shadow-orange-950/80' : 'border-yellow-400'} rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center space-y-6`}>
        <div>
          <div className={`w-16 h-16 ${mode === 'TARGETED_ATTACK' ? 'bg-orange-500/20 border-orange-500' : 'bg-yellow-400/20 border-yellow-400'} border-2 rounded-full flex items-center justify-center mx-auto text-3xl mb-2`}>
            {mode === 'TARGETED_ATTACK' ? '🎯' : '🎯'}
          </div>
          <h3 className={`text-xl sm:text-2xl font-black ${mode === 'TARGETED_ATTACK' ? 'text-orange-400' : 'text-yellow-400'} uppercase tracking-wide`}>
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {subtitle}
          </p>
        </div>

        {/* 1. Chọn người chơi mục tiêu */}
        <div className="text-left space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'en' ? '1. Select Target Opponent:' : '1. Chọn đối thủ mục tiêu:'}
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {opponents.map(opp => (
              <button
                key={opp.id}
                type="button"
                onClick={() => setSelectedPlayerId(opp.id)}
                className={`p-3 rounded-xl border-2 text-left transition flex items-center justify-between cursor-pointer ${
                  selectedPlayerId === opp.id
                    ? (mode === 'TARGETED_ATTACK' ? 'bg-orange-500/25 border-orange-400 text-white font-bold ring-2 ring-orange-300/50' : 'bg-yellow-400/20 border-yellow-400 text-white font-bold')
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="truncate">
                  <div className="text-sm truncate">{opp.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {opp.hand.length} {lang === 'en' ? 'cards in hand' : 'lá trên tay'}
                  </div>
                </div>
                {selectedPlayerId === opp.id && <span className={mode === 'TARGETED_ATTACK' ? 'text-orange-400 font-bold' : 'text-yellow-400 font-bold'}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Nếu là Combo 3 lá: Chọn tên lá bài muốn đòi */}
        {mode === 'COMBO_THREE' && (
          <div className="text-left space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? '2. Which card do you want to ask for?' : '2. Bạn muốn đòi lá bài nào?'}
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {availableDefs.map(def => (
                <button
                  key={def.id}
                  type="button"
                  onClick={() => setSelectedCardDefId(def.id)}
                  className={`p-2.5 rounded-xl border-2 text-left transition flex items-center gap-2 cursor-pointer ${
                    selectedCardDefId === def.id
                      ? 'bg-yellow-400/20 border-yellow-400 text-white font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xl">{def.icon}</span>
                  <div className="truncate text-xs">
                    <div className="truncate font-semibold">{lang === 'en' ? def.nameEn : def.nameVi}</div>
                    <div className="text-[9px] text-slate-400 truncate">({lang === 'en' ? def.nameVi : def.nameEn})</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition cursor-pointer"
            >
              {lang === 'en' ? 'Cancel' : 'Hủy'}
            </button>
          )}
          <button
            onClick={() => onConfirmTarget(selectedPlayerId, selectedCardDefId)}
            disabled={!selectedPlayerId}
            className={`flex-1 py-3.5 ${
              mode === 'TARGETED_ATTACK' 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-orange-500/30' 
                : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-yellow-400/30'
            } font-black text-base rounded-2xl shadow-lg transition transform active:scale-95 disabled:opacity-50 cursor-pointer`}
          >
            {mode === 'TARGETED_ATTACK' 
              ? (lang === 'en' ? 'Confirm Targeted Attack 🎯' : 'Xác Nhận Tấn Công 🎯') 
              : (lang === 'en' ? 'Confirm Target ➔' : 'Xác Nhận Thực Hiện ➔')}
          </button>
        </div>
      </div>
    </div>
  );
};


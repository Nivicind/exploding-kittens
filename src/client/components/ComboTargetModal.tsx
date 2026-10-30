import React, { useState } from 'react';
import { PlayerState, CardDefinition } from '../../engine/types';
import { CardRegistry } from '../../engine/CardRegistry';
import { CardView } from './CardView';

interface ComboTargetModalProps {
  mode: 'FAVOR_TARGET' | 'COMBO_TWO' | 'COMBO_THREE' | 'GIVE_FAVOR_CARD';
  opponents?: PlayerState[];
  myHand?: PlayerState['hand'];
  initiatorName?: string;
  onConfirmTarget: (targetPlayerId: string, targetCardDefId?: string) => void;
  onGiveCard?: (cardUid: string) => void;
  onCancel?: () => void;
}

export const ComboTargetModal: React.FC<ComboTargetModalProps> = ({
  mode,
  opponents = [],
  myHand = [],
  initiatorName = '',
  onConfirmTarget,
  onGiveCard,
  onCancel
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(opponents[0]?.id || '');
  const [selectedCardDefId, setSelectedCardDefId] = useState<string>('defuse');
  const [selectedMyCardUid, setSelectedMyCardUid] = useState<string>(myHand[0]?.uid || '');

  // Toàn bộ các định nghĩa bài có thể đòi (cho Combo 3)
  const availableDefs = CardRegistry.getAllCards(['base']);

  // Trường hợp nạn nhân phải chọn 1 lá bài trên tay để đưa (GIVE_FAVOR_CARD)
  if (mode === 'GIVE_FAVOR_CARD') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
        <div className="bg-slate-900 border-4 border-cyan-500 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-center space-y-5">
          <div>
            <div className="w-16 h-16 bg-cyan-500/20 border-2 border-cyan-500 rounded-full flex items-center justify-center mx-auto text-3xl mb-2">
              🤝
            </div>
            <h3 className="text-2xl font-black text-cyan-400 uppercase tracking-wide">
              Đưa Bài Cho {initiatorName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {initiatorName} vừa dùng lá <strong>Xin Xỏ (Favor)</strong> với bạn! Bạn phải tự chọn 1 lá bài từ tay của mình để cống nạp.
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
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => onGiveCard && onGiveCard(selectedMyCardUid)}
            disabled={!selectedMyCardUid}
            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base rounded-2xl shadow-lg shadow-cyan-500/30 transition transform active:scale-95 disabled:opacity-50"
          >
            Xác Nhận Đưa Lá Bài Này
          </button>
        </div>
      </div>
    );
  }

  // Tiêu đề tương ứng với mode
  const title = mode === 'FAVOR_TARGET' 
    ? 'Chọn Người Chơi Để Xin Bài (Favor)'
    : mode === 'COMBO_TWO' 
      ? 'Combo 2 Lá: Chọn Mục Tiêu Cướp Bài Ngẫu Nhiên'
      : 'Combo 3 Lá: Chọn Mục Tiêu & Gọi Tên Lá Bài';

  const subtitle = mode === 'COMBO_THREE'
    ? 'Nếu mục tiêu có lá bài bạn gọi tên, họ bắt buộc phải đưa cho bạn. Nếu không, bạn nhận số 0!'
    : 'Chọn 1 đối thủ còn sống để thực thi hành động.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center space-y-6">
        <div>
          <div className="w-16 h-16 bg-yellow-400/20 border-2 border-yellow-400 rounded-full flex items-center justify-center mx-auto text-3xl mb-2">
            🎯
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-yellow-400 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {subtitle}
          </p>
        </div>

        {/* 1. Chọn người chơi mục tiêu */}
        <div className="text-left space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Chọn đối thủ mục tiêu:
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {opponents.map(opp => (
              <button
                key={opp.id}
                type="button"
                onClick={() => setSelectedPlayerId(opp.id)}
                className={`p-3 rounded-xl border-2 text-left transition flex items-center justify-between ${
                  selectedPlayerId === opp.id
                    ? 'bg-yellow-400/20 border-yellow-400 text-white font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="truncate">
                  <div className="text-sm truncate">{opp.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {opp.hand.length} lá trên tay
                  </div>
                </div>
                {selectedPlayerId === opp.id && <span className="text-yellow-400 font-bold">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Nếu là Combo 3 lá: Chọn tên lá bài muốn đòi */}
        {mode === 'COMBO_THREE' && (
          <div className="text-left space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Bạn muốn đòi lá bài nào?
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {availableDefs.map(def => (
                <button
                  key={def.id}
                  type="button"
                  onClick={() => setSelectedCardDefId(def.id)}
                  className={`p-2.5 rounded-xl border-2 text-left transition flex items-center gap-2 ${
                    selectedCardDefId === def.id
                      ? 'bg-yellow-400/20 border-yellow-400 text-white font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xl">{def.icon}</span>
                  <div className="truncate text-xs">
                    <div className="truncate font-semibold">{def.nameVi}</div>
                    <div className="text-[9px] text-slate-400 truncate">({def.nameEn})</div>
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
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition"
            >
              Hủy
            </button>
          )}
          <button
            onClick={() => onConfirmTarget(selectedPlayerId, selectedCardDefId)}
            disabled={!selectedPlayerId}
            className="flex-1 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-base rounded-2xl shadow-lg shadow-yellow-400/30 transition transform active:scale-95 disabled:opacity-50"
          >
            Xác Nhận Thực Hiện
          </button>
        </div>
      </div>
    </div>
  );
};


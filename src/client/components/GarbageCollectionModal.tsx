import React, { useState } from 'react';
import { CardInstance } from '../../engine/types';
import { CardView } from './CardView';
import { Language } from '../i18n';

interface GarbageCollectionModalProps {
  isOpen: boolean;
  myHand: CardInstance[];
  hasSubmitted: boolean;
  totalEligible: number;
  submittedCount: number;
  onSubmit: (cardUid: string) => void;
  lang?: Language;
}

export const GarbageCollectionModal: React.FC<GarbageCollectionModalProps> = ({
  isOpen,
  myHand,
  hasSubmitted,
  totalEligible,
  submittedCount,
  onSubmit,
  lang = 'vi'
}) => {
  if (!isOpen) return null;

  const [selectedUid, setSelectedUid] = useState<string>(myHand[0]?.uid || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border-4 border-slate-600 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl text-center space-y-4">
        
        {/* Header */}
        <div className="space-y-1">
          <div className="w-16 h-16 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-1 shadow-inner">
            🚛
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-200 uppercase tracking-wide">
            {lang === 'en' ? 'Garbage Collection!' : 'Xe Thu Gom Rác!'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            {lang === 'en'
              ? 'Every player must choose 1 card from their hand to put into the Draw Pile.'
              : 'Tất cả người chơi còn sống phải chọn 1 lá bài trên tay để bỏ vào xấp bài rút.'}
          </p>
          <div className="inline-block px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[11px] font-black text-yellow-400">
            {lang === 'en' 
              ? `Submitted: ${submittedCount} / ${totalEligible} players`
              : `Tiến độ: ${submittedCount} / ${totalEligible} người đã nộp`}
          </div>
        </div>

        {hasSubmitted ? (
          <div className="py-6 space-y-3 bg-slate-950/80 rounded-2xl border border-slate-800 p-4">
            <div className="text-4xl animate-bounce">⏳</div>
            <p className="text-sm font-bold text-emerald-400">
              {lang === 'en' ? 'You have submitted your card!' : 'Bạn đã nộp bài thành công!'}
            </p>
            <p className="text-xs text-slate-400">
              {lang === 'en' 
                ? 'Waiting for the remaining players to submit before shuffling the Draw Pile...'
                : 'Đang chờ những người chơi còn lại nộp bài trước khi xào lại xấp bài rút...'}
            </p>
          </div>
        ) : (
          <>
            {/* Card selector */}
            <div className="flex flex-wrap justify-center gap-2 max-h-56 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
              {myHand.map(card => (
                <div key={card.uid} onClick={() => setSelectedUid(card.uid)} className="cursor-pointer">
                  <CardView
                    card={card}
                    isCompact={true}
                    isSelected={selectedUid === card.uid}
                    lang={lang}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                if (selectedUid) onSubmit(selectedUid);
              }}
              disabled={!selectedUid}
              className="w-full py-3 bg-slate-200 hover:bg-white text-slate-950 font-black text-sm uppercase rounded-2xl shadow-lg transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {lang === 'en' ? 'Surrender This Card ➔' : 'Nộp Lá Bài Này Vào Xe Rác ➔'}
            </button>
          </>
        )}

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { CardInstance } from '../../engine/types';
import { CardView } from './CardView';

interface DiscardPileModalProps {
  cards: CardInstance[];
  isComboFivePicker?: boolean;
  onPickCard?: (cardUid: string) => void;
  onClose: () => void;
}

export const DiscardPileModal: React.FC<DiscardPileModalProps> = ({
  cards,
  isComboFivePicker = false,
  onPickCard,
  onClose
}) => {
  const [selectedUid, setSelectedUid] = useState<string>(cards[cards.length - 1]?.uid || cards[0]?.uid || '');

  // Luôn đồng bộ selectedUid với danh sách xấp bài bỏ mới nhất (mặc định chọn lá mới nhất vừa bỏ)
  useEffect(() => {
    if (cards.length > 0 && (!selectedUid || !cards.some(c => c.uid === selectedUid))) {
      setSelectedUid(cards[cards.length - 1]?.uid || cards[0]?.uid || '');
    }
  }, [cards, selectedUid]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border-4 border-slate-700 w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>🗑️</span>
              {isComboFivePicker ? 'Combo 5 Lá: Chọn 1 Lá Từ Xấp Bài Bỏ' : `Xấp Bài Đã Bỏ (${cards.length} lá)`}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isComboFivePicker
                ? 'Chọn một lá bài bạn muốn hồi sinh từ xấp bài bỏ để đưa lại vào tay!'
                : 'Lịch sử tất cả các lá bài đã được đánh hoặc bỏ trong ván đấu.'}
            </p>
          </div>
          {/* Chỉ hiển thị nút X khi xem lịch sử bình thường, khi combo 5 lá thì bắt buộc phải chọn bài */}
          {!isComboFivePicker && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl font-bold px-2 py-1 cursor-pointer transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Danh sách lá bài trong xấp bỏ */}
        <div className="overflow-y-auto flex-1 my-4 pr-1">
          {cards.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">
              Chưa có lá bài nào trong xấp bài bỏ.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {cards.map(card => (
                <div
                  key={card.uid}
                  onClick={isComboFivePicker ? () => setSelectedUid(card.uid) : undefined}
                  className={isComboFivePicker ? 'cursor-pointer transform hover:scale-105 transition' : ''}
                >
                  <CardView
                    card={card}
                    isCompact={true}
                    isSelected={isComboFivePicker && selectedUid === card.uid}
                    onClick={isComboFivePicker ? () => setSelectedUid(card.uid) : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          {isComboFivePicker ? (
            <div className="text-xs text-yellow-300 font-bold">
              👉 Nhấp vào lá bài cần lấy rồi nhấn nút xác nhận bên phải
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              Tổng cộng {cards.length} lá đã bị loại/bỏ
            </div>
          )}

          <div className="flex gap-3">
            {/* Ẩn nút Đóng/Bỏ qua khi đang kích hoạt Combo 5 lá */}
            {!isComboFivePicker && (
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition cursor-pointer"
              >
                Đóng
              </button>
            )}

            {isComboFivePicker && (
              <button
                onClick={() => onPickCard && onPickCard(selectedUid)}
                disabled={!selectedUid}
                className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm shadow-lg shadow-yellow-400/30 transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Lấy Lá Bài Này Vào Tay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

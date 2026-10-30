import React, { useState } from 'react';
import { Language, CARD_I18N } from '../i18n';
import { CardRegistry } from '../../engine/CardRegistry';
import { CardView } from './CardView';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  lang = 'vi'
}) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'cards' | 'combos' | 'imploding' | 'streaking'>('basics');

  if (!isOpen) return null;

  const baseCards = CardRegistry.getAllCards(['base']);
  const implodingCards = CardRegistry.getAllCards(['imploding']);
  const streakingCards = CardRegistry.getAllCards(['streaking']);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 select-none animate-fade-in">
      <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl p-4 sm:p-6 my-4 max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">📖</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-yellow-400 uppercase tracking-wide">
                {lang === 'en' ? 'Game Rules & Guide' : 'Luật Chơi & Hướng Dẫn'}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                {lang === 'en' ? 'Exploding Kittens & Imploding Kittens' : 'Mèo Nổ & Mèo Tự Nổ Mở Rộng'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 my-3 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('basics')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition whitespace-nowrap cursor-pointer text-center ${
              activeTab === 'basics' ? 'bg-yellow-400 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'en' ? '1. How to Play' : '1. Luật Cơ Bản'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition whitespace-nowrap cursor-pointer text-center ${
              activeTab === 'cards' ? 'bg-yellow-400 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'en' ? '2. Base Cards' : '2. Các Lá Bài Gốc'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('combos')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition whitespace-nowrap cursor-pointer text-center ${
              activeTab === 'combos' ? 'bg-yellow-400 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'en' ? '3. Cat Combos' : '3. Combo Mèo'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('imploding')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition whitespace-nowrap cursor-pointer text-center ${
              activeTab === 'imploding' ? 'bg-purple-600 text-white font-black' : 'text-purple-400 hover:text-purple-300'
            }`}
          >
            {lang === 'en' ? '4. Imploding Exp.' : '4. Mèo Tự Nổ 🌀'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('streaking')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition whitespace-nowrap cursor-pointer text-center ${
              activeTab === 'streaking' ? 'bg-orange-600 text-white font-black' : 'text-orange-400 hover:text-orange-300'
            }`}
          >
            {lang === 'en' ? '5. Streaking Exp.' : '5. Mèo Khỏa Thân ⚡'}
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 text-xs text-slate-300 leading-relaxed">
          
          {/* TAB 1: LUẬT CƠ BẢN */}
          {activeTab === 'basics' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                <h4 className="font-black text-yellow-400 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>🎯</span> {lang === 'en' ? 'Goal of the Game' : 'Mục Tiêu Trò Chơi'}
                </h4>
                <p>
                  {lang === 'en'
                    ? 'Exploding Kittens is a Russian Roulette card game. Players draw cards until someone draws an Exploding Kitten. When that happens, they explode, die, and are out of the game — unless they have a Defuse card! The last player alive wins.'
                    : 'Mèo Nổ là trò chơi bài dạng Roulette may rủi đầy kịch tính. Người chơi lần lượt rút bài cho đến khi có người bốc phải Mèo Nổ. Khi đó, người đó nổ tung, chết và bị loại khỏi trận — trừ khi họ có lá Gỡ Bom (Defuse)! Người chơi duy nhất còn sống sót sẽ chiến thắng.'}
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                <h4 className="font-black text-emerald-400 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>🔄</span> {lang === 'en' ? 'Turn Structure' : 'Quy Trình Một Lượt Chơi'}
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] sm:text-xs">
                  <li>
                    <strong>{lang === 'en' ? 'Play cards (Optional):' : 'Đánh bài (Tùy chọn):'}</strong>{' '}
                    {lang === 'en' 
                      ? 'You can play as many cards from your hand as you like, or play nothing at all.' 
                      : 'Bạn có thể đánh bao nhiêu lá bài trên tay tùy thích, hoặc không đánh lá nào.'}
                  </li>
                  <li>
                    <strong>{lang === 'en' ? 'End your turn:' : 'Kết thúc lượt:'}</strong>{' '}
                    {lang === 'en'
                      ? 'You MUST draw 1 card from the top of the Draw Pile into your hand. If that card is safe, your turn ends and the next player goes.'
                      : 'Bạn BẮT BUỘC phải bấm rút 1 lá bài trên cùng từ xấp bài rút vào tay bạn. Nếu lá bài an toàn, lượt kết thúc và chuyển sang người kế tiếp.'}
                  </li>
                  <li>
                    <strong>{lang === 'en' ? 'If you draw an Exploding Kitten:' : 'Nếu rút trúng Mèo Nổ:'}</strong>{' '}
                    {lang === 'en'
                      ? 'If you have a Defuse card, it is used automatically to save you. You then secretly choose any spot in the Draw Pile to hide the bomb back. If you have no Defuse, you EXPLODE and lose!'
                      : 'Nếu có lá Defuse trên tay, bạn được cứu sống và bí mật chọn vị trí nhét lại Mèo Nổ vào xấp bài. Nếu không có Defuse, bạn NỔ TUNG và thua cuộc!'}
                  </li>
                </ol>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                <h4 className="font-black text-rose-400 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>🛑</span> {lang === 'en' ? 'The NOPE Card' : 'Lá Bài Chặn (NOPE)'}
                </h4>
                <p>
                  {lang === 'en'
                    ? 'A NOPE card can be played anytime during the 5-second reaction window to cancel any action card or combo (except Exploding Kittens and Defuse cards). A NOPE can also be played on another NOPE to un-cancel it (YUP)!'
                    : 'Lá bài NOPE có thể được đánh bất cứ lúc nào trong cửa sổ 5 giây để hủy bỏ ngay lập tức tác dụng của lá bài hoặc Combo vừa đánh ra (trừ lá Mèo Nổ và Defuse). Một lá NOPE cũng có thể chặn một lá NOPE khác (biến thành YUP)!'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CÁC LÁ BÀI GỐC */}
          {activeTab === 'cards' && (
            <div className="space-y-3 animate-fade-in">
              {baseCards.map(def => (
                <div key={def.id} className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-start gap-3">
                  <span className="text-2xl sm:text-3xl flex-shrink-0 p-1.5 bg-slate-900 rounded-xl border border-slate-800">
                    {def.icon}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-yellow-400 text-xs sm:text-sm">
                        {lang === 'en' ? def.nameEn : def.nameVi}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({lang === 'en' ? def.nameVi : def.nameEn})
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-300">
                      {CARD_I18N[def.id]?.[lang]?.description || def.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: COMBO MÈO VÔ TRI */}
          {activeTab === 'combos' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                <h4 className="font-black text-yellow-400 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>⚡</span> {lang === 'en' ? '2-Card Combo (Pair of Matching Cats)' : 'Combo 2 Lá Giống Nhau'}
                </h4>
                <p>
                  {lang === 'en'
                    ? 'Play 2 identical Cat cards (e.g. 2 Tacocats, or 1 Cat + 1 Feral Cat) to choose an opponent and steal 1 RANDOM card from their hand.'
                    : 'Đánh 2 lá Mèo cùng tên (ví dụ: 2 lá Mèo Taco, hoặc 1 lá Mèo + 1 Mèo Hoang Feral Cat) để chọn 1 đối thủ và cướp NGẪU NHIÊN 1 lá bài từ tay họ.'}
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                <h4 className="font-black text-amber-400 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>👑</span> {lang === 'en' ? '3-Card Combo (3 of a Kind)' : 'Combo 3 Lá Giống Nhau'}
                </h4>
                <p>
                  {lang === 'en'
                    ? 'Play 3 identical Cat cards to choose an opponent and NAME a specific card (e.g. Defuse). If they have that card, they MUST hand it over to you. If they don\'t, you get nothing!'
                    : 'Đánh 3 lá Mèo cùng tên để chọn 1 đối thủ và ĐÍCH DANH gọi tên lá bài muốn cướp (VD: Defuse). Nếu đối thủ có lá đó, họ BẮT BUỘC phải đưa cho bạn. Nếu không có, bạn không được gì!'}
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                <h4 className="font-black text-cyan-400 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>🌟</span> {lang === 'en' ? '5-Card Combo (5 Different Cards)' : 'Combo 5 Lá Bài Khác Nhau'}
                </h4>
                <p>
                  {lang === 'en'
                    ? 'Play 5 cards with different names/symbols (any 5 different cards) to open the Discard Pile and pick ANY 1 card of your choice back into your hand (e.g. revive a Defuse)!'
                    : 'Đánh 5 lá bài có biểu tượng/tên bài khác nhau để mở xấp bài bỏ và HỒI SINH bất kỳ 1 lá bài nào bạn thích vào tay (ví dụ: nhặt lại 1 lá Defuse đã dùng)!'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: BẢN MỞ RỘNG IMPLODING KITTENS */}
          {activeTab === 'imploding' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-purple-950/60 border border-purple-500/50 p-3.5 rounded-2xl space-y-2">
                <h4 className="font-black text-purple-300 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>🌀</span> {lang === 'en' ? 'The Imploding Kitten Rule' : 'Cơ Chế Mèo Tự Nổ (Imploding Kitten)'}
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-[11px] sm:text-xs">
                  <li>
                    <strong>{lang === 'en' ? '1st Draw (Face-Down):' : 'Rút lần 1 (Úp mặt):'}</strong>{' '}
                    {lang === 'en'
                      ? 'You DO NOT die! The card is flipped FACE-UP and you secretly choose where to reinsert it back into the Draw Pile.'
                      : 'Bạn KHÔNG BỊ NỔ! Lá bài được lật NGỬA MẶT và bạn bí mật chọn vị trí nhét lại vào xấp bài rút.'}
                  </li>
                  <li>
                    <strong>{lang === 'en' ? '2nd Draw (Face-Up):' : 'Rút lần 2 (Ngửa mặt):'}</strong>{' '}
                    {lang === 'en'
                      ? 'When it reaches the top of the deck, everyone sees it! If you draw it face-up, you IMPLODE AND DIE IMMEDIATELY! Defuse cards are completely USELESS against it!'
                      : 'Khi nó nổi lên đầu xấp bài, mọi người đều nhìn thấy nó! Bất kỳ ai rút phải lá ngửa mặt sẽ NỔ TUNG VÀ CHẾT NGAY LẬP TỨC! Lá Defuse hoàn toàn VÔ DỤNG không cứu được!'}
                  </li>
                </ul>
              </div>

              {implodingCards.map(def => (
                <div key={def.id} className="bg-slate-950/80 border border-purple-500/30 p-3 rounded-2xl flex items-start gap-3">
                  <span className="text-2xl sm:text-3xl flex-shrink-0 p-1.5 bg-slate-900 rounded-xl border border-slate-800">
                    {def.icon}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-purple-300 text-xs sm:text-sm">
                        {lang === 'en' ? def.nameEn : def.nameVi}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({lang === 'en' ? def.nameVi : def.nameEn})
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-300">
                      {CARD_I18N[def.id]?.[lang]?.description || def.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: MỞ RỘNG STREAKING KITTENS */}
          {activeTab === 'streaking' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-orange-950/40 border border-orange-500/40 p-3.5 rounded-2xl space-y-2">
                <h4 className="font-black text-orange-400 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>⚡</span> {lang === 'en' ? 'Streaking Kittens Expansion Rules' : 'Luật Chơi Mở Rộng: Streaking Kittens'}
                </h4>
                <p>
                  {lang === 'en'
                    ? 'Streaking Kittens adds 8 wild official cards and increases the lethal bomb count from (N-1) to (N). One player can now secretly hold 1 Exploding Kitten safely in their hand!'
                    : 'Streaking Kittens bổ sung 8 lá bài chính thức và nâng tổng số bom gây chết người từ (N - 1) lên đúng (N). Cho phép 1 người chơi bí mật ôm 1 quả bom Mèo Nổ an toàn trên tay!'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                  <li>
                    <strong>{lang === 'en' ? 'Holding the Bomb:' : 'Bí mật ôm bom:'}</strong>{' '}
                    {lang === 'en'
                      ? 'If you have Streaking Kitten in hand and draw an Exploding Kitten, you secretly keep it! You do not explode and don\'t need a Defuse.'
                      : 'Nếu bạn có lá Streaking Kitten trên tay và rút trúng Mèo Nổ, bạn bí mật giữ quả bom vào tay mình! Không bị nổ và không mất Defuse.'}
                  </li>
                  <li>
                    <strong>{lang === 'en' ? 'Bomb Stolen:' : 'Bom bị cướp:'}</strong>{' '}
                    {lang === 'en'
                      ? 'If someone steals your Exploding Kitten, they explode immediately unless they have their own Streaking Kitten or a Defuse!'
                      : 'Nếu có ai cướp phải Mèo Nổ trên tay bạn, kẻ cướp sẽ nổ ngay lập tức nếu không có lá Streaking Kitten hoặc Defuse!'}
                  </li>
                  <li>
                    <strong>{lang === 'en' ? 'Losing Streaking Kitten:' : 'Bị mất Streaking Kitten:'}</strong>{' '}
                    {lang === 'en'
                      ? 'If someone steals or discards your Streaking Kitten while you hold a bomb, you explode immediately unless you have a Defuse!'
                      : 'Nếu bạn bị cướp mất lá Streaking Kitten trong khi đang ôm Mèo Nổ, bạn nổ tung ngay lập tức trừ khi có Defuse!'}
                  </li>
                </ul>
              </div>

              {streakingCards.map(def => (
                <div key={def.id} className="bg-slate-950/80 border border-orange-500/30 p-3 rounded-2xl flex items-start gap-3">
                  <span className="text-2xl sm:text-3xl flex-shrink-0 p-1.5 bg-slate-900 rounded-xl border border-slate-800">
                    {def.icon}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-orange-300 text-xs sm:text-sm">
                        {lang === 'en' ? def.nameEn : def.nameVi}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({lang === 'en' ? def.nameVi : def.nameEn})
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-300">
                      {CARD_I18N[def.id]?.[lang]?.description || def.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs uppercase transition cursor-pointer shadow-md"
          >
            {lang === 'en' ? 'Got It! 👍' : 'Đã Hiểu! 👍'}
          </button>
        </div>

      </div>
    </div>
  );
};

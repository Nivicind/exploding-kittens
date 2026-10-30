import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardInstance } from '../../engine/types';
import { CardRegistry } from '../../engine/CardRegistry';
import { CardView } from './CardView';
import { Language, CARD_I18N } from '../i18n';

export interface SpotlightData {
  playerName: string;
  cards: CardInstance[];
  comboTitle?: string;
}

interface ActionSpotlightProps {
  data: SpotlightData | null;
  lang?: Language;
}

export const ActionSpotlight: React.FC<ActionSpotlightProps> = ({ data, lang = 'vi' }) => {
  const isExplosion = data?.cards[0]?.defId === 'exploding_kitten' || data?.comboTitle?.includes('NỔ');
  const cardDefId = data?.cards[0]?.defId;
  const cardI18n = cardDefId ? CARD_I18N[cardDefId]?.[lang] : null;
  const cardName = cardI18n?.name || (cardDefId ? (lang === 'en' ? CardRegistry.getCard(cardDefId)?.nameEn : CardRegistry.getCard(cardDefId)?.nameVi) : 'Lá bài');

  return (
    <AnimatePresence>
      {data && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 25 }}
            animate={{ scale: 1.1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="flex flex-col items-center justify-center p-4"
          >
            {/* Banner tên người chơi và hành động - Ngắn gọn, súc tích, không thừa chữ */}
            <motion.div
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`px-4 sm:px-6 py-2 rounded-2xl shadow-2xl text-center mb-3 backdrop-blur-md border-2 ${
                isExplosion
                  ? 'bg-rose-950/95 border-rose-500 shadow-rose-600/50 ring-4 ring-rose-500/30'
                  : 'bg-slate-900/95 border-yellow-400 shadow-yellow-500/30'
              }`}
            >
              <div className="text-sm sm:text-base font-black text-white flex items-center justify-center gap-1.5">
                {isExplosion ? (
                  <>
                    <span className="animate-bounce">💣</span>
                    <span className="text-yellow-300">{data.playerName}</span>
                    <span className="text-rose-400">{lang === 'en' ? 'drew an Exploding Kitten!' : 'rút phải Mèo Nổ!'}</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span className="text-yellow-300">{data.playerName}</span>
                    <span className="text-slate-300 font-semibold">{lang === 'en' ? 'played' : 'đánh'}</span>
                    <span className="text-rose-400 font-black">{data.comboTitle || cardName}!</span>
                  </>
                )}
              </div>
            </motion.div>

            {/* Thẻ bài được phóng to */}
            <motion.div
              animate={{ rotate: isExplosion ? [-3, 3, -3] : [-1.5, 1.5, 0] }}
              transition={{ repeat: Infinity, duration: isExplosion ? 0.6 : 1.5, ease: 'easeInOut' }}
              className={`relative filter ${
                isExplosion
                  ? 'drop-shadow-[0_0_40px_rgba(244,63,94,0.85)] scale-105'
                  : 'drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]'
              }`}
            >
              <div className="flex gap-2">
                {data.cards.map((card, idx) => (
                  <div key={card.uid || idx}>
                    <CardView card={card} isCompact={false} lang={lang} />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


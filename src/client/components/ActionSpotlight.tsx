import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardInstance } from '../../engine/types';
import { CardRegistry } from '../../engine/CardRegistry';
import { CardView } from './CardView';

export interface SpotlightData {
  playerName: string;
  cards: CardInstance[];
  comboTitle?: string;
}

interface ActionSpotlightProps {
  data: SpotlightData | null;
}

export const ActionSpotlight: React.FC<ActionSpotlightProps> = ({ data }) => {
  return (
    <AnimatePresence>
      {data && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 30 }}
            animate={{ scale: 1.15, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -40 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex flex-col items-center justify-center p-4"
          >
            {/* Banner tên người chơi và hành động */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-slate-900/95 border-2 border-yellow-400 px-5 py-2 rounded-2xl shadow-2xl shadow-yellow-500/30 text-center mb-3 backdrop-blur-md"
            >
              <div className="text-[11px] font-bold text-yellow-400 uppercase tracking-widest">
                ⚡ HÀNH ĐỘNG VỪA KÍCH HOẠT
              </div>
              <div className="text-base sm:text-lg font-black text-white mt-0.5">
                <span className="text-yellow-300">{data.playerName}</span> vừa đánh{' '}
                <span className="text-rose-400">{data.comboTitle || CardRegistry.getCard(data.cards[0]?.defId)?.nameVi}!</span>
              </div>
            </motion.div>

            {/* Thẻ bài được phóng to với vầng hào quang rực rỡ */}
            <motion.div
              animate={{ rotate: [-2, 2, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="relative filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
            >
              <div className="flex gap-2">
                {data.cards.map((card, idx) => (
                  <div key={card.uid || idx} className="transform hover:scale-105">
                    <CardView card={card} isCompact={false} />
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


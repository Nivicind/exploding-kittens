import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardInstance } from '../../engine/types';
import { CardView } from './CardView';

export interface FlyingCardTask {
  id: string;
  card?: CardInstance;
  from: { x: number; y: number };
  to: { x: number; y: number };
  isFaceDown?: boolean;
}

interface FlyingCardOverlayProps {
  tasks: FlyingCardTask[];
  onCompleteTask: (id: string) => void;
}

export const FlyingCardOverlay: React.FC<FlyingCardOverlayProps> = ({
  tasks,
  onCompleteTask
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {tasks.map(task => (
          <motion.div
            key={task.id}
            initial={{
              x: task.from.x,
              y: task.from.y,
              scale: 0.7,
              opacity: 0.9,
              rotate: -10
            }}
            animate={{
              x: task.to.x,
              y: task.to.y,
              scale: 1,
              opacity: 1,
              rotate: [0, 8, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1]
            }}
            onAnimationComplete={() => onCompleteTask(task.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            {task.isFaceDown || !task.card ? (
              // Mặt sau của thẻ bài bốc (Mèo Nổ 💣)
              <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-2xl bg-gradient-to-b from-rose-900 to-slate-950 border-3 border-rose-500 shadow-2xl flex flex-col items-center justify-center p-2 text-center">
                <span className="text-3xl mb-1 drop-shadow-md">💣</span>
                <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest">
                  EXPLODING
                </span>
              </div>
            ) : (
              // Mặt trước thẻ bài ngửa
              <CardView card={task.card} isCompact={true} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};


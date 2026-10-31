import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardInstance } from '../../engine/types';
import { CardView } from './CardView';
import { CardBack } from './CardBack';

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
              // Mặt sau thống nhất (Mèo Nổ - không icon bom)
              <CardBack isCompact={true} />
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


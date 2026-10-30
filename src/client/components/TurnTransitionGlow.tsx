import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TurnTransitionGlowProps {
  fromPos: { x: number; y: number } | null;
  toPos: { x: number; y: number } | null;
  triggerKey: string | number;
}

export const TurnTransitionGlow: React.FC<TurnTransitionGlowProps> = ({
  fromPos,
  toPos,
  triggerKey
}) => {
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    if (fromPos && toPos && (fromPos.x !== toPos.x || fromPos.y !== toPos.y)) {
      setActive(true);
      const timer = setTimeout(() => setActive(false), 600);
      return () => clearTimeout(timer);
    }
  }, [triggerKey, fromPos, toPos]);

  if (!active || !fromPos || !toPos) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={`turn_trail_${triggerKey}`}
          initial={{
            x: fromPos.x,
            y: fromPos.y,
            scale: 0.8,
            opacity: 1
          }}
          animate={{
            x: toPos.x,
            y: toPos.y,
            scale: [0.8, 1.4, 1],
            opacity: [1, 0.9, 0]
          }}
          transition={{
            duration: 0.55,
            ease: [0.25, 1, 0.5, 1]
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          {/* Đầu hạt sáng sao vàng */}
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-yellow-300 blur-[2px] shadow-[0_0_25px_#facc15] animate-pulse" />
            <div className="absolute w-4 h-4 rounded-full bg-white shadow-lg" />
            <span className="absolute text-xl animate-spin">✨</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};


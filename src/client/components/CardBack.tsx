import React from 'react';
import { Language } from '../i18n';

interface CardBackProps {
  className?: string;
  style?: React.CSSProperties;
  isCompact?: boolean;
  lang?: Language;
}

export const CardBack: React.FC<CardBackProps> = ({
  className = '',
  style = {},
  isCompact = false,
  lang = 'vi'
}) => {
  if (isCompact) {
    return (
      <div
        style={style}
        className={`relative w-22 h-34 sm:w-24 sm:h-38 rounded-2xl border-2 border-rose-600/80 bg-gradient-to-br from-rose-950 via-red-950 to-slate-950 p-2 flex flex-col justify-between items-center text-center select-none shadow-xl overflow-hidden ${className}`}
      >
        <div className="w-full flex justify-between text-[7px] font-black text-rose-400/70 font-mono">
          <span>EK</span>
          <span>EK</span>
        </div>
        <div className="my-auto">
          <div className="text-sm font-black text-yellow-400 tracking-wider drop-shadow-[0_2px_8px_rgba(234,179,8,0.6)]">
            MÈO NỔ
          </div>
          <div className="text-[6.5px] font-bold text-rose-300/80 tracking-widest uppercase mt-0.5">
            EXPLODING
          </div>
        </div>
        <div className="w-full flex justify-between text-[7px] font-black text-rose-400/70 font-mono">
          <span>EK</span>
          <span>EK</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={style}
      className={`relative w-[116px] h-[180px] sm:w-[136px] sm:h-[212px] md:w-[148px] md:h-[228px] rounded-2xl border-2 sm:border-3 border-rose-600/80 bg-gradient-to-br from-rose-950 via-red-950 to-slate-950 p-2.5 sm:p-3 flex flex-col justify-between items-center text-center select-none shadow-2xl overflow-hidden ${className}`}
    >
      {/* 4 góc trang trí đối xứng */}
      <div className="w-full flex justify-between text-[8px] sm:text-[9px] font-black text-rose-400/80 font-mono">
        <span>EK</span>
        <span>EK</span>
      </div>

      {/* Trung tâm: Dòng chữ MÈO NỔ vàng rực nổi bật trên nền đỏ đen, không có icon bom */}
      <div className="my-auto flex flex-col items-center justify-center">
        <div className="text-xl sm:text-2xl md:text-3xl font-black text-yellow-400 tracking-wider drop-shadow-[0_2px_12px_rgba(234,179,8,0.7)] uppercase">
          MÈO NỔ
        </div>
        <div className="text-[8px] sm:text-[9.5px] font-bold text-rose-300/90 tracking-widest uppercase mt-1">
          EXPLODING KITTENS
        </div>
        <div className="mt-2 w-12 h-0.5 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
      </div>

      <div className="w-full flex justify-between text-[8px] sm:text-[9px] font-black text-rose-400/80 font-mono">
        <span>EK</span>
        <span>EK</span>
      </div>
    </div>
  );
};

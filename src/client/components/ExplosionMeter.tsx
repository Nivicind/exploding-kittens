import React from 'react';

interface ExplosionMeterProps {
  probability: number;      // 0 - 100
  kittenCount: number;      // Số mèo nổ còn lại
  totalCards: number;       // Tổng số bài trong xấp rút
}

export const ExplosionMeter: React.FC<ExplosionMeterProps> = ({
  probability,
  kittenCount,
  totalCards
}) => {
  // Góc quay của kim: từ -90 độ (0%) đến +90 độ (100%)
  const clampedProb = Math.max(0, Math.min(100, probability));
  const needleAngle = -90 + (clampedProb / 100) * 180;

  // Xác định màu sắc theo mức độ nguy hiểm
  const isHighDanger = clampedProb >= 35;
  const isMediumDanger = clampedProb >= 15 && clampedProb < 35;

  const statusColor = isHighDanger 
    ? 'text-rose-500' 
    : isMediumDanger 
      ? 'text-amber-400' 
      : 'text-emerald-400';

  const glowColor = isHighDanger
    ? 'shadow-rose-600/30 border-rose-500/40'
    : isMediumDanger
      ? 'shadow-amber-500/20 border-amber-500/40'
      : 'shadow-emerald-500/20 border-emerald-500/40';

  return (
    <div className={`relative w-40 sm:w-48 bg-slate-900/90 border-2 rounded-3xl p-3 sm:p-4 flex flex-col items-center shadow-xl backdrop-blur-md transition-all duration-300 ${glowColor} ${isHighDanger ? 'animate-pulse' : ''}`}>
      {/* Tiêu đề công tơ mét */}
      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
        <span>🧭</span>
        <span>XÁC SUẤT NỔ</span>
      </div>

      {/* SVG Đồng hồ bán nguyệt */}
      <div className="relative w-36 h-20 sm:w-40 sm:h-24 flex items-end justify-center overflow-hidden">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          {/* Định nghĩa Gradient cho dải đo */}
          <defs>
            <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />   {/* Emerald - An toàn */}
              <stop offset="35%" stopColor="#eab308" />  {/* Yellow - Chú ý */}
              <stop offset="70%" stopColor="#f97316" />  {/* Orange - Nguy hiểm */}
              <stop offset="100%" stopColor="#ef4444" /> {/* Red - Cực kỳ nguy hiểm */}
            </linearGradient>
          </defs>

          {/* Vòng cung nền xám */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Vòng cung dải màu công tơ mét */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#meterGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset="0"
          />

          {/* Các vạch chia độ */}
          <line x1="20" y1="100" x2="28" y2="100" stroke="#94a3b8" strokeWidth="2" />
          <line x1="100" y1="20" x2="100" y2="28" stroke="#94a3b8" strokeWidth="2" />
          <line x1="180" y1="100" x2="172" y2="100" stroke="#94a3b8" strokeWidth="2" />

          {/* Kim đồng hồ (Needle) */}
          <g
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: '100px 100px',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Thân kim */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="28"
              stroke="#f8fafc"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Đỉnh kim đỏ */}
            <polygon points="97,32 103,32 100,22" fill="#ef4444" />
          </g>

          {/* Tâm trục kim */}
          <circle cx="100" cy="100" r="9" fill="#f8fafc" />
          <circle cx="100" cy="100" r="4" fill="#0f172a" />
        </svg>
      </div>

      {/* Số phần trăm hiển thị số lớn */}
      <div className="text-center -mt-2">
        <div className={`text-xl sm:text-2xl font-black tracking-tight ${statusColor}`}>
          {clampedProb.toFixed(1)}%
        </div>
        <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
          <span>💣 {kittenCount} Mèo Nổ</span>
          <span>/</span>
          <span>{totalCards} lá</span>
        </div>
      </div>

      {/* Nhãn trạng thái */}
      <div className="mt-1">
        <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
          isHighDanger 
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
            : isMediumDanger 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
        }`}>
          {isHighDanger ? 'Báo động đỏ!' : isMediumDanger ? 'Cẩn thận' : 'An toàn'}
        </span>
      </div>
    </div>
  );
};


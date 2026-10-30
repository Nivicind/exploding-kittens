import React from 'react';

interface TurnDirectionOrbitProps {
  direction: 1 | -1; // 1: clockwise (thuận chiều), -1: counter-clockwise (ngược chiều)
}

export const TurnDirectionOrbit: React.FC<TurnDirectionOrbitProps> = ({ direction }) => {
  const isClockwise = direction === 1;

  // Màu sắc chủ đạo: Vàng/Cyan khi thuận chiều, Cam/Đỏ hồng khi ngược chiều
  const primaryColor = isClockwise ? '#facc15' : '#f43f5e';
  const secondaryColor = isClockwise ? '#06b6d4' : '#fb923c';
  const glowShadow = isClockwise 
    ? 'drop-shadow(0 0 14px rgba(250,204,21,0.5))' 
    : 'drop-shadow(0 0 14px rgba(244,63,94,0.5))';

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-0">
      {/* Vòng hào quang mờ trung tâm */}
      <div 
        className="absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full blur-3xl opacity-15"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`
        }}
      />

      {/* Vòng xoay chuyển động chính */}
      <div
        style={{ filter: glowShadow }}
        className={`w-[340px] h-[340px] sm:w-[450px] sm:h-[450px] md:w-[480px] md:h-[480px] transition-transform ${
          isClockwise ? 'animate-orbit' : 'animate-orbit-reverse'
        }`}
      >
        <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
          <defs>
            {/* Gradient dải sáng uốn lượn */}
            <linearGradient id="orbitGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.1" />
              <stop offset="60%" stopColor={primaryColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="orbitGradient2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.1" />
              <stop offset="60%" stopColor={primaryColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Vòng tròn nét đứt viền ngoài */}
          <circle
            cx="150"
            cy="150"
            r="135"
            fill="none"
            stroke={primaryColor}
            strokeWidth="1.5"
            strokeDasharray="4 8"
            opacity="0.25"
          />

          {/* Vòng tròn nét mảnh viền trong */}
          <circle
            cx="150"
            cy="150"
            r="115"
            fill="none"
            stroke={secondaryColor}
            strokeWidth="1"
            strokeDasharray="2 6"
            opacity="0.2"
          />

          {/* MŨI TÊN CONG 1 (NỬA TRÊN ĐỈNH CUNG) */}
          <path
            d="M 45 150 A 105 105 0 0 1 255 150"
            fill="none"
            stroke="url(#orbitGradient1)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Đầu mũi tên 1 kiểu Uno khí động học */}
          {isClockwise ? (
            <polygon
              points="255,150 242,138 248,155 240,162"
              fill={primaryColor}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ) : (
            <polygon
              points="45,150 58,138 52,155 60,162"
              fill={primaryColor}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          )}

          {/* MŨI TÊN CONG 2 (NỬA DƯỚI ĐỐI XỨNG) */}
          <path
            d="M 255 150 A 105 105 0 0 1 45 150"
            fill="none"
            stroke="url(#orbitGradient2)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Đầu mũi tên 2 kiểu Uno khí động học */}
          {isClockwise ? (
            <polygon
              points="45,150 58,162 52,145 60,138"
              fill={primaryColor}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ) : (
            <polygon
              points="255,150 242,162 248,145 240,138"
              fill={primaryColor}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          )}

          {/* Các hạt năng lượng lấp lánh trên quỹ đạo */}
          <circle cx="150" cy="45" r="3" fill="#ffffff" opacity="0.9" />
          <circle cx="150" cy="255" r="3" fill="#ffffff" opacity="0.9" />
        </svg>
      </div>

      {/* Nhãn chiều quay tinh tế ở giữa nền */}
      <div className="absolute flex flex-col items-center justify-center opacity-30 select-none pointer-events-none">
        <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">
          {isClockwise ? 'Chiều thuận ↻' : 'Chiều ngược ↺'}
        </span>
      </div>
    </div>
  );
};

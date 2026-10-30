import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameLogEntry } from '../../engine/types';

interface GameLogProps {
  logs: GameLogEntry[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Trên mobile mặc định thu gọn thành bong bóng chat tròn (kiểu Messenger)
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState<boolean>(false);
  
  // Kích thước có thể kéo dài to/nhỏ linh hoạt trên Desktop
  const [desktopWidth, setDesktopWidth] = useState<number>(290);
  const [desktopHeight, setDesktopHeight] = useState<number>(180);
  const isResizingRef = useRef<boolean>(false);

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpenMobile, isCollapsedDesktop, desktopHeight]);

  // Xử lý kéo thay đổi kích thước cửa sổ trên Desktop
  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = desktopWidth;
    const startH = desktopHeight;

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newW = Math.max(220, Math.min(600, startW + (ev.clientX - startX)));
      const newH = Math.max(120, Math.min(480, startH - (ev.clientY - startY)));
      setDesktopWidth(newW);
      setDesktopHeight(newH);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const getBadge = (type: GameLogEntry['type']) => {
    switch (type) {
      case 'explode':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[8px] px-1 py-0.2 rounded uppercase font-black">BÙM</span>;
      case 'defuse':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[8px] px-1 py-0.2 rounded uppercase font-black">GỠ BOM</span>;
      case 'nope':
        return <span className="bg-red-600/20 text-red-400 border border-red-500/40 text-[8px] px-1 py-0.2 rounded uppercase font-black">NOPE</span>;
      case 'combo':
        return <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[8px] px-1 py-0.2 rounded uppercase font-black">COMBO</span>;
      case 'play':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[8px] px-1 py-0.2 rounded uppercase font-black">ĐÁNH</span>;
      case 'win':
        return <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[8px] px-1 py-0.2 rounded uppercase font-black">THẮNG</span>;
      default:
        return <span className="bg-slate-700/50 text-slate-400 text-[8px] px-1 py-0.2 rounded uppercase font-bold">INFO</span>;
    }
  };

  // 1. GIAO DIỆN TRÊN MOBILE: BONG BÓNG CHAT KIỂU MESSENGER CÓ THỂ KÉO THẢ TỰ DO & BẤM RA NGOÀI ĐỂ ĐÓNG
  if (isMobile) {
    const winW = typeof window !== 'undefined' ? window.innerWidth : 360;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 640;

    return (
      <>
        {/* Bong bóng tròn nổi có thể kéo thả bất kỳ đâu trên màn hình (Messenger Chat Head) */}
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.1}
          dragConstraints={{
            left: 8,
            right: winW - 58,
            top: 52,
            bottom: winH - 240
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          style={{ position: 'fixed', top: 56, left: 12, zIndex: 50 }}
          className="cursor-grab active:cursor-grabbing select-none touch-none"
        >
          <div
            onClick={() => setIsOpenMobile(true)}
            className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-400 text-slate-950 shadow-2xl flex items-center justify-center border-2 border-white/90 filter drop-shadow-xl"
          >
            <span className="text-xl">💬</span>
            {logs.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow">
                {logs.length > 99 ? '99+' : logs.length}
              </span>
            )}
          </div>
        </motion.div>

        {/* Cửa sổ xem chi tiết lịch sử: BẤM RA NGOÀI (BACKDROP CLICK) TỰ ĐỘNG THOÁT */}
        <AnimatePresence>
          {isOpenMobile && (
            <div 
              onClick={() => setIsOpenMobile(false)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="bg-slate-900 border-2 border-slate-700 w-full max-w-sm rounded-3xl p-4 shadow-2xl flex flex-col max-h-[75vh]"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💬</span>
                    <span className="text-sm font-black text-white">Nhật Ký Trận Đấu</span>
                    <span className="text-xs text-slate-400">({logs.length})</span>
                  </div>
                  <button
                    onClick={() => setIsOpenMobile(false)}
                    className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto py-2.5 space-y-1.5 pr-1">
                  {logs.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs py-8">Chưa có hành động nào...</div>
                  ) : (
                    logs.map(log => (
                      <div
                        key={log.id}
                        className={`flex items-start gap-1.5 p-1.5 rounded-xl border text-[11px] leading-tight ${
                          log.type === 'explode'
                            ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                            : log.type === 'defuse'
                            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                            : log.type === 'win'
                            ? 'bg-amber-950/40 border-amber-800/60 text-amber-200 font-bold'
                            : log.type === 'nope'
                            ? 'bg-red-950/30 border-red-800/50 text-red-200'
                            : 'bg-slate-850 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex-shrink-0 pt-0.5">{getBadge(log.type)}</div>
                        <div className="flex-1">{log.message}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Chạm ra ngoài để đóng</span>
                  <button
                    onClick={() => setIsOpenMobile(false)}
                    className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition"
                  >
                    Đóng
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // 2. GIAO DIỆN TRÊN DESKTOP: NẰM CAO HẲN TRÊN BÀN TAY, HỖ TRỢ KÉO DÃN TO NHỎ LINH HOẠT
  return (
    <div 
      style={{ width: isCollapsedDesktop ? 180 : desktopWidth }}
      className="fixed bottom-[275px] md:bottom-[285px] left-3 sm:left-5 z-30 transition-[width] duration-150"
    >
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col relative group">
        {/* Header khung chat / lịch sử */}
        <div 
          className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-300 select-none"
        >
          <div 
            onClick={() => setIsCollapsedDesktop(!isCollapsedDesktop)}
            className="flex items-center gap-1.5 cursor-pointer hover:text-white transition"
          >
            <span>💬</span>
            <span>Nhật Ký</span>
            <span className="text-[9px] text-slate-500 font-normal">({logs.length})</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCollapsedDesktop(!isCollapsedDesktop)}
              className="text-slate-400 hover:text-white text-[10px] px-1 rounded transition"
            >
              {isCollapsedDesktop ? '▲ Mở' : '▼ Thu'}
            </button>

            {/* Nút cầm nắm kéo thay đổi kích cỡ (Resize Handle góc trên phải) */}
            {!isCollapsedDesktop && (
              <div
                onMouseDown={handleStartResize}
                className="cursor-ne-resize p-0.5 text-slate-400 hover:text-yellow-400 transition select-none flex items-center justify-center text-xs ml-1"
                title="Giữ chuột và kéo để thay đổi kích thước ngang/dọc"
              >
                ⤢
              </div>
            )}
          </div>
        </div>

        {/* Nội dung danh sách log */}
        {!isCollapsedDesktop && (
          <div 
            ref={scrollRef} 
            style={{ height: desktopHeight }}
            className="overflow-y-auto p-2 space-y-1 text-xs transition-[height]"
          >
            {logs.length === 0 ? (
              <div className="text-center text-slate-500 text-[10px] py-4">
                Chưa có hành động nào...
              </div>
            ) : (
              logs.map(log => (
                <div
                  key={log.id}
                  className={`flex items-start gap-1 p-1 rounded-lg border text-[10px] leading-tight transition ${
                    log.type === 'explode'
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                      : log.type === 'defuse'
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                      : log.type === 'win'
                      ? 'bg-amber-950/40 border-amber-800/60 text-amber-200 font-bold'
                      : log.type === 'nope'
                      ? 'bg-red-950/30 border-red-800/50 text-red-200'
                      : 'bg-slate-900/60 border-slate-800/70 text-slate-300'
                  }`}
                >
                  <div className="flex-shrink-0 pt-0.5">{getBadge(log.type)}</div>
                  <div className="flex-1">{log.message}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

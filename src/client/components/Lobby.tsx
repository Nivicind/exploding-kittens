import React, { useState, useEffect } from 'react';
import { CustomDeckConfig, GameSettings } from '../../engine/types';
import { CustomDeckModal } from './CustomDeckModal';

interface RoomData {
  id: string;
  hostId: string;
  players: { id: string; name: string; isBot: boolean }[];
  deckConfig?: CustomDeckConfig;
  settings?: GameSettings;
}

interface LobbyProps {
  myPlayerId: string | null;
  room: RoomData | null;
  lanIp: string;
  onCreateSinglePlayer: (name: string, playerCount: number, deckConfig?: CustomDeckConfig, settings?: GameSettings) => void;
  onCreateMultiplayer: (hostName: string, deckConfig?: CustomDeckConfig, settings?: GameSettings) => void;
  onJoinMultiplayer: (roomId: string, playerName: string) => void;
  onAddBot: () => void;
  onStartGame: () => void;
  onUpdateDeckConfig: (config: CustomDeckConfig) => void;
  onUpdateSettings?: (settings: GameSettings) => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  myPlayerId,
  room,
  lanIp,
  onCreateSinglePlayer,
  onCreateMultiplayer,
  onJoinMultiplayer,
  onAddBot,
  onStartGame,
  onUpdateDeckConfig,
  onUpdateSettings
}) => {
  const [tab, setTab] = useState<'single' | 'multi'>('single');
  const [playerName, setPlayerName] = useState<string>('Tôi');
  const [singlePlayerCount, setSinglePlayerCount] = useState<number>(4);
  const [joinRoomCode, setJoinRoomCode] = useState<string>('');
  const [showDeckModal, setShowDeckModal] = useState<boolean>(false);
  const [deckConfig, setDeckConfig] = useState<CustomDeckConfig | undefined>(undefined);
  const [nopeTimeoutSec, setNopeTimeoutSec] = useState<number>(room?.settings?.nopeTimeoutSec ?? 5);
  const [botDelaySec, setBotDelaySec] = useState<number>(room?.settings?.botDelaySec ?? 2);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Tự động nhận diện mã phòng từ link mời (?room=XXXX)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setJoinRoomCode(roomParam.toUpperCase());
      setTab('multi');
    }
  }, []);

  // Hàm tạo link mời phòng chơi
  const getInviteLink = () => {
    if (!room) return '';
    const origin = window.location.origin;
    // Nếu host đang mở localhost, thay thế bằng IP LAN hoặc Radmin để gửi cho bạn bè
    const baseUrl = origin.includes('localhost') || origin.includes('127.0.0.1')
      ? `http://${lanIp}:3000`
      : origin;
    return `${baseUrl}/?room=${room.id}`;
  };

  const handleCopyInviteLink = () => {
    const link = getInviteLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const isHost = room && myPlayerId && room.hostId === myPlayerId;

  // Nếu đang ở trong phòng chờ (Room Lobby)
  if (room) {
    return (
      <div className="min-h-[100dvh] w-full bg-slate-950 flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 py-6 sm:py-10 pb-16 sm:pb-10 overflow-y-auto">
        <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 my-auto">
          {/* Header Phòng */}
          <div className="text-center space-y-2">
            <span className="text-4xl">💣</span>
            <h2 className="text-2xl sm:text-3xl font-black text-yellow-400">
              Phòng Chờ: <span className="tracking-widest uppercase text-white bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">{room.id}</span>
            </h2>

            {/* Nút sao chép link mời tiện lợi */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <div className="bg-slate-950/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-400 truncate max-w-xs">
                {getInviteLink()}
              </div>
              <button
                type="button"
                onClick={handleCopyInviteLink}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                  copiedLink
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950'
                }`}
              >
                <span>{copiedLink ? '✓' : '📋'}</span>
                <span>{copiedLink ? 'Đã sao chép link!' : 'Sao chép link mời'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Gửi link này cho bạn bè để họ vào thẳng phòng mà không cần gõ mã phòng!
            </p>
          </div>

          {/* Danh sách người chơi trong phòng */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Người chơi đã sẵn sàng ({room.players.length}/10):</span>
              {isHost && room.players.length < 10 && (
                <button
                  onClick={onAddBot}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-yellow-300 rounded-lg border border-slate-700 transition"
                >
                  + Thêm Bot AI
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {room.players.map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                    p.id === myPlayerId
                      ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-200'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <span className="text-2xl">{p.isBot ? '🐱' : '👤'}</span>
                  <div className="truncate text-xs">
                    <div className="font-bold truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {p.id === room.hostId ? 'Chủ phòng (Host)' : p.isBot ? 'AI Bot' : 'Người chơi'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nút tùy chỉnh bộ bài & Cài đặt nhịp độ */}
          {isHost && (
            <div className="space-y-3">
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-black text-slate-300">
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <span>⏱️</span> Cài đặt nhịp độ ván đấu
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Dễ theo dõi, không bị quá nhanh</span>
                </div>

                {/* 1. Thời gian chờ Nope */}
                <div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 mb-1">
                    <span>Thời gian chờ phản ứng NOPE:</span>
                    <span className="text-rose-400 font-mono font-black">{nopeTimeoutSec}s</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    step="1"
                    value={nopeTimeoutSec}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      setNopeTimeoutSec(val);
                      if (onUpdateSettings) onUpdateSettings({ nopeTimeoutSec: val, botDelaySec });
                    }}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>3s (Nhanh)</span>
                    <span className="text-rose-300/80 font-bold">5s (Khuyên dùng)</span>
                    <span>10s (Thong thả)</span>
                  </div>
                </div>

                {/* 2. Tốc độ Bot suy nghĩ */}
                <div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 mb-1">
                    <span>Thời gian AI Bot suy nghĩ:</span>
                    <span className="text-emerald-400 font-mono font-black">{botDelaySec}s / lượt</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.5"
                    value={botDelaySec}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      setBotDelaySec(val);
                      if (onUpdateSettings) onUpdateSettings({ nopeTimeoutSec, botDelaySec: val });
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>1s (Chớp nhoáng)</span>
                    <span className="text-emerald-300/80 font-bold">2s (Dễ nhìn)</span>
                    <span>4s (Rất chậm)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowDeckModal(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2"
                >
                  <span>🛠️</span> Tùy Chỉnh Số Lượng Thẻ Bài & Luật Chia
                </button>
              </div>
            </div>
          )}

          {/* Nút bắt đầu */}
          <div className="pt-2">
            {isHost ? (
              <button
                onClick={onStartGame}
                disabled={room.players.length < 2}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-yellow-400/20 transition transform active:scale-95 disabled:opacity-50"
              >
                Bắt Đầu Trận Đấu Ngay 🚀
              </button>
            ) : (
              <div className="text-center text-sm font-semibold text-slate-400 py-3 bg-slate-800/40 rounded-xl border border-slate-700/40 animate-pulse">
                Đang chờ Chủ phòng bắt đầu ván đấu...
              </div>
            )}
          </div>
        </div>

        {/* Modal tùy chỉnh bộ bài */}
        <CustomDeckModal
          isOpen={showDeckModal}
          onClose={() => setShowDeckModal(false)}
          config={room.deckConfig}
          onSave={onUpdateDeckConfig}
          playerCount={room.players.length}
        />
      </div>
    );
  }

  // Màn hình chính ngoài sảnh
  return (
    <div className="min-h-[100dvh] w-full bg-slate-950 flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 py-6 sm:py-10 pb-16 sm:pb-10 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-800 w-full max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 my-auto">
        {/* Logo và tiêu đề */}
        <div className="text-center">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-rose-500/20 border-2 border-rose-500 rounded-full flex items-center justify-center mx-auto text-3xl sm:text-4xl mb-2 sm:mb-3 animate-bounce-short">
            💣
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-yellow-400 uppercase tracking-wider">
            MÈO NỔ
          </h1>
          <p className="text-[11px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Exploding Kittens Online
          </p>
        </div>

        {/* Tab chọn chế độ */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setTab('single')}
            className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition ${
              tab === 'single'
                ? 'bg-yellow-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Chơi Đơn vs AI
          </button>
          <button
            onClick={() => setTab('multi')}
            className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition ${
              tab === 'multi'
                ? 'bg-yellow-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Nhiều Người (Online / LAN)
          </button>
        </div>

        {/* Tên người chơi */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            Tên của bạn:
          </label>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            maxLength={18}
            className="w-full bg-slate-950 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-yellow-400 transition"
            placeholder="Nhập tên người chơi..."
          />
        </div>

        {/* Nội dung Tab Chơi Đơn vs AI */}
        {tab === 'single' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
                <span>Tổng số người chơi trên bàn:</span>
                <span className="text-yellow-400 text-sm">{singlePlayerCount} người (Bạn + {singlePlayerCount - 1} Bot)</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={singlePlayerCount}
                onChange={e => setSinglePlayerCount(parseInt(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>2 người</span>
                <span>Tối đa 10 người</span>
              </div>
            </div>

            {/* TÙY CHỈNH THỜI GIAN CHỜ NOPE & TỐC ĐỘ BOT */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-slate-300">
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <span>⏱️</span> Cài đặt nhịp độ ván đấu
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Dễ theo dõi, không bị quá nhanh</span>
              </div>

              {/* 1. Thời gian chờ Nope */}
              <div>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 mb-1">
                  <span>Thời gian chờ phản ứng NOPE:</span>
                  <span className="text-rose-400 font-mono font-black">{nopeTimeoutSec}s</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="1"
                  value={nopeTimeoutSec}
                  onChange={e => setNopeTimeoutSec(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>3s (Nhanh)</span>
                  <span className="text-rose-300/80 font-bold">5s (Khuyên dùng)</span>
                  <span>10s (Thong thả)</span>
                </div>
              </div>

              {/* 2. Tốc độ Bot suy nghĩ */}
              <div>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 mb-1">
                  <span>Thời gian AI Bot suy nghĩ:</span>
                  <span className="text-emerald-400 font-mono font-black">{botDelaySec}s / lượt</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={botDelaySec}
                  onChange={e => setBotDelaySec(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>1s (Chớp nhoáng)</span>
                  <span className="text-emerald-300/80 font-bold">2s (Dễ nhìn)</span>
                  <span>4s (Rất chậm)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowDeckModal(true)}
                className="text-xs text-yellow-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>🛠️</span> Tùy chỉnh số lượng bài trong bộ...
              </button>
            </div>

            <button
              onClick={() => onCreateSinglePlayer(playerName, singlePlayerCount, deckConfig, { nopeTimeoutSec, botDelaySec })}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-base uppercase rounded-2xl shadow-xl shadow-yellow-400/20 transition transform active:scale-95"
            >
              Vào Trận Đấu Ngay ⚡
            </button>
          </div>
        )}

        {/* Nội dung Tab LAN Multiplayer */}
        {tab === 'multi' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-2.5 sm:p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300">
              📍 Địa chỉ trang web: <strong className="font-mono text-white">{typeof window !== 'undefined' && !window.location.origin.includes('localhost') ? window.location.origin : `http://${lanIp}:3000`}</strong>
            </div>

            <button
              onClick={() => onCreateMultiplayer(playerName, deckConfig, { nopeTimeoutSec, botDelaySec })}
              className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm uppercase rounded-2xl shadow-md transition"
            >
              Tạo Phòng Mới (Làm Host)
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase font-bold">Hoặc</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={joinRoomCode}
                onChange={e => setJoinRoomCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã phòng (VD: 4 ký tự)..."
                maxLength={6}
                className="w-full bg-slate-950 border border-slate-700 px-4 py-2.5 rounded-xl text-center text-sm font-mono tracking-widest font-black uppercase text-white focus:outline-none focus:border-yellow-400 transition"
              />
              <button
                onClick={() => onJoinMultiplayer(joinRoomCode, playerName)}
                disabled={!joinRoomCode}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm uppercase rounded-2xl border border-slate-700 transition disabled:opacity-50"
              >
                Vào Phòng
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal tùy chỉnh bộ bài */}
      <CustomDeckModal
        isOpen={showDeckModal}
        onClose={() => setShowDeckModal(false)}
        config={deckConfig}
        onSave={cfg => setDeckConfig(cfg)}
        playerCount={singlePlayerCount}
      />
    </div>
  );
};


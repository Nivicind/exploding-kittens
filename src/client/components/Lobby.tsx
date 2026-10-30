import React, { useState, useEffect } from 'react';
import { CustomDeckConfig, GameSettings } from '../../engine/types';
import { CustomDeckModal } from './CustomDeckModal';
import { RulesModal } from './RulesModal';
import { Language, UI_TEXT } from '../i18n';

const VI_CAT_NAMES = [
  'Mèo Cam', 'Mèo Mướp', 'Mèo Tuxedo', 'Mèo Tam Thể', 'Mèo Mập',
  'Mèo Béo', 'Mèo Ninja', 'Mèo Quý Tộc', 'Mèo Lười', 'Mèo Hạt Tiêu',
  'Mèo Vô Tri', 'Mèo Mun', 'Mèo Bánh Bao', 'Mèo Cầu Vồng', 'Mèo Chiến Thần'
];

const EN_CAT_NAMES = [
  'Ginger Cat', 'Tuxedo Cat', 'Chonky Cat', 'Ninja Cat', 'Lucky Cat',
  'Grumpy Cat', 'Sleepy Cat', 'Cookie Cat', 'Calico Cat', 'Shadow Cat'
];

const generateRandomCatName = (targetLang: Language): string => {
  const list = targetLang === 'en' ? EN_CAT_NAMES : VI_CAT_NAMES;
  const base = list[Math.floor(Math.random() * list.length)];
  const num = Math.floor(Math.random() * 90 + 10);
  return `${base} #${num}`;
};

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
  onLeaveRoom?: () => void;
  lang?: Language;
  onToggleLang?: () => void;
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
  onUpdateSettings,
  onLeaveRoom,
  lang: langProp,
  onToggleLang: onToggleLangProp
}) => {
  const [internalLang, setInternalLang] = useState<Language>(() => {
    return (typeof window !== 'undefined' ? (localStorage.getItem('ek_lang') as Language) || 'vi' : 'vi');
  });
  const lang = langProp || internalLang;
  const handleToggleLang = () => {
    if (onToggleLangProp) {
      onToggleLangProp();
    } else {
      const next: Language = lang === 'vi' ? 'en' : 'vi';
      setInternalLang(next);
      if (typeof window !== 'undefined') localStorage.setItem('ek_lang', next);
    }
  };

  const [tab, setTab] = useState<'single' | 'multi'>('single');
  const [playerName, setPlayerName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ek_player_name');
      if (saved && saved.trim()) return saved.trim();
    }
    return generateRandomCatName(lang);
  });
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  const handleNameChange = (name: string) => {
    setPlayerName(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ek_player_name', name);
    }
  };

  const handleRollRandomName = () => {
    const random = generateRandomCatName(lang);
    setPlayerName(random);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ek_player_name', random);
    }
  };

  const getValidPlayerName = (): string => {
    const trimmed = playerName.trim();
    if (trimmed) return trimmed;
    const random = generateRandomCatName(lang);
    setPlayerName(random);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ek_player_name', random);
    }
    return random;
  };
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
          {/* Top Bar trong phòng: Nút Rời phòng / Quay lại Menu & Nút chuyển ngôn ngữ */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <button
              type="button"
              onClick={onLeaveRoom}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/70 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <span>←</span>
              <span>{lang === 'en' ? 'Leave Room / Menu' : 'Rời Phòng / Về Menu'}</span>
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] text-slate-400 font-medium">
                {isHost 
                  ? (lang === 'en' ? '👑 You are Host' : '👑 Bạn là Chủ phòng') 
                  : (lang === 'en' ? '👤 Player' : '👤 Người chơi')}
              </span>
              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-300 font-bold text-[10px] border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                title={lang === 'en' ? 'Game Rules & Guide' : 'Luật chơi & Hướng dẫn'}
              >
                <span>❓</span>
                <span className="hidden sm:inline">{lang === 'en' ? 'Rules' : 'Luật'}</span>
              </button>
              <button
                type="button"
                onClick={handleToggleLang}
                className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-300 font-bold text-[10px] border border-slate-700 transition"
              >
                {lang === 'en' ? '🇬🇧 EN' : '🇻🇳 VN'}
              </button>
            </div>
          </div>

          {/* Header Phòng */}
          <div className="text-center space-y-2">
            <span className="text-4xl">💣</span>
            <h2 className="text-2xl sm:text-3xl font-black text-yellow-400">
              {lang === 'en' ? 'Lobby:' : 'Phòng Chờ:'} <span className="tracking-widest uppercase text-white bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">{room.id}</span>
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
                <span>
                  {copiedLink 
                    ? (lang === 'en' ? 'Copied invite link!' : 'Đã sao chép link!') 
                    : (lang === 'en' ? 'Copy invite link' : 'Sao chép link mời')}
                </span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'en'
                ? 'Send this link to friends so they can join directly without typing room code!'
                : 'Gửi link này cho bạn bè để họ vào thẳng phòng mà không cần gõ mã phòng!'}
            </p>
          </div>

          {/* Danh sách người chơi trong phòng */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>{lang === 'en' ? 'Players ready' : 'Người chơi đã sẵn sàng'} ({room.players.length}/10):</span>
              {isHost && room.players.length < 10 && (
                <button
                  onClick={onAddBot}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-yellow-300 rounded-lg border border-slate-700 transition"
                >
                  {lang === 'en' ? '+ Add AI Bot' : '+ Thêm Bot AI'}
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
                      {p.id === room.hostId 
                        ? (lang === 'en' ? 'Host' : 'Chủ phòng (Host)') 
                        : p.isBot 
                        ? 'AI Bot' 
                        : (lang === 'en' ? 'Player' : 'Người chơi')}
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
                    <span>⏱️</span> {lang === 'en' ? 'Match Pace Settings' : 'Cài đặt nhịp độ ván đấu'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {lang === 'en' ? 'Easy to follow, not rushed' : 'Dễ theo dõi, không bị quá nhanh'}
                  </span>
                </div>

                {/* 1. Thời gian chờ Nope */}
                <div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 mb-1">
                    <span>{lang === 'en' ? 'NOPE reaction window:' : 'Thời gian chờ phản ứng NOPE:'}</span>
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
                    <span>{lang === 'en' ? '3s (Fast)' : '3s (Nhanh)'}</span>
                    <span className="text-rose-300/80 font-bold">{lang === 'en' ? '5s (Recommended)' : '5s (Khuyên dùng)'}</span>
                    <span>{lang === 'en' ? '10s (Relaxed)' : '10s (Thong thả)'}</span>
                  </div>
                </div>

                {/* 2. Tốc độ Bot suy nghĩ */}
                <div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 mb-1">
                    <span>{lang === 'en' ? 'AI Bot think time:' : 'Thời gian AI Bot suy nghĩ:'}</span>
                    <span className="text-emerald-400 font-mono font-black">{botDelaySec}s / {lang === 'en' ? 'turn' : 'lượt'}</span>
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
                    <span>{lang === 'en' ? '1s (Quick)' : '1s (Chớp nhoáng)'}</span>
                    <span className="text-emerald-300/80 font-bold">{lang === 'en' ? '2s (Clear)' : '2s (Dễ nhìn)'}</span>
                    <span>{lang === 'en' ? '4s (Slow)' : '4s (Rất chậm)'}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Cụm nút hành động: Thiết lập bộ bài & Bắt đầu trận đấu (Ngang hàng) */}
          <div className="pt-2 flex flex-col gap-2.5">
            {isHost ? (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeckModal(true)}
                  className={`flex-1 py-3.5 px-3 rounded-2xl font-black text-xs sm:text-sm uppercase transition flex items-center justify-center gap-1.5 shadow-md border cursor-pointer ${
                    room.deckConfig
                      ? 'bg-amber-950/80 border-amber-400 text-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100'
                  }`}
                  title={lang === 'en' ? 'Configure card counts and deck rules' : 'Cấu hình số lượng các loại thẻ bài và luật chia bài'}
                >
                  <span>⚙️</span>
                  <span>{lang === 'en' ? 'Deck Settings' : 'Thiết Lập Bộ Bài'}</span>
                  {room.deckConfig && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                </button>

                <button
                  onClick={onStartGame}
                  disabled={room.players.length < 2}
                  className="flex-[1.5] py-3.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase rounded-2xl shadow-xl shadow-yellow-400/20 transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🚀</span>
                  <span>{lang === 'en' ? 'Start Match' : 'Bắt Đầu Trận Đấu'}</span>
                </button>
              </div>
            ) : (
              <div className="text-center text-sm font-semibold text-slate-400 py-3 bg-slate-800/40 rounded-xl border border-slate-700/40 animate-pulse">
                {lang === 'en' ? 'Waiting for Host to start match...' : 'Đang chờ Chủ phòng bắt đầu ván đấu...'}
              </div>
            )}

            <button
              type="button"
              onClick={onLeaveRoom}
              className="w-full py-2 bg-slate-950/70 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-xs font-bold rounded-xl border border-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>🚪</span>
              <span>{lang === 'en' ? 'Leave lobby and return to main menu' : 'Rời khỏi phòng chờ và quay lại Menu chính'}</span>
            </button>
          </div>
        </div>

        {/* Modal tùy chỉnh bộ bài */}
        <CustomDeckModal
          isOpen={showDeckModal}
          onClose={() => setShowDeckModal(false)}
          config={room.deckConfig}
          onSave={onUpdateDeckConfig}
          playerCount={room.players.length}
          lang={lang}
        />
      </div>
    );
  }

  // Màn hình chính ngoài sảnh
  return (
    <div className="relative min-h-[100dvh] w-full bg-slate-950 flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 py-6 sm:py-10 pb-16 sm:pb-10 overflow-y-auto">
      {/* Nút chuyển đổi ngôn ngữ Việt / Anh & Xem luật chơi ở góc trên bên phải */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setShowRulesModal(true)}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-yellow-300 font-black text-xs border border-slate-700 shadow-md flex items-center gap-1 transition active:scale-95 cursor-pointer backdrop-blur-md"
          title={lang === 'en' ? 'Rules & Guide' : 'Luật chơi & Hướng dẫn'}
        >
          <span>❓</span>
          <span className="hidden sm:inline">{lang === 'en' ? 'Rules' : 'Luật Chơi'}</span>
        </button>

        <button
          type="button"
          onClick={handleToggleLang}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-yellow-300 font-black text-xs border border-slate-700 shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <span>{lang === 'en' ? '🇬🇧' : '🇻🇳'}</span>
          <span>{lang === 'en' ? 'EN' : 'VN'}</span>
        </button>
      </div>

      <div className="bg-slate-900 border-2 border-slate-800 w-full max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 my-auto">
        {/* Logo và tiêu đề */}
        <div className="text-center">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-rose-500/20 border-2 border-rose-500 rounded-full flex items-center justify-center mx-auto text-3xl sm:text-4xl mb-2 sm:mb-3 animate-bounce-short">
            💣
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-yellow-400 uppercase tracking-wider">
            {lang === 'en' ? 'EXPLODING KITTENS' : 'MÈO NỔ'}
          </h1>
          <p className="text-[11px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
            {lang === 'en' ? 'Multiplayer Party Card Game' : 'Exploding Kittens Online'}
          </p>
        </div>

        {/* Tab chọn chế độ (Đệm rộng rãi, chống dính sát chữ và viền vàng) */}
        <div className="flex gap-2 sm:gap-2.5 bg-slate-950 p-1.5 sm:p-2 rounded-2xl border border-slate-800">
          <button
            onClick={() => setTab('single')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-xs font-black uppercase rounded-xl transition cursor-pointer ${
              tab === 'single'
                ? 'bg-yellow-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'en' ? 'Solo vs AI' : 'Chơi Đơn vs AI'}
          </button>
          <button
            onClick={() => setTab('multi')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-xs font-black uppercase rounded-xl transition cursor-pointer ${
              tab === 'multi'
                ? 'bg-yellow-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'en' ? 'Multiplayer (Online / LAN)' : 'Nhiều Người (Online / LAN)'}
          </button>
        </div>

        {/* Tên người chơi với nút xúc xắc ngẫu nhiên 🎲 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-300">
              {lang === 'en' ? 'Your Name:' : 'Tên của bạn:'}
            </label>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>Bấm 🎲 đổi tên ngẫu nhiên</span>
            </span>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={playerName}
              onChange={e => handleNameChange(e.target.value)}
              maxLength={18}
              className="w-full bg-slate-950 border border-slate-700 pl-4 pr-11 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-yellow-400 transition"
              placeholder={lang === 'en' ? 'Enter player name...' : 'Nhập tên người chơi...'}
            />
            <button
              type="button"
              onClick={handleRollRandomName}
              title={lang === 'en' ? 'Roll random cat name' : 'Đổi tên Mèo ngẫu nhiên 🎲'}
              className="absolute right-1.5 p-1.5 text-base hover:scale-115 active:scale-95 transition cursor-pointer text-slate-400 hover:text-yellow-400"
            >
              🎲
            </button>
          </div>
        </div>

        {/* Nội dung Tab Chơi Đơn vs AI */}
        {tab === 'single' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
                <span>{lang === 'en' ? 'Total players on table:' : 'Tổng số người chơi trên bàn:'}</span>
                <span className="text-yellow-400 text-sm">
                  {lang === 'en' 
                    ? `${singlePlayerCount} players (You + ${singlePlayerCount - 1} Bots)` 
                    : `${singlePlayerCount} người (Bạn + ${singlePlayerCount - 1} Bot)`}
                </span>
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
                <span>{lang === 'en' ? '2 players' : '2 người'}</span>
                <span>{lang === 'en' ? 'Up to 10 players' : 'Tối đa 10 người'}</span>
              </div>
            </div>

            {/* TÙY CHỈNH THỜI GIAN CHỜ NOPE & TỐC ĐỘ BOT */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-slate-300">
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <span>⏱️</span> {lang === 'en' ? 'Match Pace Settings' : 'Cài đặt nhịp độ ván đấu'}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {lang === 'en' ? 'Easy to follow, not rushed' : 'Dễ theo dõi, không bị quá nhanh'}
                </span>
              </div>

              {/* 1. Thời gian chờ Nope */}
              <div>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 mb-1">
                  <span>{lang === 'en' ? 'NOPE reaction window:' : 'Thời gian chờ phản ứng NOPE:'}</span>
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
                  <span>{lang === 'en' ? '3s (Fast)' : '3s (Nhanh)'}</span>
                  <span className="text-rose-300/80 font-bold">{lang === 'en' ? '5s (Recommended)' : '5s (Khuyên dùng)'}</span>
                  <span>{lang === 'en' ? '10s (Relaxed)' : '10s (Thong thả)'}</span>
                </div>
              </div>

              {/* 2. Tốc độ Bot suy nghĩ */}
              <div>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 mb-1">
                  <span>{lang === 'en' ? 'AI Bot think time:' : 'Thời gian AI Bot suy nghĩ:'}</span>
                  <span className="text-emerald-400 font-mono font-black">{botDelaySec}s / {lang === 'en' ? 'turn' : 'lượt'}</span>
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
                  <span>{lang === 'en' ? '1s (Quick)' : '1s (Chớp nhoáng)'}</span>
                  <span className="text-emerald-300/80 font-bold">{lang === 'en' ? '2s (Clear)' : '2s (Dễ nhìn)'}</span>
                  <span>{lang === 'en' ? '4s (Slow)' : '4s (Rất chậm)'}</span>
                </div>
              </div>
            </div>

            {/* Cụm nút hành động Chơi Đơn vs AI: Thiết lập bộ bài & Vào trận đấu (Ngang hàng) */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeckModal(true)}
                className={`flex-1 py-3.5 px-3 rounded-2xl font-black text-xs sm:text-sm uppercase transition flex items-center justify-center gap-1.5 shadow-md border cursor-pointer active:scale-95 ${
                  deckConfig
                    ? 'bg-amber-950/80 border-amber-400 text-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100'
                }`}
                title={lang === 'en' ? 'Configure card counts and deck rules' : 'Cấu hình số lượng các loại thẻ bài và luật chia bài'}
              >
                <span>⚙️</span>
                <span>{lang === 'en' ? 'Deck Settings' : 'Thiết Lập Bộ Bài'}</span>
                {deckConfig && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </button>

              <button
                type="button"
                onClick={() => onCreateSinglePlayer(getValidPlayerName(), singlePlayerCount, deckConfig, { nopeTimeoutSec, botDelaySec })}
                className="flex-[1.5] py-3.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase rounded-2xl shadow-xl shadow-yellow-400/20 transition transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>⚡</span>
                <span>{lang === 'en' ? 'Enter Match' : 'Vào Trận Đấu'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Nội dung Tab LAN Multiplayer */}
        {tab === 'multi' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-2.5 sm:p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300">
              {lang === 'en' ? '📍 Website Address:' : '📍 Địa chỉ trang web:'} <strong className="font-mono text-white">{typeof window !== 'undefined' && !window.location.origin.includes('localhost') ? window.location.origin : `http://${lanIp}:3000`}</strong>
            </div>

            {/* Cụm nút hành động Multiplayer: Thiết lập bộ bài & Tạo phòng mới (Ngang hàng) */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeckModal(true)}
                className={`flex-1 py-3.5 px-3 rounded-2xl font-black text-xs sm:text-sm uppercase transition flex items-center justify-center gap-1.5 shadow-md border cursor-pointer active:scale-95 ${
                  deckConfig
                    ? 'bg-amber-950/80 border-amber-400 text-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100'
                }`}
                title={lang === 'en' ? 'Configure card counts before hosting' : 'Cài đặt bộ bài trước khi tạo phòng'}
              >
                <span>⚙️</span>
                <span>{lang === 'en' ? 'Deck Settings' : 'Thiết Lập Bộ Bài'}</span>
                {deckConfig && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </button>

              <button
                type="button"
                onClick={() => onCreateMultiplayer(getValidPlayerName(), deckConfig, { nopeTimeoutSec, botDelaySec })}
                className="flex-[1.5] py-3.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase rounded-2xl shadow-xl shadow-yellow-400/20 transition transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🚀</span>
                <span>{lang === 'en' ? 'Create Room (Host)' : 'Tạo Phòng (Host)'}</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase font-bold">{lang === 'en' ? 'Or' : 'Hoặc'}</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={joinRoomCode}
                onChange={e => setJoinRoomCode(e.target.value.toUpperCase())}
                placeholder={lang === 'en' ? 'Enter room code (e.g. 4 letters)...' : 'Nhập mã phòng (VD: 4 ký tự)...'}
                maxLength={6}
                className="w-full bg-slate-950 border border-slate-700 px-4 py-2.5 rounded-xl text-center text-sm font-mono tracking-widest font-black uppercase text-white focus:outline-none focus:border-yellow-400 transition"
              />
              <button
                onClick={() => onJoinMultiplayer(joinRoomCode, getValidPlayerName())}
                disabled={!joinRoomCode}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm uppercase rounded-2xl border border-slate-700 transition disabled:opacity-50 cursor-pointer"
              >
                {lang === 'en' ? 'Join Room' : 'Vào Phòng'}
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
        lang={lang}
      />

      {/* Modal hướng dẫn luật chơi */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        lang={lang}
      />
    </div>
  );
};


import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, CustomDeckConfig, GameSettings } from '../engine/types';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';

interface RoomData {
  id: string;
  hostId: string;
  players: { id: string; name: string; isBot: boolean }[];
  state: GameState | null;
  deckConfig?: CustomDeckConfig;
  settings?: GameSettings;
}

export const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomData | null>(null);
  const [lanIp, setLanIp] = useState<string>('localhost');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Khởi tạo Socket.IO kết nối & Tự động kết nối lại khi tải lại trang (F5)
  useEffect(() => {
    // Kết nối tự động tới server của ván đấu (hỗ trợ cả localhost và thiết bị khác qua mạng LAN/Cloud)
    const newSocket = io();
    setSocket(newSocket);

    // Lấy thông tin LAN IP từ backend
    fetch('/api/info')
      .then(res => res.json())
      .then(data => {
        if (data.lanIp) setLanIp(data.lanIp);
      })
      .catch(() => {
        setLanIp(window.location.hostname);
      });

    // Tự động kiểm tra phiên chơi dở trong sessionStorage để kết nối lại
    newSocket.on('connect', () => {
      const savedSessionStr = sessionStorage.getItem('ek_session');
      if (savedSessionStr) {
        try {
          const saved = JSON.parse(savedSessionStr);
          if (saved.roomId && saved.playerId) {
            newSocket.emit('reconnect_room', { roomId: saved.roomId, playerId: saved.playerId }, (res: any) => {
              if (res && res.success && res.room) {
                setRoomId(saved.roomId);
                setMyPlayerId(saved.playerId);
                setRoom(res.room);
                setToastNotification('⚡ Đã kết nối lại ván đấu! (AI đã chơi hộ trong lúc bạn vắng mặt)');
                setTimeout(() => setToastNotification(null), 5000);
              } else {
                sessionStorage.removeItem('ek_session');
              }
            });
          }
        } catch {
          sessionStorage.removeItem('ek_session');
        }
      }
    });

    newSocket.on('room_update', (updatedRoom: RoomData) => {
      // Chỉ cập nhật nếu người chơi đang ở trong phòng này (tránh bị văng về phòng khi đã bấm rời bàn)
      const currentSession = sessionStorage.getItem('ek_session');
      if (currentSession) {
        try {
          const session = JSON.parse(currentSession);
          if (session.roomId === updatedRoom.id) {
            setRoom(updatedRoom);
          }
        } catch {
          // ignore
        }
      }
    });

    newSocket.on('game_error', ({ message }: { message: string }) => {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Tạo trận Chơi Đơn vs AI
  const handleCreateSinglePlayer = (name: string, playerCount: number, deckConfig?: CustomDeckConfig, settings?: GameSettings) => {
    if (!socket) return;
    const botCount = playerCount - 1;

    socket.emit('create_room', { hostName: name, botCount, deckConfig, settings }, (res: any) => {
      if (res.success) {
        sessionStorage.setItem('ek_session', JSON.stringify({ roomId: res.roomId, playerId: res.playerId }));
        setRoomId(res.roomId);
        setMyPlayerId(res.playerId);
        setRoom(res.room);

        // Tự động khởi động trận đấu ngay
        socket.emit('start_game', { roomId: res.roomId });
      } else {
        setErrorMessage(res.error || 'Lỗi tạo phòng.');
      }
    });
  };

  // Tạo phòng Host LAN Multiplayer
  const handleCreateMultiplayer = (hostName: string, deckConfig?: CustomDeckConfig, settings?: GameSettings) => {
    if (!socket) return;
    socket.emit('create_room', { hostName, botCount: 0, deckConfig, settings }, (res: any) => {
      if (res.success) {
        sessionStorage.setItem('ek_session', JSON.stringify({ roomId: res.roomId, playerId: res.playerId }));
        setRoomId(res.roomId);
        setMyPlayerId(res.playerId);
        setRoom(res.room);
      } else {
        setErrorMessage(res.error || 'Lỗi tạo phòng.');
      }
    });
  };

  // Tham gia phòng LAN qua mã
  const handleJoinMultiplayer = (joinRoomId: string, playerName: string) => {
    if (!socket) return;
    socket.emit('join_room', { roomId: joinRoomId, playerName }, (res: any) => {
      if (res.success) {
        sessionStorage.setItem('ek_session', JSON.stringify({ roomId: res.roomId, playerId: res.playerId }));
        setRoomId(res.roomId);
        setMyPlayerId(res.playerId);
        setRoom(res.room);
      } else {
        setErrorMessage(res.error || 'Không thể tham gia phòng.');
      }
    });
  };

  // Thêm AI bot vào phòng
  const handleAddBot = () => {
    if (!socket || !roomId) return;
    socket.emit('add_bot', { roomId });
  };

  // Bắt đầu ván đấu
  const handleStartGame = () => {
    if (!socket || !roomId) return;
    socket.emit('start_game', { roomId });
  };

  // Cập nhật cấu hình bộ bài
  const handleUpdateDeckConfig = (config: CustomDeckConfig) => {
    if (!socket || !roomId) return;
    socket.emit('update_deck_config', { roomId, config });
  };

  // Cập nhật cài đặt trận đấu (Thời gian chờ Nope & Độ trễ Bot)
  const handleUpdateSettings = (settings: GameSettings) => {
    if (!socket || !roomId) return;
    socket.emit('update_settings', { roomId, settings });
  };

  // Rút bài
  const handleDrawCard = () => {
    if (!socket || !roomId || !myPlayerId) return;
    socket.emit('draw_card', { roomId, playerId: myPlayerId });
  };

  // Đánh bài hoặc combo
  const handlePlayCards = (
    cardUids: string[], 
    options?: { targetPlayerId?: string; targetCardDefId?: string }
  ) => {
    if (!socket || !roomId || !myPlayerId) return;
    socket.emit('play_cards', { roomId, playerId: myPlayerId, cardUids, options });
  };

  // Bỏ qua cửa sổ Nope
  const handlePassNope = () => {
    if (!socket || !roomId || !myPlayerId) return;
    socket.emit('pass_nope', { roomId, playerId: myPlayerId });
  };

  // Giấu lại Mèo Nổ sau khi Defuse
  const handleInsertDefuse = (insertIndex: number) => {
    if (!socket || !roomId || !myPlayerId) return;
    socket.emit('insert_defuse', { roomId, playerId: myPlayerId, insertIndex });
  };

  // Chọn người chơi bị Favor
  const handleSelectFavorTarget = (targetPlayerId: string) => {
    if (!socket || !roomId || !myPlayerId) return;
    socket.emit('select_favor_target', { roomId, playerId: myPlayerId, targetPlayerId });
  };

  // Đưa bài cho Favor
  const handleGiveFavorCard = (cardUid: string) => {
    if (!socket || !roomId || !myPlayerId) return;
    socket.emit('give_favor', { roomId, playerId: myPlayerId, cardUid });
  };

  // Chọn bài từ Discard Pile
  const handlePickDiscard = (cardUid: string) => {
    if (!socket || !roomId || !myPlayerId) return;
    socket.emit('pick_discard', { roomId, playerId: myPlayerId, cardUid });
  };

  // Đóng bảng xem See the Future
  const handleCloseSeeFuture = () => {
    if (!socket || !roomId || !myPlayerId) return;
    socket.emit('close_see_future', { roomId, playerId: myPlayerId });
  };

  // Rời bàn đấu
  const handleLeaveGame = () => {
    if (socket && roomId && myPlayerId) {
      socket.emit('leave_room', { roomId, playerId: myPlayerId });
    }
    sessionStorage.removeItem('ek_session');
    setRoom(null);
    setRoomId(null);
    setMyPlayerId(null);
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Toast thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-rose-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-2xl border border-rose-400 animate-bounce">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Toast thông báo chung / khôi phục kết nối */}
      {toastNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-2xl border border-emerald-300 animate-bounce">
          {toastNotification}
        </div>
      )}

      {/* Hiển thị Game Board nếu trận đang diễn ra hoặc đã kết thúc */}
      {room?.state && (room.state.status === 'playing' || room.state.status === 'game_over') && myPlayerId ? (
        <GameBoard
          state={room.state}
          myPlayerId={myPlayerId}
          onDrawCard={handleDrawCard}
          onPlayCards={handlePlayCards}
          onPassNope={handlePassNope}
          onInsertDefuse={handleInsertDefuse}
          onSelectFavorTarget={handleSelectFavorTarget}
          onGiveFavorCard={handleGiveFavorCard}
          onPickDiscard={handlePickDiscard}
          onCloseSeeFuture={handleCloseSeeFuture}
          onLeaveGame={handleLeaveGame}
        />
      ) : (
        <Lobby
          myPlayerId={myPlayerId}
          room={room}
          lanIp={lanIp}
          onCreateSinglePlayer={handleCreateSinglePlayer}
          onCreateMultiplayer={handleCreateMultiplayer}
          onJoinMultiplayer={handleJoinMultiplayer}
          onAddBot={handleAddBot}
          onStartGame={handleStartGame}
          onUpdateDeckConfig={handleUpdateDeckConfig}
          onUpdateSettings={handleUpdateSettings}
        />
      )}
    </div>
  );
};

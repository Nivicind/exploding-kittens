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

  // Khởi tạo Socket.IO kết nối
  useEffect(() => {
    // Kết nối tự động tới server của ván đấu (hỗ trợ cả localhost và thiết bị khác qua mạng LAN)
    const newSocket = io();
    setSocket(newSocket);

    // Lấy thông tin LAN IP từ backend
    fetch('/api/info')
      .then(res => res.json())
      .then(data => {
        if (data.lanIp) setLanIp(data.lanIp);
      })
      .catch(() => {
        // Fallback hostname
        setLanIp(window.location.hostname);
      });

    newSocket.on('room_update', (updatedRoom: RoomData) => {
      setRoom(updatedRoom);
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
    setRoom(null);
    setRoomId(null);
    setMyPlayerId(null);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      {/* Toast thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-rose-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-2xl border border-rose-400 animate-bounce">
          ⚠️ {errorMessage}
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

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { RoomManager } from './RoomManager';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager(io);

// Lấy địa chỉ IP mạng nội bộ (LAN IPv4)
function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// API lấy IP LAN
app.get('/api/info', (req, res) => {
  res.json({
    lanIp: getLocalIp(),
    port: 3000
  });
});

// API kiểm tra sức khỏe máy chủ & Keep-alive ping (chống ngủ đông)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Phục vụ Client build tĩnh (nếu có)
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/socket.io') || req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), err => {
    if (err) next();
  });
});

// Xử lý sự kiện Socket.IO
io.on('connection', socket => {
  console.log(`[Socket] Kết nối mới: ${socket.id}`);

  // Tạo phòng mới (Chơi đơn vs Bot hoặc Host phòng LAN)
  socket.on('create_room', ({ hostName, botCount, deckConfig, settings }, callback) => {
    try {
      const room = roomManager.createRoom(hostName, socket.id, botCount, deckConfig, settings);
      socket.join(room.id);
      callback({
        success: true,
        roomId: room.id,
        playerId: room.players[0].id,
        room
      });
      roomManager.broadcastRoom(room);
    } catch (err: any) {
      callback({ success: false, error: err.message });
    }
  });

  // Tham gia phòng bằng mã (LAN Multiplayer)
  socket.on('join_room', ({ roomId, playerName }, callback) => {
    const res = roomManager.joinRoom(roomId, playerName, socket.id);
    if (res.error || !res.room) {
      return callback({ success: false, error: res.error });
    }
    socket.join(res.room.id);
    const joinedPlayer = res.room.players.find(p => p.socketId === socket.id);
    callback({
      success: true,
      roomId: res.room.id,
      playerId: joinedPlayer?.id,
      room: res.room
    });
    roomManager.broadcastRoom(res.room);
  });

  // Thêm AI bot vào phòng
  socket.on('add_bot', ({ roomId }, callback) => {
    const res = roomManager.addBotToRoom(roomId);
    if (callback) callback(res);
  });

  // Bắt đầu trận đấu
  socket.on('start_game', ({ roomId }, callback) => {
    const res = roomManager.startGame(roomId);
    if (callback) callback(res);
  });

  // Rút bài
  socket.on('draw_card', ({ roomId, playerId }) => {
    roomManager.drawCard(roomId, playerId);
  });

  // Đánh bài (hoặc đánh Combo)
  socket.on('play_cards', ({ roomId, playerId, cardUids, options }) => {
    roomManager.playCards(roomId, playerId, cardUids, options);
  });

  // Bỏ qua cửa sổ Nope
  socket.on('pass_nope', ({ roomId, playerId }) => {
    roomManager.passNope(roomId, playerId);
  });

  // Giấu lại Mèo Nổ sau khi Defuse
  socket.on('insert_defuse', ({ roomId, playerId, insertIndex }) => {
    roomManager.insertDefuse(roomId, playerId, insertIndex);
  });

  // Chọn người bị Favor
  socket.on('select_favor_target', ({ roomId, playerId, targetPlayerId }) => {
    roomManager.selectFavorTarget(roomId, playerId, targetPlayerId);
  });

  // Đưa bài cho Favor
  socket.on('give_favor', ({ roomId, playerId, cardUid }) => {
    roomManager.giveFavorCard(roomId, playerId, cardUid);
  });

  // Chọn bài từ Discard Pile (Combo 5 lá)
  socket.on('pick_discard', ({ roomId, playerId, cardUid }) => {
    roomManager.pickDiscard(roomId, playerId, cardUid);
  });

  // Đóng bảng xem trước See the Future
  socket.on('close_see_future', ({ roomId, playerId }) => {
    roomManager.closeSeeFuture(roomId, playerId);
  });

  // Cập nhật cấu hình bộ bài
  socket.on('update_deck_config', ({ roomId, config }) => {
    roomManager.updateDeckConfig(roomId, config);
  });

  // Cập nhật cài đặt trận đấu (Thời gian chờ Nope & Độ trễ Bot)
  socket.on('update_settings', ({ roomId, settings }) => {
    roomManager.updateSettings(roomId, settings);
  });

  // Ngắt kết nối
  socket.on('disconnect', () => {
    console.log(`[Socket] Ngắt kết nối: ${socket.id}`);
  });
});

// Cổng máy chủ: Nếu chạy sản phẩm hoặc standalone thì dùng 3000, nếu dev thì dùng 3001
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Exploding Kittens server đang chạy trên cổng ${PORT}`);
  console.log(`[Server] Local URL:   http://localhost:${PORT}`);
  console.log(`[Server] Mạng LAN URL: http://${getLocalIp()}:${PORT}`);
});

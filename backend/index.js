require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

// Configures Socket.io for Real-time bingo events
const io = new Server(server, {
  cors: {
    origin: '*', // We'll restrict this in production (to our frontend port 3000)
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bingo-v2')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));

// Main Root Endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok', msg: 'Bingo V2 API is running!' }));

// --- WebSockets Logic ---
io.on('connection', (socket) => {
  console.log('Participant connected:', socket.id);

  // Player/Admin joins a specific game/room
  socket.on('join_room', (data) => {
    const roomId = typeof data === 'string' ? data : data.roomId;
    const name = typeof data === 'string' ? null : data.playerName;
    socket.join(roomId);
    if (name) {
      io.to(roomId).emit('player_joined', { name, id: socket.id });
    }
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Admin draws a number and broadcasts to room
  socket.on('draw_number', (data) => {
    // data expected: { roomId, number, letter }
    io.to(data.roomId).emit('number_drawn', data);
  });

  // Player hits 'Bingo'
  socket.on('bingo_called', (data) => {
    // data expected: { roomId, playerName, cardNumbers }
    io.to(data.roomId).emit('player_bingo', data);
  });

  // Player hits 'Linha'
  socket.on('linha_called', (data) => {
    io.to(data.roomId).emit('player_linha', data);
  });

  // Start new game / Reset room
  socket.on('start_game', (roomId) => {
    io.to(roomId).emit('game_started');
  });

  socket.on('close_room', (roomId) => {
    io.to(roomId).emit('room_closed');
  });

  socket.on('disconnect', () => {
    console.log('Participant disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 API + Socket.io Server rodando na porta ${PORT}`);
});

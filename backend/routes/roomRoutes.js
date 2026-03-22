const express = require('express');
const Room = require('../models/Room');
const router = express.Router();

router.get('/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const generateRoomId = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

router.post('/create', async (req, res) => {
  const { adminId, gameMode } = req.body;
  try {
    const roomId = generateRoomId();
    const room = await Room.create({ roomId, admin: adminId, gameMode, drawnNumbers: [] });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:roomId/draw', async (req, res) => {
   const { number } = req.body;
   try {
     const room = await Room.findOneAndUpdate(
       { roomId: req.params.roomId },
       { $push: { drawnNumbers: number }, status: 'playing' },
       { new: true }
     );
     res.json(room);
   } catch (error) {
     res.status(500).json({ message: error.message });
   }
});

module.exports = router;

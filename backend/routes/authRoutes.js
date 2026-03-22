const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'bingo_secret', { expiresIn: '30d' });
};

// Middleware to verify super admin token
const protectSuperAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Não autorizado.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bingo_secret');
    const admin = await Admin.findById(decoded.id);
    if (!admin || admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Acesso negado. Super Admin apenas.' });
    }
    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido.' });
  }
};

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });
    
    const admin = await Admin.create({ email, password });
    res.status(201).json({ _id: admin.id, email: admin.email, role: admin.role, token: generateToken(admin._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (admin && (await admin.matchPassword(password))) {
      res.json({ _id: admin.id, email: admin.email, role: admin.role, token: generateToken(admin._id) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Promote admin to superadmin (requires current superadmin token OR env key)
router.post('/promote', async (req, res) => {
  const { email, secretKey } = req.body;
  const SUPER_ADMIN_KEY = process.env.SUPER_ADMIN_KEY || 'bingo_superadmin_2025';
  if (secretKey !== SUPER_ADMIN_KEY) {
    return res.status(403).json({ message: 'Chave secreta inválida.' });
  }
  try {
    const admin = await Admin.findOneAndUpdate(
      { email },
      { role: 'superadmin' },
      { new: true }
    );
    if (!admin) return res.status(404).json({ message: 'Admin não encontrado.' });
    res.json({ message: `${admin.email} promovido a Super Admin.`, role: admin.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all admins (superadmin only)
router.get('/all', protectSuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find({}).select('-password').sort({ role: -1, email: 1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

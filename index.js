// ================================
// BACKEND — index.js (FINAL)
// ================================
console.log('### AGROV BACKEND FINAL ###');

import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import PDFDocument from 'pdfkit';

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   GLOBAL CORS
========================= */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/* =========================
   APP / DB
========================= */
app.use(express.json());
app.use(cookieParser());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/* =========================
   AUTH MIDDLEWARE
========================= */
const auth = (req, res, next) => {
  let token = null;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.sendStatus(401);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
};

/* =========================
   HEALTH
========================= */
app.get('/health', async (_, res) => {
  await pool.query('select 1');
  res.json({ ok: true });
});

/* =========================
   LOGIN (FINAL)
========================= */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const r = await pool.query(
    'select id,email,password,role from users where email=$1',
    [email]
  );

  const u = r.rows[0];
  if (!u) return res.status(401).json({ error: 'invalid' });

  const ok = await bcrypt.compare(password, u.password);
  if (!ok) return res.status(401).json({ error: 'invalid' });

  const token = jwt.sign(
    { id: u.id, role: u.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res
    .cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    })
    .json({ ok: true });
});

/* =========================
   ME
========================= */
app.get('/me', auth, async (req, res) => {
  const r = await pool.query(
    'select id,email,role from users where id=$1',
    [req.user.id]
  );
  res.json(r.rows[0]);
});

/* =========================
   ADMIN
========================= */
app.get('/admin/overview', auth, adminOnly, async (_, res) => {
  const users = await pool.query('select count(*) from users');
  const firms = await pool.query('select count(*) from firms');
  const tx = await pool.query('select count(*) from transactions');

  res.json({
    users: users.rows[0].count,
    firms: firms.rows[0].count,
    transactions: tx.rows[0].count,
  });
});

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log('SERVER UP ON PORT', PORT);
});

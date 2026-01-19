console.log('### AGROV BACKEND FINAL ###');

import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGIN = process.env.ADMIN_ORIGIN || 'http://localhost:3000';

/* =========================
   CORS (WITH CREDENTIALS)
========================= */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use(cookieParser());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/* =========================
   AUTH
========================= */
const auth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.sendStatus(401);
  }
};

/* =========================
   HEALTH
========================= */
app.get('/health', (_, res) => {
  res.json({ ok: true });
});

/* =========================
   LOGIN
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
      secure: false, // ⬅️ LOCALHOST
      path: '/',
    })
    .json({ ok: true });
});

/* =========================
   ME
========================= */
app.get('/me', auth, (req, res) => {
  res.json(req.user);
});

app.listen(PORT, () => {
  console.log('SERVER UP ON PORT', PORT);
});

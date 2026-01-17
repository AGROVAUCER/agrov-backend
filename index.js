console.log('=== AGROV INDEX – AUTH + STORES + QR ===');

import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

/* =========================
   HEALTH
========================= */
app.get('/health', async (req, res) => {
  try {
    await pool.query('select 1');
    res.json({ status: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'DB ERROR' });
  }
});

/* =========================
   AUTH MIDDLEWARE
========================= */
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid token format' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/* =========================
   REGISTER USER (MOBILE)
========================= */
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `insert into users (email, password, role)
       values ($1, $2, 'user')
       returning id, email, role, created_at`,
      [email, hash]
    );

    // init voucher balance
    await pool.query(
      `insert into user_vouchers (user_id) values ($1)`,
      [result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch {
    res.status(400).json({ error: 'User already exists' });
  }
});

/* =========================
   REGISTER FIRM (WEB)
========================= */
app.post('/register-firm', async (req, res) => {
  const { email, password, name, pib, address } = req.body;
  if (!email || !password || !name || !pib) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `insert into users (email, password, role)
       values ($1, $2, 'firm')
       returning id, email, role`,
      [email, hash]
    );

    const firmResult = await pool.query(
      `insert into firms (owner_user_id, name, pib, address)
       values ($1, $2, $3, $4)
       returning *`,
      [userResult.rows[0].id, name, pib, address]
    );

    res.status(201).json({
      user: userResult.rows[0],
      firm: firmResult.rows[0],
    });
  } catch {
    res.status(400).json({ error: 'Firm already exists' });
  }
});

/* =========================
   LOGIN (ALL)
========================= */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const result = await pool.query(
    'select * from users where email = $1 and is_active = true',
    [email]
  );

  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token });
});

/* =========================
   ME
========================= */
app.get('/me', authMiddleware, async (req, res) => {
  const result = await pool.query(
    `select id, email, role, created_at
     from users
     where id = $1`,
    [req.user.id]
  );

  res.json(result.rows[0]);
});

/* =========================
   STORES – CREATE (FIRM)
========================= */
app.post('/stores', authMiddleware, async (req, res) => {
  if (req.user.role !== 'firm') {
    return res.status(403).json({ error: 'Firm only' });
  }

  const { name, address } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });

  const qrToken = crypto.randomBytes(24).toString('hex');

  const result = await pool.query(
    `insert into stores (firm_id, name, address, qr_code)
     values (
       (select id from firms where owner_user_id = $1),
       $2, $3, $4
     )
     returning *`,
    [req.user.id, name, address, qrToken]
  );

  res.status(201).json(result.rows[0]);
});

/* =========================
   STORES – LIST (FIRM)
========================= */
app.get('/stores', authMiddleware, async (req, res) => {
  if (req.user.role !== 'firm') {
    return res.status(403).json({ error: 'Firm only' });
  }

  const result = await pool.query(
    `select id, name, address, qr_code, created_at
     from stores
     where firm_id = (select id from firms where owner_user_id = $1)
     order by created_at desc`,
    [req.user.id]
  );

  res.json(result.rows);
});

/* =========================
   SCAN QR (USER)
========================= */
app.post('/scan', authMiddleware, async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ error: 'User only' });
  }

  const { qr } = req.body;
  if (!qr) return res.status(400).json({ error: 'Missing QR token' });

  const result = await pool.query(
    `select s.id as store_id, s.name as store_name,
            f.id as firm_id, f.name as firm_name
     from stores s
     join firms f on f.id = s.firm_id
     where s.qr_code = $1 and s.is_active = true`,
    [qr]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: 'Invalid QR' });
  }

  res.json(result.rows[0]);
});

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


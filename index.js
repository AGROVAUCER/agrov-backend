console.log('=== AGROV BACKEND FINAL ===');

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
  } catch {
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
    req.user = jwt.verify(token, process.env.JWT_SECRET);
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
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hash = await bcrypt.hash(password, 10);

    const user = await pool.query(
      `insert into users (email, password, role)
       values ($1, $2, 'user')
       returning id, email, role`,
      [email, hash]
    );

    await pool.query(
      `insert into user_vouchers (user_id) values ($1)`,
      [user.rows[0].id]
    );

    res.status(201).json(user.rows[0]);
  } catch {
    res.status(400).json({ error: 'User exists' });
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

    const user = await pool.query(
      `insert into users (email, password, role)
       values ($1, $2, 'firm')
       returning id, email, role`,
      [email, hash]
    );

    const firm = await pool.query(
      `insert into firms (owner_user_id, name, pib, address)
       values ($1, $2, $3, $4)
       returning *`,
      [user.rows[0].id, name, pib, address]
    );

    res.status(201).json({ user: user.rows[0], firm: firm.rows[0] });
  } catch {
    res.status(400).json({ error: 'Firm exists' });
  }
});

/* =========================
   LOGIN (ALL)
========================= */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  const result = await pool.query(
    'select * from users where email = $1 and is_active = true',
    [email]
  );

  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

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
    'select id, email, role from users where id = $1',
    [req.user.id]
  );
  res.json(result.rows[0]);
});

/* =========================
   STORES (FIRM)
========================= */
app.post('/stores', authMiddleware, async (req, res) => {
  if (req.user.role !== 'firm') return res.status(403).json({ error: 'Firm only' });

  const { name, address } = req.body;
  const qr = crypto.randomBytes(24).toString('hex');

  const store = await pool.query(
    `insert into stores (firm_id, name, address, qr_code)
     values ((select id from firms where owner_user_id = $1), $2, $3, $4)
     returning *`,
    [req.user.id, name, address, qr]
  );

  res.status(201).json(store.rows[0]);
});

app.get('/stores', authMiddleware, async (req, res) => {
  if (req.user.role !== 'firm') return res.status(403).json({ error: 'Firm only' });

  const stores = await pool.query(
    `select * from stores
     where firm_id = (select id from firms where owner_user_id = $1)`,
    [req.user.id]
  );

  res.json(stores.rows);
});

/* =========================
   SCAN QR (USER)
========================= */
app.post('/scan', authMiddleware, async (req, res) => {
  if (req.user.role !== 'user') return res.status(403).json({ error: 'User only' });

  const { qr } = req.body;

  const result = await pool.query(
    `select s.id store_id, s.name store_name,
            f.id firm_id, f.name firm_name
     from stores s
     join firms f on f.id = s.firm_id
     where s.qr_code = $1`,
    [qr]
  );

  if (!result.rows[0]) return res.status(404).json({ error: 'Invalid QR' });
  res.json(result.rows[0]);
});

/* =========================
   GIVE / TAKE TRANSACTIONS
========================= */
async function runTransaction(fn) {
  try {
    await pool.query('begin');
    const result = await fn();
    await pool.query('commit');
    return result;
  } catch (e) {
    await pool.query('rollback');
    throw e;
  }
}

app.post('/transactions/give', authMiddleware, async (req, res) => {
  if (req.user.role !== 'firm') return res.status(403).json({ error: 'Firm only' });

  const { userId, storeId, amount } = req.body;

  try {
    await runTransaction(async () => {
      const firm = await pool.query(
        'select id, balance from firms where owner_user_id = $1',
        [req.user.id]
      );

      if (firm.rows[0].balance < amount) throw new Error();

      await pool.query(
        'update firms set balance = balance - $1 where id = $2',
        [amount, firm.rows[0].id]
      );

      await pool.query(
        'update user_vouchers set balance = balance + $1 where user_id = $2',
        [amount, userId]
      );

      await pool.query(
        `insert into transactions (firm_id, store_id, user_id, type, amount)
         values ($1, $2, $3, 'GIVE', $4)`,
        [firm.rows[0].id, storeId, userId, amount]
      );
    });

    res.json({ status: 'GIVE OK' });
  } catch {
    res.status(400).json({ error: 'Transaction failed' });
  }
});

app.post('/transactions/take', authMiddleware, async (req, res) => {
  if (req.user.role !== 'firm') return res.status(403).json({ error: 'Firm only' });

  const { userId, storeId, amount } = req.body;

  try {
    await runTransaction(async () => {
      const firm = await pool.query(
        'select id from firms where owner_user_id = $1',
        [req.user.id]
      );

      const user = await pool.query(
        'select balance from user_vouchers where user_id = $1',
        [userId]
      );

      if (user.rows[0].balance < amount) throw new Error();

      await pool.query(
        'update user_vouchers set balance = balance - $1 where user_id = $2',
        [amount, userId]
      );

      await pool.query(
        'update firms set balance = balance + $1 where id = $2',
        [amount, firm.rows[0].id]
      );

      await pool.query(
        `insert into transactions (firm_id, store_id, user_id, type, amount)
         values ($1, $2, $3, 'TAKE', $4)`,
        [firm.rows[0].id, storeId, userId, amount]
      );
    });

    res.json({ status: 'TAKE OK' });
  } catch {
    res.status(400).json({ error: 'Transaction failed' });
  }
});

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log(`AGROV backend running on port ${PORT}`);
});


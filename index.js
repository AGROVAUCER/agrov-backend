console.log('=== INDEX VERSION WITH /ME ROUTE ===');
import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
};

/* =========================
   REGISTER
========================= */
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `insert into users (email, password)
       values ($1, $2)
       returning id, email, role, created_at`,
      [email, hash]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
});

/* =========================
   LOGIN
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
   ME (PROTECTED)
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
   FIRMS (ADMIN CREATE)
========================= */
app.post('/firms', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, pib, address } = req.body;
  if (!name || !pib) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const result = await pool.query(
    `insert into firms (name, pib, address)
     values ($1, $2, $3)
     returning *`,
    [name, pib, address]
  );

  res.status(201).json(result.rows[0]);
});

/* =========================
   USER ↔ FIRM LINK
========================= */
app.post('/firms/:firmId/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  const { firmId, userId } = req.params;

  await pool.query(
    `insert into user_firms (user_id, firm_id)
     values ($1, $2)
     on conflict do nothing`,
    [userId, firmId]
  );

  res.json({ status: 'linked' });
});

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


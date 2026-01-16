
import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

app.use(express.json());

/* HEALTH */
app.get('/health', async (req, res) => {
  try {
    await pool.query('select 1');
    res.json({ status: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'DB ERROR' });
  }
});

/* REGISTER */
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'insert into users (email, password) values ($1, $2) returning id, email, role',
      [email, hash]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
});

/* LOGIN */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const result = await pool.query(
    'select * from users where email = $1',
    [email]
  );

  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


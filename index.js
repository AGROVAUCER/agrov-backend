import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import PDFDocument from 'pdfkit';

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

/* AUTH */
const auth = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h) return res.sendStatus(401);
  try {
    req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.sendStatus(401);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
};

/* HEALTH */
app.get('/health', async (_, res) => {
  await pool.query('select 1');
  res.json({ ok: true });
});

/* LOGIN */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const r = await pool.query('select * from users where email=$1', [email]);
  const u = r.rows[0];
  if (!u || !(await bcrypt.compare(password, u.password))) {
    return res.status(401).json({ error: 'invalid' });
  }
  const token = jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET);
  res.json({ token });
});

/* ME */
app.get('/me', auth, async (req, res) => {
  const r = await pool.query(
    'select id,email,role from users where id=$1',
    [req.user.id]
  );
  res.json(r.rows[0]);
});

/* =========================
   BERZA / PRODUCTS (FIRM)
========================= */
app.post('/products', auth, async (req, res) => {
  if (req.user.role !== 'firm') return res.sendStatus(403);
  const { name, price, unit } = req.body;

  const firm = await pool.query(
    'select id from firms where owner_user_id=$1',
    [req.user.id]
  );

  const p = await pool.query(
    `insert into products (firm_id,name,price,unit)
     values ($1,$2,$3,$4) returning *`,
    [firm.rows[0].id, name, price, unit]
  );

  res.json(p.rows[0]);
});

app.put('/products/:id', auth, async (req, res) => {
  if (req.user.role !== 'firm') return res.sendStatus(403);
  const { price } = req.body;

  const old = await pool.query(
    'select price from products where id=$1',
    [req.params.id]
  );

  await pool.query(
    'update products set price=$1 where id=$2',
    [price, req.params.id]
  );

  await pool.query(
    `insert into price_history (product_id,old_price,new_price)
     values ($1,$2,$3)`,
    [req.params.id, old.rows[0].price, price]
  );

  res.json({ ok: true });
});

app.get('/products', async (_, res) => {
  const r = await pool.query(
    'select p.name,p.price,p.unit,f.name firm from products p join firms f on f.id=p.firm_id'
  );
  res.json(r.rows);
});

/* =========================
   PDF REPORT (FIRM)
========================= */
app.get('/reports/pdf', auth, async (req, res) => {
  if (req.user.role !== 'firm') return res.sendStatus(403);

  const firm = await pool.query(
    'select id,name from firms where owner_user_id=$1',
    [req.user.id]
  );

  const tx = await pool.query(
    'select type,amount,created_at from transactions where firm_id=$1',
    [firm.rows[0].id]
  );

  const doc = new PDFDocument();
  const file = `/tmp/report-${Date.now()}.pdf`;
  doc.pipe(fs.createWriteStream(file));

  doc.fontSize(18).text(`Izveštaj firme: ${firm.rows[0].name}`);
  doc.moveDown();

  tx.rows.forEach(t => {
    doc.fontSize(12).text(`${t.created_at} | ${t.type} | ${t.amount}`);
  });

  doc.end();

  res.download(file);
});

/* =========================
   ADMIN ENDPOINTS
========================= */
app.get('/admin/overview', auth, adminOnly, async (_, res) => {
  const users = await pool.query('select count(*) from users');
  const firms = await pool.query('select count(*) from firms');
  const tx = await pool.query('select count(*) from transactions');

  res.json({
    users: users.rows[0].count,
    firms: firms.rows[0].count,
    transactions: tx.rows[0].count
  });
});

app.get('/admin/logs', auth, adminOnly, async (_, res) => {
  const r = await pool.query(
    'select * from admin_logs order by created_at desc limit 100'
  );
  res.json(r.rows);
});

app.listen(PORT, () => console.log('SERVER UP'));

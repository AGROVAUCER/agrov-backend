
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/login', (req, res) => {
  console.log('LOGIN HIT');
  console.log(req.body);

  res.json({
    ok: true,
    email: req.body.email,
    password: req.body.password,
  });
});

app.listen(PORT, () => {
  console.log('DEBUG LOGIN SERVER UP ON', PORT);
});

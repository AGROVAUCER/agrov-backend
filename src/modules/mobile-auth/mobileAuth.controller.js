import { registerUser, loginUser } from './mobileAuth.service.js';

export async function register(req, res) {
  try {
    const { phone, first_name, last_name, password } = req.body;

    if (!phone || !first_name || !last_name || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const result = await registerUser({
      phone,
      first_name,
      last_name,
      password,
    });

    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const result = await loginUser({ phone, password });

    return res.json(result);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}

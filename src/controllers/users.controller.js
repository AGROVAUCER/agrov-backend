import { getUserByQrService } from '../services/users.service.js'

export async function getUserByQrController(req, res) {
  try {
    const { qr } = req.body || {}
    if (!qr || !String(qr).trim()) {
      return res.status(400).json({ error: 'Missing qr' })
    }

    const user = await getUserByQrService(String(qr))

    return res.json({ data: user })
  } catch (err) {
    if (err?.message === 'User not found') {
      return res.status(404).json({ error: err.message })
    }
    if (err?.message === 'User inactive') {
      return res.status(403).json({ error: err.message })
    }
    return res.status(400).json({ error: err?.message || 'Failed to load user' })
  }
}

import {
  getUserBalance,
  getUserHistory
} from '../services/mobile.service.js'

export async function balance(req, res) {
  try {
    const userId = req.auth.userId

    const result = await getUserBalance(userId)

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Failed to load balance' })
  }
}

export async function history(req, res) {
  try {
    const userId = req.auth.userId
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    const result = await getUserHistory(userId, page, limit)

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Failed to load history' })
  }
}

import {
  getFirmBalance,
  getSystemBalance
} from '../services/balance.service.js'

// firma
export async function getMyBalanceController(req, res) {
  try {
    const firmId = req.auth?.firmId
    const balance = await getFirmBalance(firmId)
    res.json({ success: true, balance })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

// admin – jedna firma
export async function getFirmBalanceAdminController(req, res) {
  try {
    const balance = await getFirmBalance(req.params.id)
    res.json({ success: true, balance })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

// admin – SYSTEM
export async function getSystemBalanceAdminController(req, res) {
  try {
    const rows = await getSystemBalance()
    res.json({ data: rows })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

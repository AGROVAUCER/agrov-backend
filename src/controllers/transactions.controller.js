/**
 * OPERATIVNE TRANSAKCIJE CONTROLLER
 */

import {
  createOperationalTransaction,
  listMyOperationalTransactions,
} from '../services/transactions.service.js'

export async function createOperationalTransactionController(req, res) {
  try {
    const { userId } = req.auth
    const { store_id, user_id, amount, type } = req.body

    const tx = await createOperationalTransaction({
      firmUserId: userId,
      store_id,
      user_id,
      amount,
      type,
    })

    return res.status(201).json({ success: true, transaction: tx })
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message })
  }
}

export async function listMyOperationalTransactionsController(req, res) {
  try {
    const { userId } = req.auth

    const store_id = req.query.store_id ? String(req.query.store_id) : null

    const limitRaw = req.query.limit ? Number(req.query.limit) : 50
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 200)
      : 50

    const from = req.query.from ? String(req.query.from) : null // ISO string
    const to = req.query.to ? String(req.query.to) : null // ISO string

    const items = await listMyOperationalTransactions({
      firmUserId: userId,
      store_id,
      limit,
      from,
      to,
    })

    return res.status(200).json({ success: true, transactions: items })
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message })
  }
}


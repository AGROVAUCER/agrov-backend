import {
  createStore,
  listMyStores,
  approveStore,
} from '../services/stores.service.js'

export async function createStoreController(req, res) {
  try {
    const { userId } = req.auth
    const { name, address, code } = req.body

    const store = await createStore({
      firmUserId: userId,
      name,
      address,
      code,
    })

    return res.status(201).json({ success: true, store })
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message })
  }
}

/**
 * GET /stores/me?limit=20&cursor=...
 * returns { items, nextCursor }
 */
export async function listMyStoresController(req, res) {
  try {
    const { userId } = req.auth
    const limitRaw = req.query.limit ? Number(req.query.limit) : 20
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 20
    const cursor = req.query.cursor ? String(req.query.cursor) : null

    const out = await listMyStores({
      firmUserId: userId,
      limit,
      cursor,
    })

    return res.json(out)
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message })
  }
}

export async function approveStoreController(req, res) {
  try {
    const { id } = req.params
    const store = await approveStore({ storeId: id })
    return res.json({ success: true, store })
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message })
  }
}

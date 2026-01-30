/**
 * BALANCE CONTROLLER
 * - Firma vidi svoje stanje
 * - Admin vidi stanje bilo koje firme
 * - Admin vidi sistemsko stanje (dashboard)
 */

import { getFirmBalance, getSystemBalance } from '../services/balance.service.js'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /balance/me
 * Firma – svoje stanje
 */
export async function getMyBalanceController(req, res) {
  try {
    const { userId } = req.auth

    const { data: firm, error } = await supabase
      .from('firms')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (error || !firm) {
      throw new Error('Firm not found')
    }

    const balance = await getFirmBalance(firm.id)

    return res.status(200).json({
      success: true,
      data: { balance },
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    })
  }
}

/**
 * GET /admin/firms/:id/balance
 * Admin – stanje jedne firme
 */
export async function getFirmBalanceAdminController(req, res) {
  try {
    const { id: firmId } = req.params
    const balance = await getFirmBalance(firmId)

    return res.status(200).json({
      success: true,
      data: { balance },
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    })
  }
}

/**
 * ✅ GET /balance
 * Admin – SISTEMSKO STANJE (dashboard)
 */
export async function getSystemBalanceAdminController(req, res) {
  try {
    // ako već imaš logiku u servisu, koristi je
    if (typeof getSystemBalance === 'function') {
      const balance = await getSystemBalance()
      return res.status(200).json({
        success: true,
        data: balance,
      })
    }

    // fallback: zbir svih firmi (KANONSKI MINIMUM)
    const { data, error } = await supabase
      .from('firms')
      .select('id')

    if (error) throw error

    let total = 0
    for (const firm of data) {
      total += await getFirmBalance(firm.id)
    }

    return res.status(200).json({
      success: true,
      data: { system_balance: total },
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    })
  }
}

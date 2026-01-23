// src/admin/approval.service.js
const db = require('../db/db')

async function approveFirm(firmId) {
  const { data, error } = await db
    .from('firms')
    .update({
      status: 'active',
      approved_at: new Date()
    })
    .eq('id', firmId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) throw error
  return data
}

async function approveStore(storeId) {
  const { data, error } = await db
    .from('stores')
    .update({
      status: 'active',
      approved_at: new Date()
    })
    .eq('id', storeId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) throw error
  return data
}

module.exports = {
  approveFirm,
  approveStore
}

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function parseFiscalQr(rawQr) {
  const value = String(rawQr || '').trim()
  if (!value) throw new Error('Empty QR')

  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error('Invalid fiscal QR format')
  }

  const params = Object.fromEntries(url.searchParams.entries())

  const pib = params.pib || params.tin || params.sellerTin
  const jir = params.jir || params.JIR || params.invoiceId

  if (!pib || !jir) {
    throw new Error('PIB or JIR not found in QR')
  }

  return { pib, jir }
}

export async function validateReceipt({
  rawQr,
  firmId,
  merchantPib
}) {
  const { pib, jir } = parseFiscalQr(rawQr)

  if (pib !== merchantPib) {
    throw new Error('Receipt PIB does not match merchant')
  }

  const { data: existing } = await supabase
    .from('receipts')
    .select('id')
    .eq('jir', jir)
    .maybeSingle()

  if (existing) {
    throw new Error('Receipt already used')
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  const { error } = await supabase
    .from('receipt_tokens')
    .insert({
      token,
      firm_id: firmId,
      pib,
      jir,
      expires_at: expiresAt,
      used: false
    })

  if (error) throw new Error(error.message)

  return { receiptToken: token }
}

export async function quoteReceipt({
  receiptToken,
  firmId,
  amountRsd
}) {
  if (!amountRsd || Number(amountRsd) <= 0) {
    throw new Error('Invalid amount')
  }

  const { data: tokenRow, error } = await supabase
    .from('receipt_tokens')
    .select('*')
    .eq('token', receiptToken)
    .single()

  if (error || !tokenRow) throw new Error('Invalid receipt token')
  if (tokenRow.used) throw new Error('Receipt token already used')
  if (tokenRow.firm_id !== firmId) throw new Error('Invalid firm')
  if (new Date(tokenRow.expires_at) < new Date()) {
    throw new Error('Receipt token expired')
  }

  const percent = 3
  const points = Math.round(Number(amountRsd) * (percent / 100))

  return { percent, points }
}

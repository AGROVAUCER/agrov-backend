import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function giveReceipt({
  receiptToken,
  firmId,
  userId,
  amountRsd
}) {
  if (!amountRsd || Number(amountRsd) <= 0) {
    throw new Error('Invalid amount')
  }

  const { data, error } = await supabase.rpc('give_receipt_atomic', {
    p_token: receiptToken,
    p_firm_id: firmId,
    p_user_id: userId,
    p_amount_rsd: amountRsd
  })

  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)

  return data
}

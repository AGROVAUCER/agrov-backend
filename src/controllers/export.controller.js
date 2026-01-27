import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function exportFirmTransactionsCsv(req, res) {
  const { id } = req.params;

  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('firm_id', id)
    .order('created_at', { ascending: false });

  const header = 'id,firm_id,store_id,user_id,type,source,amount,created_at\n';
  const rows = (data || []).map(t =>
    `${t.id},${t.firm_id},${t.store_id || ''},${t.user_id || ''},${t.type},${t.source},${t.amount},${t.created_at}`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
  res.send(header + rows);
}

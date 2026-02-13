import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Firma dodaje ili menja cenu
export async function upsertMarketPrice(req, res) {
  try {
    const firmId = req.auth.userId; // firma je ulogovana preko Supabase auth
    const { product, price } = req.body;

    if (!product || !price) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // proveri da li je firma aktivna
    const { data: firm } = await supabase
      .from('firms')
      .select('status')
      .eq('id', firmId)
      .maybeSingle();

    if (!firm || firm.status !== 'active') {
      return res.status(403).json({ error: 'Firm not active' });
    }

    const { error } = await supabase
      .from('market_prices')
      .upsert(
        {
          firm_id: firmId,
          product,
          price,
          updated_at: new Date()
        },
        { onConflict: 'firm_id,product' }
      );

    if (error) {
      return res.status(500).json({ error: 'Failed to save price' });
    }

    return res.json({ success: true });

  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

// Mobile app – vidi sve cene aktivnih firmi
export async function getPublicMarketPrices(req, res) {
  try {
    const { data, error } = await supabase
      .from('market_prices')
      .select(`
        id,
        product,
        price,
        currency,
        updated_at,
        firms!inner(name, status)
      `)
      .eq('firms.status', 'active')
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch prices' });
    }

    return res.json(data);

  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

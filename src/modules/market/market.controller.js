import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Firma dodaje ili menja cenu proizvoda
 * Opcija 2 logika:
 * - status se ne proverava
 * - proverava se samo market_enabled
 */
export async function upsertMarketPrice(req, res) {
  try {
    const firmId = req.auth.userId;
    const { product, price } = req.body;

    if (!product || price === undefined) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const { data: firm, error: firmError } = await supabase
      .from('firms')
      .select('market_enabled')
      .eq('id', firmId)
      .maybeSingle();

    if (firmError || !firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }

    if (!firm.market_enabled) {
      return res.status(403).json({ error: 'Market disabled for this firm' });
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

  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

/**
 * Mobile app – javni prikaz berze
 * Prikazuje samo firme gde je market_enabled = true
 */
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
        firms!inner(id, name, market_enabled)
      `)
      .eq('firms.market_enabled', true)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch prices' });
    }

    return res.json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

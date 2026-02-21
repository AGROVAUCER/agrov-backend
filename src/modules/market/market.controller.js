import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Firma dodaje ili menja cenu proizvoda
 * Opcija 2 logika:
 * - status se ne proverava
 * - proverava se samo market_enabled
 * Dodatak:
 * - upisuje snapshot u market_price_history samo kad je cena/currency promenjena
 */
export async function upsertMarketPrice(req, res) {
  try {
    const userId = req.auth.userId
    const { product, price, currency } = req.body

    if (!product || price === undefined) {
      return res.status(400).json({ error: 'Missing fields' })
    }

    const numericPrice = Number(price)
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ error: 'Invalid price' })
    }

    const { data: firm, error: firmError } = await supabase
      .from('firms')
      .select('market_enabled')
      .eq('user_id', userId)
      .maybeSingle()

    if (firmError || !firm) {
      return res.status(404).json({ error: 'Firm not found' })
    }

    if (!firm.market_enabled) {
      return res.status(403).json({ error: 'Market disabled for this firm' })
    }

    // pročitaj trenutnu vrednost da ne spamujemo istoriju istim podatkom
    const { data: existing, error: existingErr } = await supabase
      .from('market_prices')
      .select('price, currency')
      .eq('firm_id', firm?.id)
      .eq('product', product)
      .maybeSingle()

    if (existingErr) {
      return res.status(500).json({ error: 'Failed to read current price' })
    }

    const nextCurrency = String(currency || existing?.currency || 'RSD').toUpperCase()
    const prevPrice = existing?.price === undefined ? undefined : Number(existing.price)
    const prevCurrency = String(existing?.currency || 'RSD').toUpperCase()

    const { error: upsertError } = await supabase
      .from('market_prices')
      .upsert(
        {
          firm_id: firm?.id,
          product,
          price: numericPrice,
          currency: nextCurrency,
          updated_at: new Date(),
        },
        { onConflict: 'firm_id,product' }
      )

    if (upsertError) {
      return res.status(500).json({ error: 'Failed to save price' })
    }

    const changed =
      prevPrice === undefined ||
      Number.isFinite(prevPrice) === false ||
      prevPrice !== numericPrice ||
      prevCurrency !== nextCurrency

    if (changed) {
      // namerno: ako istorija failuje, ne rušimo glavni upsert
      await supabase.from('market_price_history').insert({
        firm_id: firmId,
        product,
        price: numericPrice,
        currency: nextCurrency,
        recorded_at: new Date(),
      })
    }

    return res.json({ success: true })
  } catch {
    return res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Mobile / Web – javni prikaz (trenutne cene)
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
      .order('updated_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch prices' })
    }

    return res.json(data || [])
  } catch {
    return res.status(500).json({ error: 'Server error' })
  }
}

/**
 * Javni endpoint – istorija cena
 * Query:
 * - days (1..180), default 30
 * - product (optional)
 */
export async function getPublicMarketPriceHistory(req, res) {
  try {
    const daysRaw = Number(req.query.days ?? 90)
    const days = Math.max(1, Math.min(180, Number.isFinite(daysRaw) ? daysRaw : 30))
    const product = req.query.product ? String(req.query.product) : null
    const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    let q = supabase
      .from('market_price_history')
      .select(`
        id,
        product,
        price,
        currency,
        recorded_at,
        firms!inner(id, name, market_enabled)
      `)
      .eq('firms.market_enabled', true)
      .gte('recorded_at', sinceIso)
      .order('recorded_at', { ascending: true })

    if (product) q = q.eq('product', product)

    const { data, error } = await q
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch history' })
    }

    return res.json(data || [])
  } catch {
    return res.status(500).json({ error: 'Server error' })
  }
}

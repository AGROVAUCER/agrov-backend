-- ============================================
-- AGROV DATABASE SCHEMA (FINAL / SAFE)
-- ============================================


-- ============================================
-- 1. FIRMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE firm_status AS ENUM ('pending','active','blocked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,

  name TEXT NOT NULL,
  pib TEXT NOT NULL UNIQUE,
  registration_number TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,

  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,

  status firm_status NOT NULL DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT fk_firm_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_firms_user_id ON firms(user_id);
CREATE INDEX IF NOT EXISTS idx_firms_status ON firms(status);


-- ============================================
-- 2. STORES
-- ============================================

DO $$ BEGIN
  CREATE TYPE store_status AS ENUM ('pending','active','blocked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL,

  name TEXT NOT NULL,
  address TEXT,
  code TEXT UNIQUE,

  status store_status NOT NULL DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT fk_store_firm
    FOREIGN KEY (firm_id)
    REFERENCES firms(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_stores_firm_id ON stores(firm_id);
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);


-- ============================================
-- 3. TRANSACTIONS
-- ============================================

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('GIVE','TAKE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_source AS ENUM ('system','operational');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  firm_id UUID NOT NULL,
  store_id UUID,
  user_id UUID,

  type transaction_type NOT NULL,
  source transaction_source NOT NULL DEFAULT 'operational',

  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),

  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT fk_tx_firm
    FOREIGN KEY (firm_id)
    REFERENCES firms(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_tx_store
    FOREIGN KEY (store_id)
    REFERENCES stores(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tx_firm_id ON transactions(firm_id);
CREATE INDEX IF NOT EXISTS idx_tx_store_id ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_tx_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_tx_source ON transactions(source);
CREATE INDEX IF NOT EXISTS idx_tx_created_at ON transactions(created_at);


-- ============================================
-- 4. UPDATED_AT TRIGGER (SHARED)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_firms_updated_at ON firms;
CREATE TRIGGER trigger_firms_updated_at
BEFORE UPDATE ON firms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_stores_updated_at ON stores;
CREATE TRIGGER trigger_stores_updated_at
BEFORE UPDATE ON stores
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

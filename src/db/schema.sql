-- ================================
-- AGROV DATABASE SCHEMA
-- SCOPE: FIRMA PROFIL + ADMIN APPROVE
-- ================================

-- 1. ENUM ZA STATUS FIRME
CREATE TYPE firm_status AS ENUM (
  'pending',
  'active',
  'blocked'
);

-- 2. FIRMS TABELA
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- veza ka auth.users (Supabase)
  user_id UUID NOT NULL UNIQUE,

  -- osnovni podaci
  name TEXT NOT NULL,
  pib TEXT NOT NULL UNIQUE,
  registration_number TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,

  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,

  -- status
  status firm_status NOT NULL DEFAULT 'pending',

  -- audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT fk_firm_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- 3. INDEKSI
CREATE INDEX idx_firms_user_id ON firms(user_id);
CREATE INDEX idx_firms_status ON firms(status);

-- 4. UPDATE TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_firms_updated_at
BEFORE UPDATE ON firms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

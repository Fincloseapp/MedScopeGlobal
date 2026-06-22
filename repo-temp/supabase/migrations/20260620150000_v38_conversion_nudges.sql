-- v38 conversion nudges — AI-refreshed subscription copy
CREATE TABLE IF NOT EXISTS conversion_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot text NOT NULL,
  locale text NOT NULL DEFAULT 'cs',
  eyebrow text NOT NULL,
  headline text NOT NULL,
  body text NOT NULL,
  cta_label text NOT NULL DEFAULT 'Předplatné',
  cta_href text NOT NULL DEFAULT '/predplatne',
  hint text,
  generated_by text NOT NULL DEFAULT 'static',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversion_nudges_slot_active
  ON conversion_nudges (slot, locale, active, created_at DESC);

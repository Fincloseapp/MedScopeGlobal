-- v43 health monitoring + v42 key rotation logs
CREATE TABLE IF NOT EXISTS system_health_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  subsystem TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'info',
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_health_events_type ON system_health_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_events_subsystem ON system_health_events (subsystem, created_at DESC);

CREATE TABLE IF NOT EXISTS v42_key_rotation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL,
  status TEXT NOT NULL,
  age_days INT,
  message TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_v42_key_rotation_log_name ON v42_key_rotation_log (key_name, checked_at DESC);

CREATE TABLE IF NOT EXISTS v44_region_probes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  latency_ms INT,
  status_code INT,
  ok BOOLEAN NOT NULL DEFAULT false,
  error TEXT,
  probed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_v44_region_probes_at ON v44_region_probes (probed_at DESC);

CREATE TABLE IF NOT EXISTS v45_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT NOT NULL,
  latency_ms INT NOT NULL,
  status_code INT,
  slow BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_v45_performance_logs_route ON v45_performance_logs (route, logged_at DESC);

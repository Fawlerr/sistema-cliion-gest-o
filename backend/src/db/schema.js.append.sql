-- Run this SQL to create appointment_links table (since Prisma migrate failed)
CREATE TABLE IF NOT EXISTS appointment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    patient_id UUID,
    service_id INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    used BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    config JSONB,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_appointment_links_token ON appointment_links(token);
CREATE INDEX IF NOT EXISTS idx_appointment_links_created_by ON appointment_links(created_by);
CREATE INDEX IF NOT EXISTS idx_appointment_links_active ON appointment_links(active, used) WHERE active = true AND used = false;


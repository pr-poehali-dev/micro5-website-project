CREATE TABLE t_p13899255_micro5_website_proje.crm_sessions (
  token VARCHAR(64) PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '12 hours'
);

CREATE TABLE t_p13899255_micro5_website_proje.application_notes (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_application ON t_p13899255_micro5_website_proje.application_notes(application_id);
CREATE INDEX idx_applications_status ON t_p13899255_micro5_website_proje.applications(status);

ALTER TABLE t_p13899255_micro5_website_proje.applications ALTER COLUMN status SET DEFAULT 'new';
ALTER TABLE t_p13899255_micro5_website_proje.applications ALTER COLUMN status_text SET DEFAULT 'Принята, ожидает рассмотрения';
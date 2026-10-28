ALTER TABLE t_p13899255_micro5_website_proje.client_documents ADD COLUMN status VARCHAR(12) NOT NULL DEFAULT 'pending';
ALTER TABLE t_p13899255_micro5_website_proje.client_documents ADD COLUMN reject_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE t_p13899255_micro5_website_proje.client_documents ADD COLUMN checked_at TIMESTAMP;

ALTER TABLE t_p13899255_micro5_website_proje.clients ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE t_p13899255_micro5_website_proje.applications ADD COLUMN data_confirm VARCHAR(12) NOT NULL DEFAULT 'none';
ALTER TABLE t_p13899255_micro5_website_proje.applications ADD COLUMN data_confirm_comment TEXT NOT NULL DEFAULT '';

CREATE TABLE t_p13899255_micro5_website_proje.call_log (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL,
  result VARCHAR(20) NOT NULL,
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_call_log_app ON t_p13899255_micro5_website_proje.call_log(application_id);
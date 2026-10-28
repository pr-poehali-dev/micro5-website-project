CREATE TABLE t_p13899255_micro5_website_proje.payments (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  kind VARCHAR(10) NOT NULL,
  amount INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p13899255_micro5_website_proje.client_documents (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  kind VARCHAR(20) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p13899255_micro5_website_proje.notifications (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE t_p13899255_micro5_website_proje.loans ADD COLUMN extended_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE t_p13899255_micro5_website_proje.loans ADD COLUMN contract_url TEXT;

CREATE INDEX idx_payments_client ON t_p13899255_micro5_website_proje.payments(client_id);
CREATE INDEX idx_docs_client ON t_p13899255_micro5_website_proje.client_documents(client_id);
CREATE INDEX idx_notifications_client ON t_p13899255_micro5_website_proje.notifications(client_id);
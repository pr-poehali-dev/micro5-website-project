CREATE TABLE t_p13899255_micro5_website_proje.sign_codes (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  loan_id INTEGER NOT NULL,
  code VARCHAR(8) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sign_codes_loan ON t_p13899255_micro5_website_proje.sign_codes(loan_id);
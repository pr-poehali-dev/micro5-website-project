CREATE TABLE t_p13899255_micro5_website_proje.clients (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  birth_date TEXT NOT NULL DEFAULT '',
  passport_series VARCHAR(10) NOT NULL DEFAULT '',
  passport_number VARCHAR(10) NOT NULL DEFAULT '',
  passport_date TEXT NOT NULL DEFAULT '',
  passport_issuer TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  income TEXT NOT NULL DEFAULT '',
  employment TEXT NOT NULL DEFAULT '',
  card_last4 VARCHAR(4) NOT NULL DEFAULT '',
  card_bank TEXT NOT NULL DEFAULT '',
  docs_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p13899255_micro5_website_proje.sessions (
  token VARCHAR(64) PRIMARY KEY,
  client_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE t_p13899255_micro5_website_proje.applications (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  days INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'processing',
  status_text TEXT NOT NULL DEFAULT 'Проходит проверку',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p13899255_micro5_website_proje.loans (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  application_id INTEGER,
  amount INTEGER NOT NULL,
  return_amount INTEGER NOT NULL,
  days INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL
);

CREATE INDEX idx_applications_client ON t_p13899255_micro5_website_proje.applications(client_id);
CREATE INDEX idx_loans_client ON t_p13899255_micro5_website_proje.loans(client_id);
CREATE INDEX idx_sessions_client ON t_p13899255_micro5_website_proje.sessions(client_id);
CREATE TABLE t_p13899255_micro5_website_proje.video_checks (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  auto_ok BOOLEAN NOT NULL DEFAULT TRUE,
  auto_issues TEXT NOT NULL DEFAULT '',
  status VARCHAR(12) NOT NULL DEFAULT 'pending',
  reject_reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  checked_at TIMESTAMP
);

CREATE INDEX idx_video_checks_client ON t_p13899255_micro5_website_proje.video_checks(client_id);
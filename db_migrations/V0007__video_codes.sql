CREATE TABLE t_p13899255_micro5_website_proje.video_codes (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  code VARCHAR(8) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_video_codes_client ON t_p13899255_micro5_website_proje.video_codes(client_id);

ALTER TABLE t_p13899255_micro5_website_proje.video_checks ADD COLUMN code VARCHAR(8) NOT NULL DEFAULT '';
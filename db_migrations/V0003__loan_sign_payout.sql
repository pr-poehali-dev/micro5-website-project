ALTER TABLE t_p13899255_micro5_website_proje.loans ADD COLUMN signed_at TIMESTAMP;
ALTER TABLE t_p13899255_micro5_website_proje.loans ADD COLUMN paid_out_at TIMESTAMP;
ALTER TABLE t_p13899255_micro5_website_proje.loans ALTER COLUMN status SET DEFAULT 'awaiting_sign';
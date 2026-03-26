ALTER TABLE public.email_send_state 
ADD COLUMN IF NOT EXISTS bulk_send_offset integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS bulk_send_csv_url text,
ADD COLUMN IF NOT EXISTS bulk_send_active boolean NOT NULL DEFAULT false;
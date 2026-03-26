
ALTER TABLE public.progress_tracking 
ADD COLUMN checked_meals TEXT[] NOT NULL DEFAULT '{}';

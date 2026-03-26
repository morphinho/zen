
-- Add subscription_type to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS subscription_type text NOT NULL DEFAULT 'ZENLIFE';

-- Create pilates_classes table
CREATE TABLE public.pilates_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  video_url text DEFAULT NULL,
  duration text NOT NULL DEFAULT '15 min',
  order_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create pilates_progress table
CREATE TABLE public.pilates_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  class_id uuid NOT NULL REFERENCES public.pilates_classes(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, class_id)
);

-- Enable RLS
ALTER TABLE public.pilates_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilates_progress ENABLE ROW LEVEL SECURITY;

-- Pilates classes: readable by all authenticated users
CREATE POLICY "Authenticated users can read pilates classes"
ON public.pilates_classes FOR SELECT TO authenticated
USING (true);

-- Pilates progress: users can CRUD own data
CREATE POLICY "Users can read own pilates progress"
ON public.pilates_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pilates progress"
ON public.pilates_progress FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pilates progress"
ON public.pilates_progress FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

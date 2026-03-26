
CREATE TABLE public.water_intake (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_ml INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own water" ON public.water_intake FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own water" ON public.water_intake FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Add water goal to profiles
ALTER TABLE public.profiles ADD COLUMN water_goal_ml INTEGER NOT NULL DEFAULT 2000;

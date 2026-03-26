
-- mood_checkins table
CREATE TABLE public.mood_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mood TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own mood" ON public.mood_checkins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own mood" ON public.mood_checkins FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- body_progress table
CREATE TABLE public.body_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  weight TEXT NOT NULL DEFAULT '',
  waist TEXT NOT NULL DEFAULT '',
  hip TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.body_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own body progress" ON public.body_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own body progress" ON public.body_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- daily_habits table
CREATE TABLE public.daily_habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  habit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_class BOOLEAN NOT NULL DEFAULT false,
  drank_water BOOLEAN NOT NULL DEFAULT false,
  ate_well BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, habit_date)
);
ALTER TABLE public.daily_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own habits" ON public.daily_habits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own habits" ON public.daily_habits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON public.daily_habits FOR UPDATE TO authenticated USING (auth.uid() = user_id);

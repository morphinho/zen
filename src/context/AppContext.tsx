import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface QuestionnaireData {
  age: string;
  height: string;
  current_weight: string;
  desired_weight: string;
  goal: string;
  activity_level: string;
  restrictions: string[];
  food_preferences: string[];
  difficulty_level: string;
}

export interface MealItem {
  food: string;
  quantity: string;
  calories: number;
}

export interface Meal {
  meal_name: string;
  emoji: string;
  items: MealItem[];
}

export interface WeeklyVariation {
  variation_name: string;
  meals: Meal[];
}

export interface Recipe {
  title: string;
  emoji: string;
  category: string;
  time: string;
  calories: number;
  servings: number;
  difficulty: string;
  ingredients: { name: string; quantity: string }[];
  steps: string[];
  tips: string;
}

export interface MealPlanData {
  daily_calories: number;
  daily_plan: Meal[];
  weekly_variations: WeeklyVariation[];
  recipes: Recipe[];
  nutritional_tip: string;
}

export interface ProgressData {
  current_weight: string;
  calories_consumed_today: number;
  streak_days: number;
  last_activity_date: string | null;
  checked_meals: string[];
}

interface AppState {
  questionnaire: QuestionnaireData | null;
  mealPlan: MealPlanData | null;
  progress: ProgressData | null;
  userName: string;
  hasCompletedOnboarding: boolean;
  loadingData: boolean;
  mealPlanCreatedAt: string | null;
  setQuestionnaire: (data: QuestionnaireData) => Promise<void>;
  setMealPlan: (plan: MealPlanData) => Promise<void>;
  updateProgress: (data: Partial<ProgressData>) => Promise<void>;
  toggleMealChecked: (mealName: string, mealCalories: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [questionnaire, setQuestionnaireState] = useState<QuestionnaireData | null>(null);
  const [mealPlan, setMealPlanState] = useState<MealPlanData | null>(null);
  const [progress, setProgressState] = useState<ProgressData | null>(null);
  const [userName, setUserName] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [mealPlanCreatedAt, setMealPlanCreatedAt] = useState<string | null>(null);

  const hasInitiallyLoaded = useRef(false);

  const refreshData = async () => {
    if (!user) {
      setLoadingData(false);
      return;
    }
    // Only show loading spinner on initial load, not on token refreshes
    if (!hasInitiallyLoaded.current) {
      setLoadingData(true);
    }
    try {
      // Load profile
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();
      if (profile) setUserName(profile.name);

      // Load questionnaire
      const { data: qData } = await (supabase as any)
        .from("questionnaire_responses")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (qData) {
        setQuestionnaireState({
          age: qData.age,
          height: qData.height,
          current_weight: qData.current_weight,
          desired_weight: qData.desired_weight,
          goal: qData.goal,
          activity_level: qData.activity_level,
          restrictions: qData.restrictions || [],
          food_preferences: qData.food_preferences || [],
          difficulty_level: qData.difficulty_level,
        });
      }

      // Load latest meal plan
      const { data: planData } = await (supabase as any)
        .from("meal_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (planData) {
        setMealPlanState(planData.plan_data as MealPlanData);
        setMealPlanCreatedAt(planData.created_at);
      }

      // Load progress tracking
      const { data: progressData } = await (supabase as any)
        .from("progress_tracking")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (progressData) {
        const today = new Date().toISOString().split("T")[0];
        const lastDate = progressData.last_activity_date;
        
        if (lastDate && lastDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          const newStreak = lastDate === yesterdayStr ? progressData.streak_days : 0;
          
          await (supabase as any)
            .from("progress_tracking")
            .update({ 
              calories_consumed_today: 0, 
              streak_days: newStreak,
              checked_meals: [],
              updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id);
          
          setProgressState({
            current_weight: progressData.current_weight,
            calories_consumed_today: 0,
            streak_days: newStreak,
            last_activity_date: lastDate,
            checked_meals: [],
          });
        } else {
          setProgressState({
            current_weight: progressData.current_weight,
            calories_consumed_today: progressData.calories_consumed_today,
            streak_days: progressData.streak_days,
            last_activity_date: progressData.last_activity_date,
            checked_meals: progressData.checked_meals || [],
          });
        }
      }
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoadingData(false);
      hasInitiallyLoaded.current = true;
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const setQuestionnaire = async (data: QuestionnaireData) => {
    if (!user) return;
    setQuestionnaireState(data);
    await (supabase as any).from("questionnaire_responses").upsert({
      user_id: user.id,
      ...data,
    }, { onConflict: "user_id" });
  };

  const setMealPlan = async (plan: MealPlanData) => {
    if (!user) return;
    setMealPlanState(plan);
    const now = new Date().toISOString();
    setMealPlanCreatedAt(now);
    
    // Save plan
    await (supabase as any).from("meal_plans").insert({
      user_id: user.id,
      plan_data: plan,
      weekly_variations: plan.weekly_variations,
    });
    // Save recipes
    if (plan.recipes?.length > 0) {
      await (supabase as any).from("recipes").insert({
        user_id: user.id,
        recipes_data: plan.recipes,
      });
    }
    
    // Initialize progress tracking if not exists
    const today = new Date().toISOString().split("T")[0];
    await (supabase as any).from("progress_tracking").upsert({
      user_id: user.id,
      current_weight: questionnaire?.current_weight || "",
      calories_consumed_today: 0,
      streak_days: 1,
      last_activity_date: today,
      checked_meals: [],
    }, { onConflict: "user_id" });
    
    setProgressState({
      current_weight: questionnaire?.current_weight || "",
      calories_consumed_today: 0,
      streak_days: 1,
      last_activity_date: today,
      checked_meals: [],
    });
  };

  const updateProgress = async (data: Partial<ProgressData>) => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const updated = {
      ...progress,
      ...data,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    };
    
    // If user is active today and wasn't before, increment streak
    if (progress?.last_activity_date !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      if (progress?.last_activity_date === yesterdayStr) {
        updated.streak_days = (progress?.streak_days || 0) + 1;
      } else if (!progress?.last_activity_date) {
        updated.streak_days = 1;
      }
    }
    
    await (supabase as any).from("progress_tracking").upsert({
      user_id: user.id,
      ...updated,
    }, { onConflict: "user_id" });
    
    setProgressState(updated as ProgressData);
  };

  const toggleMealChecked = async (mealName: string, mealCalories: number) => {
    if (!user || !progress) return;
    const checked = progress.checked_meals || [];
    const isChecked = checked.includes(mealName);
    const newChecked = isChecked
      ? checked.filter(m => m !== mealName)
      : [...checked, mealName];
    
    const newCalories = isChecked
      ? Math.max(0, progress.calories_consumed_today - mealCalories)
      : progress.calories_consumed_today + mealCalories;
    
    await updateProgress({
      checked_meals: newChecked,
      calories_consumed_today: newCalories,
    });
  };

  return (
    <AppContext.Provider
      value={{
        questionnaire,
        mealPlan,
        progress,
        userName,
        hasCompletedOnboarding: questionnaire !== null && mealPlan !== null,
        loadingData,
        mealPlanCreatedAt,
        setQuestionnaire,
        setMealPlan,
        updateProgress,
        toggleMealChecked,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

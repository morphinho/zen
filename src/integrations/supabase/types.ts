export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      body_progress: {
        Row: {
          created_at: string
          hip: string
          id: string
          user_id: string
          waist: string
          weight: string
        }
        Insert: {
          created_at?: string
          hip?: string
          id?: string
          user_id: string
          waist?: string
          weight?: string
        }
        Update: {
          created_at?: string
          hip?: string
          id?: string
          user_id?: string
          waist?: string
          weight?: string
        }
        Relationships: []
      }
      daily_habits: {
        Row: {
          ate_well: boolean
          completed_class: boolean
          created_at: string
          drank_water: boolean
          habit_date: string
          id: string
          user_id: string
        }
        Insert: {
          ate_well?: boolean
          completed_class?: boolean
          created_at?: string
          drank_water?: boolean
          habit_date?: string
          id?: string
          user_id: string
        }
        Update: {
          ate_well?: boolean
          completed_class?: boolean
          created_at?: string
          drank_water?: boolean
          habit_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          bulk_send_active: boolean
          bulk_send_csv_url: string | null
          bulk_send_offset: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          bulk_send_active?: boolean
          bulk_send_csv_url?: string | null
          bulk_send_offset?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          bulk_send_active?: boolean
          bulk_send_csv_url?: string | null
          bulk_send_offset?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          created_at: string
          id: string
          plan_data: Json
          user_id: string
          weekly_variations: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          plan_data: Json
          user_id: string
          weekly_variations?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          plan_data?: Json
          user_id?: string
          weekly_variations?: Json | null
        }
        Relationships: []
      }
      mood_checkins: {
        Row: {
          created_at: string
          id: string
          mood: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood?: string
          user_id?: string
        }
        Relationships: []
      }
      pilates_classes: {
        Row: {
          created_at: string
          day_number: number
          description: string
          duration: string
          id: string
          order_index: number
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          day_number: number
          description?: string
          duration?: string
          id?: string
          order_index: number
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          day_number?: number
          description?: string
          duration?: string
          id?: string
          order_index?: number
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      pilates_progress: {
        Row: {
          class_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          class_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          class_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pilates_progress_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "pilates_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          needs_activation: boolean
          water_goal_ml: number
        }
        Insert: {
          created_at?: string
          email?: string
          id: string
          name?: string
          needs_activation?: boolean
          water_goal_ml?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          needs_activation?: boolean
          water_goal_ml?: number
        }
        Relationships: []
      }
      progress_tracking: {
        Row: {
          calories_consumed_today: number
          checked_meals: string[]
          created_at: string
          current_weight: string
          id: string
          last_activity_date: string | null
          streak_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          calories_consumed_today?: number
          checked_meals?: string[]
          created_at?: string
          current_weight?: string
          id?: string
          last_activity_date?: string | null
          streak_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          calories_consumed_today?: number
          checked_meals?: string[]
          created_at?: string
          current_weight?: string
          id?: string
          last_activity_date?: string | null
          streak_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          activity_level: string
          age: string
          created_at: string
          current_weight: string
          desired_weight: string
          difficulty_level: string
          food_preferences: string[] | null
          goal: string
          height: string
          id: string
          restrictions: string[] | null
          user_id: string
        }
        Insert: {
          activity_level: string
          age: string
          created_at?: string
          current_weight: string
          desired_weight: string
          difficulty_level: string
          food_preferences?: string[] | null
          goal: string
          height: string
          id?: string
          restrictions?: string[] | null
          user_id: string
        }
        Update: {
          activity_level?: string
          age?: string
          created_at?: string
          current_weight?: string
          desired_weight?: string
          difficulty_level?: string
          food_preferences?: string[] | null
          goal?: string
          height?: string
          id?: string
          restrictions?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          created_at: string
          id: string
          recipes_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipes_data: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipes_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          hotmart_subscription_id: string | null
          id: string
          next_charge_date: string | null
          plan_id: number | null
          plan_name: string | null
          product_id: number | null
          status: string
          subscriber_code: string | null
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hotmart_subscription_id?: string | null
          id?: string
          next_charge_date?: string | null
          plan_id?: number | null
          plan_name?: string | null
          product_id?: number | null
          status?: string
          subscriber_code?: string | null
          subscription_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hotmart_subscription_id?: string | null
          id?: string
          next_charge_date?: string | null
          plan_id?: number | null
          plan_name?: string | null
          product_id?: number | null
          status?: string
          subscriber_code?: string | null
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      water_intake: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          event_id: string | null
          event_type: string | null
          id: string
          payload: Json | null
          processed: boolean
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          event_type?: string | null
          id?: string
          payload?: Json | null
          processed?: boolean
        }
        Update: {
          created_at?: string
          event_id?: string | null
          event_type?: string | null
          id?: string
          payload?: Json | null
          processed?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

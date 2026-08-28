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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      country_time_profiles: {
        Row: {
          best_call_hours: Json
          best_contact_days: number[]
          best_email_hours: Json
          best_whatsapp_hours: Json
          business_hours_end: string
          business_hours_start: string
          country_code: string
          country_name: string
          created_at: string
          cultural_notes: string | null
          data_confidence: string
          holidays: Json
          lunch_end: string | null
          lunch_start: string | null
          peak_hours: Json
          timezone: string
          utc_offset: string | null
          working_days: number[]
        }
        Insert: {
          best_call_hours?: Json
          best_contact_days?: number[]
          best_email_hours?: Json
          best_whatsapp_hours?: Json
          business_hours_end?: string
          business_hours_start?: string
          country_code: string
          country_name: string
          created_at?: string
          cultural_notes?: string | null
          data_confidence?: string
          holidays?: Json
          lunch_end?: string | null
          lunch_start?: string | null
          peak_hours?: Json
          timezone: string
          utc_offset?: string | null
          working_days?: number[]
        }
        Update: {
          best_call_hours?: Json
          best_contact_days?: number[]
          best_email_hours?: Json
          best_whatsapp_hours?: Json
          business_hours_end?: string
          business_hours_start?: string
          country_code?: string
          country_name?: string
          created_at?: string
          cultural_notes?: string | null
          data_confidence?: string
          holidays?: Json
          lunch_end?: string | null
          lunch_start?: string | null
          peak_hours?: Json
          timezone?: string
          utc_offset?: string | null
          working_days?: number[]
        }
        Relationships: []
      }
      leads: {
        Row: {
          city: string | null
          company: string
          country_code: string
          created_at: string
          email: string | null
          id: string
          linkedin: string | null
          name: string
          niche: string
          note: string | null
          phone: string | null
          response_rate: number | null
          role: string | null
          run_id: string | null
          search_query: string | null
          source: string
          website: string | null
        }
        Insert: {
          city?: string | null
          company: string
          country_code: string
          created_at?: string
          email?: string | null
          id?: string
          linkedin?: string | null
          name: string
          niche: string
          note?: string | null
          phone?: string | null
          response_rate?: number | null
          role?: string | null
          run_id?: string | null
          search_query?: string | null
          source?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          company?: string
          country_code?: string
          created_at?: string
          email?: string | null
          id?: string
          linkedin?: string | null
          name?: string
          niche?: string
          note?: string | null
          phone?: string | null
          response_rate?: number | null
          role?: string | null
          run_id?: string | null
          search_query?: string | null
          source?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "prospect_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_runs: {
        Row: {
          country_codes: string[]
          created_at: string
          found: number
          id: string
          niche: string
          notes: string | null
          requested: number
          status: string
        }
        Insert: {
          country_codes?: string[]
          created_at?: string
          found?: number
          id?: string
          niche: string
          notes?: string | null
          requested?: number
          status?: string
        }
        Update: {
          country_codes?: string[]
          created_at?: string
          found?: number
          id?: string
          niche?: string
          notes?: string | null
          requested?: number
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

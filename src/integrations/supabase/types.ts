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
      client_feedback: {
        Row: {
          client_email: string | null
          client_name: string | null
          created_at: string
          feedback_text: string
          id: string
          is_read: boolean
          preview_id: string
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          feedback_text: string
          id?: string
          is_read?: boolean
          preview_id: string
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          feedback_text?: string
          id?: string
          is_read?: boolean
          preview_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_feedback_preview_id_fkey"
            columns: ["preview_id"]
            isOneToOne: false
            referencedRelation: "client_previews"
            referencedColumns: ["id"]
          },
        ]
      }
      client_previews: {
        Row: {
          brand_colors: Json | null
          client_name: string
          created_at: string
          id: string
          original_url: string
          processed_schema: Json | null
          scraped_content: Json | null
          slug: string
          status: Database["public"]["Enums"]["preview_status"]
          template_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_colors?: Json | null
          client_name: string
          created_at?: string
          id?: string
          original_url: string
          processed_schema?: Json | null
          scraped_content?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["preview_status"]
          template_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_colors?: Json | null
          client_name?: string
          created_at?: string
          id?: string
          original_url?: string
          processed_schema?: Json | null
          scraped_content?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["preview_status"]
          template_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      preview_visits: {
        Row: {
          city: string | null
          country: string | null
          device_type: string
          id: string
          ip_hash: string | null
          preview_id: string
          referrer: string | null
          session_duration: number | null
          user_agent: string | null
          visited_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          device_type?: string
          id?: string
          ip_hash?: string | null
          preview_id: string
          referrer?: string | null
          session_duration?: number | null
          user_agent?: string | null
          visited_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          device_type?: string
          id?: string
          ip_hash?: string | null
          preview_id?: string
          referrer?: string | null
          session_duration?: number | null
          user_agent?: string | null
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "preview_visits_preview_id_fkey"
            columns: ["preview_id"]
            isOneToOne: false
            referencedRelation: "client_previews"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_name: string | null
          created_at: string
          full_name: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          public_email: string | null
          show_branding: boolean | null
          tagline: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          public_email?: string | null
          show_branding?: boolean | null
          tagline?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          public_email?: string | null
          show_branding?: boolean | null
          tagline?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
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
      preview_status: "draft" | "sent" | "feedback_received"
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
    Enums: {
      preview_status: ["draft", "sent", "feedback_received"],
    },
  },
} as const

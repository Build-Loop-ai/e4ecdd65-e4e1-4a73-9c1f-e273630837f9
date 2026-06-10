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
      demo_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          preview_slug: string | null
          url_submitted: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          preview_slug?: string | null
          url_submitted: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          preview_slug?: string | null
          url_submitted?: string
        }
        Relationships: []
      }
      email_connections: {
        Row: {
          access_token: string
          created_at: string | null
          daily_send_limit: number | null
          deliverability_score: number | null
          dns_score: number | null
          email_address: string
          emails_sent_today: number | null
          id: string
          is_active: boolean | null
          last_send_count_reset: string | null
          last_warmy_sync: string | null
          placement_score: number | null
          provider: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
          warmup_started_at: string | null
          warmy_mailbox_id: number | null
          warmy_state: string | null
          warmy_temperature: number | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          daily_send_limit?: number | null
          deliverability_score?: number | null
          dns_score?: number | null
          email_address: string
          emails_sent_today?: number | null
          id?: string
          is_active?: boolean | null
          last_send_count_reset?: string | null
          last_warmy_sync?: string | null
          placement_score?: number | null
          provider: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
          warmup_started_at?: string | null
          warmy_mailbox_id?: number | null
          warmy_state?: string | null
          warmy_temperature?: number | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          daily_send_limit?: number | null
          deliverability_score?: number | null
          dns_score?: number | null
          email_address?: string
          emails_sent_today?: number | null
          id?: string
          is_active?: boolean | null
          last_send_count_reset?: string | null
          last_warmy_sync?: string | null
          placement_score?: number | null
          provider?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
          warmup_started_at?: string | null
          warmy_mailbox_id?: number | null
          warmy_state?: string | null
          warmy_temperature?: number | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body_html: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body_html?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          business_name: string
          category: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          phone: string | null
          preview_id: string | null
          rating: number | null
          source_query: string
          status: Database["public"]["Enums"]["lead_status"]
          user_id: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          category?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          preview_id?: string | null
          rating?: number | null
          source_query: string
          status?: Database["public"]["Enums"]["lead_status"]
          user_id: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          category?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          preview_id?: string | null
          rating?: number | null
          source_query?: string
          status?: Database["public"]["Enums"]["lead_status"]
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_preview_id_fkey"
            columns: ["preview_id"]
            isOneToOne: false
            referencedRelation: "client_previews"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_emails: {
        Row: {
          created_at: string
          id: string
          lead_id: string | null
          opened_at: string | null
          preview_id: string
          recipient_email: string
          recipient_name: string | null
          sent_at: string
          status: Database["public"]["Enums"]["email_status"]
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id?: string | null
          opened_at?: string | null
          preview_id: string
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string
          status?: Database["public"]["Enums"]["email_status"]
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string | null
          opened_at?: string | null
          preview_id?: string
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string
          status?: Database["public"]["Enums"]["email_status"]
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_emails_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_emails_preview_id_fkey"
            columns: ["preview_id"]
            isOneToOne: false
            referencedRelation: "client_previews"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_settings: {
        Row: {
          auto_send_enabled: boolean
          created_at: string
          daily_cap: number
          followup_enabled: boolean
          id: string
          send_window_end: number
          send_window_start: number
          tone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_send_enabled?: boolean
          created_at?: string
          daily_cap?: number
          followup_enabled?: boolean
          id?: string
          send_window_end?: number
          send_window_start?: number
          tone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_send_enabled?: boolean
          created_at?: string
          daily_cap?: number
          followup_enabled?: boolean
          id?: string
          send_window_end?: number
          send_window_start?: number
          tone?: string
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
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          emails_used: number
          id: string
          pitches_used: number
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          emails_used?: number
          id?: string
          pitches_used?: number
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          emails_used?: number
          id?: string
          pitches_used?: number
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_pitch_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      increment_email_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      email_status: "sent" | "opened" | "clicked" | "bounced"
      lead_status: "new" | "pitched" | "converted"
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
      app_role: ["admin", "user"],
      email_status: ["sent", "opened", "clicked", "bounced"],
      lead_status: ["new", "pitched", "converted"],
      preview_status: ["draft", "sent", "feedback_received"],
    },
  },
} as const

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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blocked_venues: {
        Row: {
          blocked_at: string
          id: string
          participant_id: string
          venue_id: string
          venue_name: string
        }
        Insert: {
          blocked_at?: string
          id: string
          participant_id: string
          venue_id: string
          venue_name: string
        }
        Update: {
          blocked_at?: string
          id?: string
          participant_id?: string
          venue_id?: string
          venue_name?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          avatar: string | null
          created_at: string
          id: string
          is_host: boolean | null
          is_ready: boolean
          joined_at: string | null
          last_active: string | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          location_type: string | null
          name: string
          session_id: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          id: string
          is_host?: boolean | null
          is_ready?: boolean
          joined_at?: string | null
          last_active?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_type?: string | null
          name: string
          session_id: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          id?: string
          is_host?: boolean | null
          is_ready?: boolean
          joined_at?: string | null
          last_active?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_type?: string | null
          name?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_history: {
        Row: {
          completed_at: string
          id: string
          matched_venue_address: string | null
          matched_venue_id: string | null
          matched_venue_lat: number | null
          matched_venue_lng: number | null
          matched_venue_name: string | null
          matched_venue_photo_url: string | null
          matched_venue_rating: number | null
          participant_id: string
          participant_names: string[] | null
          session_id: string
        }
        Insert: {
          completed_at?: string
          id: string
          matched_venue_address?: string | null
          matched_venue_id?: string | null
          matched_venue_lat?: number | null
          matched_venue_lng?: number | null
          matched_venue_name?: string | null
          matched_venue_photo_url?: string | null
          matched_venue_rating?: number | null
          participant_id: string
          participant_names?: string[] | null
          session_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          matched_venue_address?: string | null
          matched_venue_id?: string | null
          matched_venue_lat?: number | null
          matched_venue_lng?: number | null
          matched_venue_name?: string | null
          matched_venue_photo_url?: string | null
          matched_venue_rating?: number | null
          participant_id?: string
          participant_names?: string[] | null
          session_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          host_id: string | null
          id: string
          is_locked: boolean | null
          matched_venue_id: string | null
          max_participants: number | null
          midpoint_mode: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          host_id?: string | null
          id: string
          is_locked?: boolean | null
          matched_venue_id?: string | null
          max_participants?: number | null
          midpoint_mode?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          host_id?: string | null
          id?: string
          is_locked?: boolean | null
          matched_venue_id?: string | null
          max_participants?: number | null
          midpoint_mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      venue_reviews: {
        Row: {
          created_at: string
          id: string
          is_blocked: boolean
          participant_id: string
          rating: number
          review_text: string | null
          session_history_id: string
          updated_at: string
          venue_id: string
          venue_name: string
        }
        Insert: {
          created_at?: string
          id: string
          is_blocked?: boolean
          participant_id: string
          rating: number
          review_text?: string | null
          session_history_id: string
          updated_at?: string
          venue_id: string
          venue_name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_blocked?: boolean
          participant_id?: string
          rating?: number
          review_text?: string | null
          session_history_id?: string
          updated_at?: string
          venue_id?: string
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_reviews_session_history_id_fkey"
            columns: ["session_history_id"]
            isOneToOne: false
            referencedRelation: "session_history"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string
          category: string | null
          created_at: string
          distance: number | null
          id: string
          lat: number
          lng: number
          name: string
          photo_url: string | null
          price_level: number | null
          rating: number | null
          session_id: string
          types: string[] | null
        }
        Insert: {
          address: string
          category?: string | null
          created_at?: string
          distance?: number | null
          id: string
          lat: number
          lng: number
          name: string
          photo_url?: string | null
          price_level?: number | null
          rating?: number | null
          session_id: string
          types?: string[] | null
        }
        Update: {
          address?: string
          category?: string | null
          created_at?: string
          distance?: number | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          photo_url?: string | null
          price_level?: number | null
          rating?: number | null
          session_id?: string
          types?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          session_id: string
          venue_id: string
          vote: string
        }
        Insert: {
          created_at?: string
          id: string
          participant_id: string
          session_id: string
          venue_id: string
          vote: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          session_id?: string
          venue_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
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

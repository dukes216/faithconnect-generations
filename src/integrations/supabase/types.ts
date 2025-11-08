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
      churches: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          denomination: string | null
          id: string
          location: string | null
          name: string
          namespace: string
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          denomination?: string | null
          id?: string
          location?: string | null
          name: string
          namespace: string
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          denomination?: string | null
          id?: string
          location?: string | null
          name?: string
          namespace?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      life_attributes: {
        Row: {
          created_at: string | null
          custom_notes: string | null
          has_children: boolean | null
          id: string
          is_married: boolean | null
          is_retired: boolean | null
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          custom_notes?: string | null
          has_children?: boolean | null
          id?: string
          is_married?: boolean | null
          is_retired?: boolean | null
          profile_id: string
        }
        Update: {
          created_at?: string | null
          custom_notes?: string | null
          has_children?: boolean | null
          id?: string
          is_married?: boolean | null
          is_retired?: boolean | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_attributes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          admin_notes: string | null
          church_id: string
          completed_at: string | null
          created_at: string | null
          created_by_admin: boolean | null
          id: string
          match_reasons: string[] | null
          match_score: number | null
          mentee_profile_id: string
          mentor_profile_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["match_status"] | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          church_id: string
          completed_at?: string | null
          created_at?: string | null
          created_by_admin?: boolean | null
          id?: string
          match_reasons?: string[] | null
          match_score?: number | null
          mentee_profile_id: string
          mentor_profile_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          church_id?: string
          completed_at?: string | null
          created_at?: string | null
          created_by_admin?: boolean | null
          id?: string
          match_reasons?: string[] | null
          match_score?: number | null
          mentee_profile_id?: string
          mentor_profile_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_mentee_profile_id_fkey"
            columns: ["mentee_profile_id"]
            isOneToOne: false
            referencedRelation: "mentee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_mentor_profile_id_fkey"
            columns: ["mentor_profile_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentee_profiles: {
        Row: {
          created_at: string | null
          goals: string | null
          id: string
          meeting_preference:
            | Database["public"]["Enums"]["meeting_preference"]
            | null
          preferred_mentor_age_range: string | null
          preferred_mentor_gender: string | null
          profile_id: string
          spiritual_level: Database["public"]["Enums"]["spiritual_level"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          goals?: string | null
          id?: string
          meeting_preference?:
            | Database["public"]["Enums"]["meeting_preference"]
            | null
          preferred_mentor_age_range?: string | null
          preferred_mentor_gender?: string | null
          profile_id: string
          spiritual_level?:
            | Database["public"]["Enums"]["spiritual_level"]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          goals?: string | null
          id?: string
          meeting_preference?:
            | Database["public"]["Enums"]["meeting_preference"]
            | null
          preferred_mentor_age_range?: string | null
          preferred_mentor_gender?: string | null
          profile_id?: string
          spiritual_level?:
            | Database["public"]["Enums"]["spiritual_level"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentee_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentee_topics: {
        Row: {
          mentee_profile_id: string
          topic_id: string
        }
        Insert: {
          mentee_profile_id: string
          topic_id: string
        }
        Update: {
          mentee_profile_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentee_topics_mentee_profile_id_fkey"
            columns: ["mentee_profile_id"]
            isOneToOne: false
            referencedRelation: "mentee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentee_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_profiles: {
        Row: {
          cadence_description: string | null
          created_at: string | null
          experience_years: number | null
          hours_per_week: number | null
          id: string
          is_available: boolean | null
          max_mentees: number | null
          meeting_preference:
            | Database["public"]["Enums"]["meeting_preference"]
            | null
          ministry_area: string | null
          profile_id: string
          spiritual_level: Database["public"]["Enums"]["spiritual_level"] | null
          updated_at: string | null
        }
        Insert: {
          cadence_description?: string | null
          created_at?: string | null
          experience_years?: number | null
          hours_per_week?: number | null
          id?: string
          is_available?: boolean | null
          max_mentees?: number | null
          meeting_preference?:
            | Database["public"]["Enums"]["meeting_preference"]
            | null
          ministry_area?: string | null
          profile_id: string
          spiritual_level?:
            | Database["public"]["Enums"]["spiritual_level"]
            | null
          updated_at?: string | null
        }
        Update: {
          cadence_description?: string | null
          created_at?: string | null
          experience_years?: number | null
          hours_per_week?: number | null
          id?: string
          is_available?: boolean | null
          max_mentees?: number | null
          meeting_preference?:
            | Database["public"]["Enums"]["meeting_preference"]
            | null
          ministry_area?: string | null
          profile_id?: string
          spiritual_level?:
            | Database["public"]["Enums"]["spiritual_level"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_topics: {
        Row: {
          mentor_profile_id: string
          topic_id: string
        }
        Insert: {
          mentor_profile_id: string
          topic_id: string
        }
        Update: {
          mentor_profile_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_topics_mentor_profile_id_fkey"
            columns: ["mentor_profile_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_attributes: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          profession: string | null
          profile_id: string
          skills: string[] | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          profession?: string | null
          profile_id: string
          skills?: string[] | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          profession?: string | null
          profile_id?: string
          skills?: string[] | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_attributes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          church_id: string
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          church_id: string
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          church_id?: string
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          church_id: string
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          church_id: string
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          church_id?: string
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_church_id: { Args: { _user_id: string }; Returns: string }
      has_role_in_church: {
        Args: {
          _church_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "mentor" | "mentee"
      match_status: "pending" | "accepted" | "active" | "completed" | "declined"
      meeting_preference: "online" | "in_person" | "hybrid"
      spiritual_level: "new_believer" | "growing_believer" | "mature_believer"
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
      app_role: ["admin", "mentor", "mentee"],
      match_status: ["pending", "accepted", "active", "completed", "declined"],
      meeting_preference: ["online", "in_person", "hybrid"],
      spiritual_level: ["new_believer", "growing_believer", "mature_believer"],
    },
  },
} as const

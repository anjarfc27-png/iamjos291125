// Database types for OJS system
// This file contains type definitions for the database schema

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      journals: {
        Row: {
          id: string
          title: string
          path: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          path: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          path?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          journal_id: string
          title: string
          abstract: string | null
          status: string
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          journal_id: string
          title: string
          abstract?: string | null
          status?: string
          author_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          journal_id?: string
          title?: string
          abstract?: string | null
          status?: string
          author_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_account_roles: {
        Row: {
          id: string
          user_id: string
          role_name: string
          role_path: string
          context_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role_name: string
          role_path: string
          context_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role_name?: string
          role_path?: string
          context_id?: string | null
          created_at?: string
        }
      }
      journal_user_roles: {
        Row: {
          id: string
          user_id: string
          journal_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          journal_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          journal_id?: string
          role?: string
          created_at?: string
        }
      }
      review_assignments: {
        Row: {
          id: string
          submission_id: string
          reviewer_id: string
          status: string
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          reviewer_id: string
          status?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          reviewer_id?: string
          status?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          setting_name: string
          setting_value: string
          setting_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_name: string
          setting_value: string
          setting_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_name?: string
          setting_value?: string
          setting_type?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}
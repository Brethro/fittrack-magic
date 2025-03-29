
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      foods: {
        Row: {
          id: string
          name: string
          description: string
          brand: string | null
          source: string
          source_id: string
          category: string | null
          serving_size: number
          serving_unit: string
          household_serving: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          brand?: string | null
          source: string
          source_id: string
          category?: string | null
          serving_size: number
          serving_unit: string
          household_serving?: string | null
          created_at: string
          updated_at: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          brand?: string | null
          source?: string
          source_id?: string
          category?: string | null
          serving_size?: number
          serving_unit?: string
          household_serving?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      food_nutrients: {
        Row: {
          id: string
          food_id: string
          calories: number
          protein: number
          carbs: number
          fat: number
          fiber: number
          sugar: number
          other_nutrients: Json
        }
        Insert: {
          id?: string
          food_id: string
          calories: number
          protein: number
          carbs: number
          fat: number
          fiber: number
          sugar: number
          other_nutrients: Json
        }
        Update: {
          id?: string
          food_id?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          fiber?: number
          sugar?: number
          other_nutrients?: Json
        }
        Relationships: [
          {
            foreignKeyName: "food_nutrients_food_id_fkey"
            columns: ["food_id"]
            referencedRelation: "foods"
            referencedColumns: ["id"]
          }
        ]
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          food_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_id: string
          created_at: string
        }
        Update: {
          id?: string
          user_id?: string
          food_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_food_id_fkey"
            columns: ["food_id"]
            referencedRelation: "foods"
            referencedColumns: ["id"]
          }
        ]
      }
      search_logs: {
        Row: {
          id: string
          query: string
          source: string
          results_count: number
          created_at: string
        }
        Insert: {
          id?: string
          query: string
          source: string
          results_count: number
          created_at: string
        }
        Update: {
          id?: string
          query?: string
          source?: string
          results_count?: number
          created_at?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          weight: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          weight: number
          notes?: string | null
          created_at: string
          updated_at: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          weight?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
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
  }
}

// Helper types for Supabase queries
export type TablesInsertProps<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type TablesUpdateProps<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

export type TablesProps<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

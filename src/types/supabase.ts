
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

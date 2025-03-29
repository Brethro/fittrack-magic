
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/supabase";

// Define the valid table names
export type ValidTable = 'foods' | 'food_nutrients' | 'user_favorites' | 'search_logs' | 'weight_logs';

/**
 * Simplified helper functions for database operations with proper types
 */

// Helper for simple queries with type safety
export function filterByString<T extends ValidTable>(
  query: SupabaseClient<Database>,
  table: T,
  column: keyof Database['public']['Tables'][T]['Row'],
  value: string
) {
  return query.from(table).eq(column as string, value);
}

// Helper for inserting data
export function insertIntoTable<T extends ValidTable>(
  query: SupabaseClient<Database>,
  table: T,
  values: Database['public']['Tables'][T]['Insert']
) {
  return query.from(table).insert(values);
}

// Helper for updating data
export function updateTable<T extends ValidTable>(
  query: SupabaseClient<Database>,
  table: T,
  values: Database['public']['Tables'][T]['Update'],
  column: keyof Database['public']['Tables'][T]['Row'],
  value: string
) {
  return query.from(table).update(values).eq(column as string, value);
}

// Helper for deleting data
export function deleteFromTable<T extends ValidTable>(
  query: SupabaseClient<Database>,
  table: T,
  column: keyof Database['public']['Tables'][T]['Row'],
  value: string
) {
  return query.from(table).delete().eq(column as string, value);
}

// Helper for selecting data
export function selectFromTable<T extends ValidTable>(
  query: SupabaseClient<Database>,
  table: T,
  columns: string = '*'
) {
  return query.from(table).select(columns);
}

// Helper for selecting with filtering
export function selectFilteredFromTable<T extends ValidTable>(
  query: SupabaseClient<Database>,
  table: T,
  filterColumn: keyof Database['public']['Tables'][T]['Row'],
  filterValue: string,
  columns: string = '*'
) {
  return query.from(table).select(columns).eq(filterColumn as string, filterValue);
}

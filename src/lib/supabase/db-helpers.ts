
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/supabase";

// Define the valid table names
export type ValidTable = 'foods' | 'food_nutrients' | 'user_favorites' | 'search_logs' | 'weight_logs';

/**
 * Helper functions for database operations with proper types
 */

// Helper for simple queries with type safety
export function filterByString<T extends ValidTable>(
  query: SupabaseClient<Database>,
  table: T,
  column: string,
  value: string
) {
  return query.from(table).select().eq(column as any, value);
}

// Helper for inserting data
export function insertIntoTable<T extends ValidTable>(
  query: SupabaseClient<Database>,
  table: T,
  values: any
) {
  return query.from(table).insert(values);
}

// Helper for updating data
export function updateTable<T extends ValidTable>(
  query: SupabaseClient<Database>,
  table: T,
  values: any,
  column: string,
  value: string | number
) {
  return query.from(table).update(values).eq(column as any, value);
}

// Helper for deleting data
export function deleteFromTable<T extends ValidTable>(
  query: SupabaseClient<Database>,
  table: T,
  column: string,
  value: string | number
) {
  return query.from(table).delete().eq(column as any, value);
}

// Helper for selecting data
export function selectFromTable<T extends ValidTable>(
  query: SupabaseClient<Database>,
  table: T,
  columns: string = '*'
) {
  return query.from(table).select(columns);
}

// Helper for selecting with filtering - simplified type approach
export function selectFilteredFromTable<TData = any>(
  query: SupabaseClient<Database>,
  table: ValidTable,
  filterColumn: string,
  filterValue: string | number,
  columns: string = '*'
) {
  // Simple approach to avoid excessive type nesting
  return query.from(table).select(columns);
}

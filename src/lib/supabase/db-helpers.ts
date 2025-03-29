
import { Database } from "../../types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Simplified helper functions for database operations
 * that use direct Supabase query methods rather than complex type-checking
 */

// Helper for simple queries
export function filterByString(
  query: SupabaseClient<Database>,
  table: string,
  column: string,
  value: string
) {
  return query.from(table).eq(column, value);
}

// Helper for inserting data
export function insertIntoTable(
  query: SupabaseClient<Database>,
  table: string,
  values: any
) {
  return query.from(table).insert(values);
}

// Helper for updating data
export function updateTable(
  query: SupabaseClient<Database>,
  table: string,
  values: any,
  column: string,
  value: string
) {
  return query.from(table).update(values).eq(column, value);
}

// Helper for deleting data
export function deleteFromTable(
  query: SupabaseClient<Database>,
  table: string,
  column: string,
  value: string
) {
  return query.from(table).delete().eq(column, value);
}

// Helper for selecting data
export function selectFromTable(
  query: SupabaseClient<Database>,
  table: string,
  columns: string = '*'
) {
  return query.from(table).select(columns);
}

// Helper for selecting with filtering
export function selectFilteredFromTable(
  query: SupabaseClient<Database>,
  table: string,
  filterColumn: string,
  filterValue: string,
  columns: string = '*'
) {
  return query.from(table).select(columns).eq(filterColumn, filterValue);
}

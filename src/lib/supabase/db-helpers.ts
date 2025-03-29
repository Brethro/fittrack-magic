
import { Database } from "../../types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Helper functions for type-safe database operations
 */

// Type-safe filter for string columns
export function filterByString<
  Schema extends keyof Database,
  Table extends keyof Database[Schema]['Tables'],
  Column extends keyof Database[Schema]['Tables'][Table]['Row'] & string
>(
  query: SupabaseClient<Database, Schema>,
  schema: Schema,
  table: Table,
  column: Column,
  value: string
) {
  return query.from(table as string).eq(column as string, value);
}

// Type-safe insert for tables
export function insertIntoTable<
  Schema extends keyof Database,
  Table extends keyof Database[Schema]['Tables']
>(
  query: SupabaseClient<Database, Schema>,
  schema: Schema,
  table: Table,
  values: Database[Schema]['Tables'][Table]['Insert']
) {
  return query.from(table as string).insert(values as any);
}

// Type-safe update for tables
export function updateTable<
  Schema extends keyof Database,
  Table extends keyof Database[Schema]['Tables']
>(
  query: SupabaseClient<Database, Schema>,
  schema: Schema,
  table: Table,
  values: Database[Schema]['Tables'][Table]['Update'],
  column: string,
  value: string
) {
  return query.from(table as string).update(values as any).eq(column, value);
}

// Type-safe delete from tables
export function deleteFromTable<
  Schema extends keyof Database,
  Table extends keyof Database[Schema]['Tables']
>(
  query: SupabaseClient<Database, Schema>,
  schema: Schema,
  table: Table,
  column: string,
  value: string
) {
  return query.from(table as string).delete().eq(column, value);
}

// Type-safe select from tables
export function selectFromTable<
  Schema extends keyof Database,
  Table extends keyof Database[Schema]['Tables']
>(
  query: SupabaseClient<Database, Schema>,
  schema: Schema,
  table: Table,
  columns: string = '*'
) {
  return query.from(table as string).select(columns);
}

// Type-safe select with filtering
export function selectFilteredFromTable<
  Schema extends keyof Database,
  Table extends keyof Database[Schema]['Tables']
>(
  query: SupabaseClient<Database, Schema>,
  schema: Schema,
  table: Table,
  filterColumn: string,
  filterValue: string,
  columns: string = '*'
) {
  return query.from(table as string).select(columns).eq(filterColumn, filterValue);
}

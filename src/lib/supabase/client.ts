
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

// Check for Supabase credentials in various places
const getEnvVariable = (key: string): string => {
  // Check sessionStorage first (for dynamically set values)
  const sessionValue = window.sessionStorage.getItem(key);
  if (sessionValue) return sessionValue;
  
  // Then check environment variables
  const envValue = import.meta.env[key];
  if (envValue) return envValue;
  
  return '';
};

// Initialize Supabase client
const supabaseUrl = getEnvVariable('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVariable('VITE_SUPABASE_ANON_KEY');

// Create the supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Create a typed helper function to fetch data
export async function fetcher<T>(
  query: Promise<{ data: T; error: any }>
): Promise<T> {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}


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
  
  // Return empty string if not found
  return '';
};

// Default values for public demo access
const DEFAULT_SUPABASE_URL = "https://jzezrkvkbelcuuashoqy.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZXpya3ZrYmVsY3V1YXNob3F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNTAzNjYsImV4cCI6MjA1ODYyNjM2Nn0.ZAzLoMvlEB01fjWQSuWhQdwDbbInAdxWXoFHaF9eav8";

// Initialize Supabase client
let supabaseUrl = getEnvVariable('VITE_SUPABASE_URL');
let supabaseAnonKey = getEnvVariable('VITE_SUPABASE_ANON_KEY');

// Use default values if needed
if (!supabaseUrl || !supabaseAnonKey) {
  console.log('Using default Supabase credentials');
  supabaseUrl = DEFAULT_SUPABASE_URL;
  supabaseAnonKey = DEFAULT_SUPABASE_ANON_KEY;
  
  // Store in session storage for consistency
  window.sessionStorage.setItem('VITE_SUPABASE_URL', supabaseUrl);
  window.sessionStorage.setItem('VITE_SUPABASE_ANON_KEY', supabaseAnonKey);
}

// Get the current origin for redirects
const getCurrentOrigin = (): string => {
  if (window.location.hostname === 'localhost') {
    // For development, return localhost
    return window.location.origin;
  } else {
    // For production, return your production domain
    return 'https://wearabody.com';
  }
};

// Create the supabase client with explicit options
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: 'weara-auth-token',
      detectSessionInUrl: true,
      flowType: 'pkce',
      // The redirectTo property needs to be in the auth.signUp and auth.signIn methods
      // instead of here in the client initialization
    },
    global: {
      fetch: function customFetch(url: RequestInfo | URL, options?: RequestInit) {
        return fetch(url, options).catch(err => {
          console.warn('Supabase fetch error:', err);
          throw err;
        });
      }
    }
  }
);

// Export the supabase client directly for import in other files
export default supabase;

// Export the getCurrentOrigin function for use in other files
export { getCurrentOrigin };

// Configure auth callback URL separately
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    console.log('Auth state changed:', event);
  }
});

// Create a typed helper function to fetch data
export async function fetcher<T>(
  query: Promise<{ data: T; error: any }>
): Promise<T> {
  try {
    const { data, error } = await query;
    if (error) {
      console.error('Fetch error:', error);
      throw error;
    }
    return data;
  } catch (err) {
    console.error('Fetcher caught error:', err);
    throw err;
  }
}

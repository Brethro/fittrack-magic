
import React, { createContext } from 'react';
import { SupabaseAuthContextType } from './types';

// Create the context with a default value
export const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  loading: false,
  error: null,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

// Define the props for the provider component
export interface SupabaseAuthProviderProps {
  children: React.ReactNode;
}

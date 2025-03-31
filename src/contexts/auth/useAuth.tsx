
import { useContext } from 'react';
import { SupabaseAuthContext } from './AuthContext';

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(SupabaseAuthContext);
};


import { User } from '@supabase/supabase-js';

// Define the shape of our auth context
export interface SupabaseAuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updateUserEmail: (newEmail: string) => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
  deleteUserAccount: () => Promise<boolean>;
}

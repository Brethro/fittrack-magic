
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { SupabaseAuthContext } from './AuthContext';
import { signUp as authSignUp, signIn as authSignIn, signOut as authSignOut } from './authFunctions';
import type { SupabaseAuthProviderProps } from './AuthContext';

// Your context component implementation
export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session on mount
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth context session error:", error);
          setError(error.message);
          return;
        }
        
        if (data?.session) {
          setUser(data.session.user);
        }
      } catch (err) {
        console.error("Auth context error:", err);
        setError("Authentication session check failed");
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event);
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check user immediately
    checkUser();

    // Cleanup listener on unmount
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Wrap the auth functions to provide the state setters
  const signUp = (email: string, password: string) => {
    return authSignUp(email, password, setLoading, setError);
  };

  const signIn = (email: string, password: string) => {
    return authSignIn(email, password, setLoading, setError, setUser);
  };

  const signOut = () => {
    return authSignOut(setLoading, setError, setUser);
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};


import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

// Define the context type
interface SupabaseAuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

// Create the context with a default value
const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  loading: false,
  error: null,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(SupabaseAuthContext);
};

// Define the props for the provider component
interface SupabaseAuthProviderProps {
  children: React.ReactNode;
}

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

  // Get the current origin dynamically for redirects
  const getRedirectUrl = () => {
    const origin = window.location.origin;
    // Ensuring we get the actual origin, not localhost
    console.log('Auth redirect URL set to:', `${origin}/auth/callback`);
    return `${origin}/auth/callback`;
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // IMPORTANT: Always explicitly set the redirectTo in the signUp method
      const redirectUrl = getRedirectUrl();
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: redirectUrl // Use dynamic redirect URL here
        }
      });
      
      if (error) {
        setError(error.message);
        toast({
          title: "Signup Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Verification email sent",
        description: "Please check your email to verify your account.",
      });
      
      // No need to set user yet - they need to verify email first
      return data;
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
      toast({
        title: "Signup Error",
        description: err.message || "An error occurred during sign up",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // For sign in, also set the redirectTo explicitly
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          redirectTo: getRedirectUrl() // Add redirect URL for sign in too
        }
      });
      
      if (error) {
        setError(error.message);
        toast({
          title: "Login Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      if (data?.user) {
        setUser(data.user);
        toast({
          title: "Login Successful",
          description: `Welcome back${data.user.email ? ', ' + data.user.email : ''}!`,
        });
      }
      
      return data;
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in");
      toast({
        title: "Login Error",
        description: err.message || "An error occurred during sign in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
        toast({
          title: "Logout Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (err: any) {
      setError(err.message || "An error occurred during sign out");
      toast({
        title: "Logout Error",
        description: err.message || "An error occurred during sign out",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

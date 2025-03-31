
import { User } from '@supabase/supabase-js';
import { supabase, getCurrentOrigin } from '@/lib/supabase';
import { toast } from "@/hooks/use-toast";

// Auth functions
export const signUp = async (
  email: string, 
  password: string,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  try {
    setLoading(true);
    setError(null);
    
    // Get the current origin for redirect
    const redirectUrl = `${getCurrentOrigin()}/auth/callback`;
    console.log('Using redirect URL for signup:', redirectUrl);
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      setError(error.message);
      toast({
        title: "Signup Error",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
    
    toast({
      title: "Verification email sent",
      description: "Please check your email to verify your account.",
    });
    
    // Return data so the component knows signup was successful
    return data;
  } catch (err: any) {
    setError(err.message || "An error occurred during sign up");
    toast({
      title: "Signup Error",
      description: err.message || "An error occurred during sign up",
      variant: "destructive"
    });
    return null;
  } finally {
    setLoading(false);
  }
};

export const signIn = async (
  email: string, 
  password: string,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setUser: (user: User | null) => void
) => {
  try {
    setLoading(true);
    setError(null);
    
    // For sign in, we can't set redirectTo directly in options since it's not in the type
    // Instead, we need to handle this in the AuthCallback component
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
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

export const signOut = async (
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setUser: (user: User | null) => void
) => {
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

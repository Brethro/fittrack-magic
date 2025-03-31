
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

// New Profile Management Functions

/**
 * Updates the user's password
 */
export const updateUserPassword = async (
  currentPassword: string,
  newPassword: string,
  setLoading?: (loading: boolean) => void,
  setError?: (error: string | null) => void
) => {
  try {
    if (setLoading) setLoading(true);
    if (setError) setError(null);
    
    // First verify the current password by attempting to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user?.email || '',
      password: currentPassword
    });
    
    if (signInError) {
      if (setError) setError(signInError.message);
      throw new Error("Current password is incorrect");
    }
    
    // If current password is verified, update to the new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      if (setError) setError(error.message);
      throw new Error(error.message);
    }
    
    return true;
  } catch (err: any) {
    console.error("Error updating password:", err);
    if (setError) setError(err.message || "An error occurred updating password");
    throw err;
  } finally {
    if (setLoading) setLoading(false);
  }
};

/**
 * Updates the user's email address
 * This will send a confirmation email to the new address
 */
export const updateUserEmail = async (
  newEmail: string,
  setLoading?: (loading: boolean) => void,
  setError?: (error: string | null) => void
) => {
  try {
    if (setLoading) setLoading(true);
    if (setError) setError(null);
    
    // Get the current origin for redirect
    const redirectUrl = `${getCurrentOrigin()}/auth/callback`;
    
    // The 'options' needs to be passed separately from the UserAttributes object
    const { error } = await supabase.auth.updateUser({
      email: newEmail
    }, {
      emailRedirectTo: redirectUrl
    });
    
    if (error) {
      if (setError) setError(error.message);
      throw new Error(error.message);
    }
    
    return true;
  } catch (err: any) {
    console.error("Error updating email:", err);
    if (setError) setError(err.message || "An error occurred updating email");
    throw err;
  } finally {
    if (setLoading) setLoading(false);
  }
};

/**
 * Sends a password reset email to the user
 */
export const sendPasswordResetEmail = async (
  email: string,
  setLoading?: (loading: boolean) => void,
  setError?: (error: string | null) => void
) => {
  try {
    if (setLoading) setLoading(true);
    if (setError) setError(null);
    
    // Get the current origin for redirect
    const redirectUrl = `${getCurrentOrigin()}/auth/callback`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    
    if (error) {
      if (setError) setError(error.message);
      throw new Error(error.message);
    }
    
    return true;
  } catch (err: any) {
    console.error("Error sending password reset:", err);
    if (setError) setError(err.message || "An error occurred sending password reset");
    throw err;
  } finally {
    if (setLoading) setLoading(false);
  }
};

/**
 * Deletes the user's account
 * This is a permanent action and cannot be undone
 */
export const deleteUserAccount = async (
  setLoading?: (loading: boolean) => void,
  setError?: (error: string | null) => void
) => {
  try {
    if (setLoading) setLoading(true);
    if (setError) setError(null);
    
    // First delete user data from database tables
    // This is handled by the userDb.deleteUserData function

    // Then delete the user auth account
    const { error } = await supabase.auth.admin.deleteUser(
      (await supabase.auth.getUser()).data.user?.id || ''
    );
    
    if (error) {
      if (setError) setError(error.message);
      throw new Error(error.message);
    }
    
    return true;
  } catch (err: any) {
    console.error("Error deleting account:", err);
    if (setError) setError(err.message || "An error occurred deleting your account");
    throw err;
  } finally {
    if (setLoading) setLoading(false);
  }
};

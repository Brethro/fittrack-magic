
import { NavigateFunction } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast as toastFunction } from "@/hooks/use-toast";

type ToastFunction = typeof toastFunction;

/**
 * Handles the verification code flow in the authentication callback
 */
export const handleVerificationCode = async (
  navigate: NavigateFunction,
  toast: ToastFunction
) => {
  console.log('Found code in URL, handling email verification');
  
  // When there's a code parameter, let Supabase handle it
  // The PKCE flow will automatically exchange the code for a token
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error processing verification code:', error);
    toast({
      title: 'Verification error',
      description: error.message,
      variant: 'destructive',
    });
    navigate('/splash', { replace: true });
    return false;
  }
  
  if (data?.session) {
    console.log('Email verification successful');
    toast({
      title: 'Email verified',
      description: 'Your email has been verified successfully.',
    });
    navigate('/', { replace: true });
    return true;
  }
  
  console.log('No session after code verification, continuing...');
  return false;
};

/**
 * Handles the token-based authentication flow from URL query parameters
 */
export const handleTokenFromQuery = async (
  token: string | null,
  type: string | null,
  errorDesc: string | null,
  navigate: NavigateFunction,
  toast: ToastFunction
) => {
  if (errorDesc) {
    console.error('Error in query parameters:', errorDesc);
    toast({
      title: 'Authentication error',
      description: errorDesc,
      variant: 'destructive',
    });
    navigate('/splash', { replace: true });
    return true;
  }
  
  console.log('Found token in URL, type:', type);
  
  if (token && type === 'signup') {
    // We have a signup confirmation token
    try {
      // Process token to verify email
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });
      
      if (error) {
        console.error('Error verifying email:', error);
        toast({
          title: 'Verification error',
          description: error.message,
          variant: 'destructive',
        });
        navigate('/splash', { replace: true });
        return true;
      }
      
      // Successfully verified email
      toast({
        title: 'Email verified',
        description: 'Your email has been verified. Please sign in.',
      });
      
      navigate('/splash', { replace: true });
      return true;
    } catch (err) {
      console.error('Error processing token:', err);
      toast({
        title: 'Verification error',
        description: 'There was a problem verifying your email.',
        variant: 'destructive',
      });
      navigate('/splash', { replace: true });
      return true;
    }
  }
  
  return false;
};

/**
 * Handles the authentication flow with hash fragment (magic link)
 */
export const handleHashFragment = async (
  navigate: NavigateFunction,
  toast: ToastFunction
) => {
  console.log('Detected hash fragment, processing as magic link...');
  
  try {
    // Use getSession to handle the fragment part
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error processing hash token:', error);
      toast({
        title: 'Authentication error',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/splash', { replace: true });
      return true;
    }
    
    if (data?.session) {
      // Success - user is logged in via hash fragment
      console.log('Magic link authentication successful');
      toast({
        title: 'Authentication successful',
        description: 'You are now signed in.',
      });
      navigate('/', { replace: true });
      return true;
    } else {
      console.log('No session found after processing hash');
    }
  } catch (err) {
    console.error('Error processing hash fragment:', err);
  }
  
  return false;
};

/**
 * Final fallback: check for session directly
 */
export const checkSession = async (
  navigate: NavigateFunction,
  toast: ToastFunction
) => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Auth callback error:', error);
    toast({
      title: 'Authentication error',
      description: error.message,
      variant: 'destructive',
    });
    navigate('/splash', { replace: true });
    return;
  }
  
  if (data?.session) {
    // Success - user is logged in
    console.log('Auth successful, got session');
    toast({
      title: 'Authentication successful',
      description: 'You are now signed in.',
    });
    navigate('/', { replace: true });
  } else {
    // No session found, redirect to splash
    console.log('No session found, redirecting to splash');
    navigate('/splash', { replace: true });
  }
};

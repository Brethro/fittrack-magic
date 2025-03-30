
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Function to handle the auth redirect
    const handleAuthRedirect = async () => {
      try {
        console.log('Auth callback processing...');
        console.log('Full URL:', window.location.href);
        
        // Hash fragments indicate access_token is in the URL fragment (common with magic links)
        const hasHashFragment = window.location.hash && window.location.hash.length > 1;
        
        // Get URL parts that might contain tokens
        const hash = window.location.hash;
        const queryParams = new URLSearchParams(window.location.search);
        const hasTokenInHash = hash && (hash.includes('access_token') || hash.includes('error'));
        const hasTokenInQuery = queryParams.has('token') || queryParams.has('error_description');
        
        console.log('Auth tokens in hash:', hasHashFragment);
        console.log('Auth tokens in query:', hasTokenInQuery);
        
        // For email confirmation links, we need to process the token from URL
        if (hasTokenInQuery) {
          const token = queryParams.get('token');
          const type = queryParams.get('type');
          const errorDesc = queryParams.get('error_description');
          
          if (errorDesc) {
            console.error('Error in query parameters:', errorDesc);
            toast({
              title: 'Authentication error',
              description: errorDesc,
              variant: 'destructive',
            });
            navigate('/splash', { replace: true });
            return;
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
                return;
              }
              
              // Successfully verified email
              toast({
                title: 'Email verified',
                description: 'Your email has been verified. Please sign in.',
              });
              
              navigate('/splash', { replace: true });
              return;
            } catch (err) {
              console.error('Error processing token:', err);
              toast({
                title: 'Verification error',
                description: 'There was a problem verifying your email.',
                variant: 'destructive',
              });
              navigate('/splash', { replace: true });
              return;
            }
          }
        }
        
        // First try to exchange the token in case it's a magic link with hash fragment
        if (hasHashFragment) {
          console.log('Detected hash fragment, processing as magic link...');
          
          try {
            // Use setSession to handle the fragment part
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Error processing hash token:', error);
              toast({
                title: 'Authentication error',
                description: error.message,
                variant: 'destructive',
              });
              navigate('/splash', { replace: true });
              return;
            }
            
            if (data?.session) {
              // Success - user is logged in via hash fragment
              console.log('Magic link authentication successful');
              toast({
                title: 'Authentication successful',
                description: 'You are now signed in.',
              });
              navigate('/', { replace: true });
              return;
            } else {
              console.log('No session found after processing hash');
            }
          } catch (err) {
            console.error('Error processing hash fragment:', err);
          }
        }
        
        // For OAuth redirects or token exchange, we use getSession
        // which will automatically handle regular auth flows
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
      } catch (err) {
        console.error('Error processing auth redirect:', err);
        toast({
          title: 'Authentication error',
          description: 'There was a problem processing your login.',
          variant: 'destructive',
        });
        navigate('/splash', { replace: true });
      }
    };

    // Execute the redirect handling
    handleAuthRedirect();
  }, [navigate, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 size={40} className="animate-spin text-primary mb-4" />
      <p className="text-lg">Completing authentication...</p>
    </div>
  );
}

export default AuthCallback;

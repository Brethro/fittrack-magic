
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
        // Process the callback from Supabase
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
          toast({
            title: 'Authentication successful',
            description: 'You are now signed in.',
          });
          navigate('/', { replace: true });
        } else {
          // No session found, redirect to splash
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

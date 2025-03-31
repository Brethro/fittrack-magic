
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AuthLoadingScreen from './AuthLoadingScreen';
import { 
  handleVerificationCode, 
  handleTokenFromQuery,
  handleHashFragment,
  checkSession
} from './utils/authCallbackUtils';

export function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Function to handle the auth redirect
    const handleAuthRedirect = async () => {
      try {
        console.log('Auth callback processing...');
        console.log('Full URL:', window.location.href);
        
        // Get URL parts that might contain tokens
        const hash = window.location.hash;
        const queryParams = new URLSearchParams(window.location.search);
        
        // Check if this is a callback with a code parameter (email verification flow)
        const hasCodeParam = queryParams.has('code');
        const hasTokenInHash = hash && hash.includes('access_token');
        const hasTokenInQuery = queryParams.has('token') || queryParams.has('error_description');
        
        console.log('Auth code in query:', hasCodeParam);
        console.log('Auth tokens in hash:', hasTokenInHash);
        console.log('Auth tokens in query:', hasTokenInQuery);
        
        // Process auth flows in order of priority
        
        // 1. Handle code-based verification (PKCE flow)
        if (hasCodeParam) {
          const handled = await handleVerificationCode(navigate, toast);
          if (handled) return;
        }
        
        // 2. Handle query parameter tokens
        if (hasTokenInQuery) {
          const token = queryParams.get('token');
          const type = queryParams.get('type');
          const errorDesc = queryParams.get('error_description');
          
          const handled = await handleTokenFromQuery(token, type, errorDesc, navigate, toast);
          if (handled) return;
        }
        
        // 3. Handle hash fragment (magic link)
        if (hasTokenInHash) {
          const handled = await handleHashFragment(navigate, toast);
          if (handled) return;
        }
        
        // 4. Final fallback: check for session directly
        await checkSession(navigate, toast);
        
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

  return <AuthLoadingScreen />;
}

export default AuthCallback;

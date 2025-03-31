
import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthLoadingScreenProps {
  message?: string;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({ 
  message = "Completing authentication..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 size={40} className="animate-spin text-primary mb-4" />
      <p className="text-lg">{message}</p>
    </div>
  );
};

export default AuthLoadingScreen;

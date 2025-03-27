
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LineChart, UserRound, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AuthForm from "./auth/AuthForm";
import { useAuth } from "@/contexts/SupabaseAuthContext";

type SplashScreenProps = {
  onComplete?: () => void;
};

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user has data stored but is not logged in
  useEffect(() => {
    const hasUserData = localStorage.getItem("fitTrackUserData") !== null;
    setIsReturningUser(hasUserData && !user);
  }, [user]);

  const handleContinueAsGuest = () => {
    // Continue as guest, navigate to home page
    if (onComplete) onComplete();
    navigate("/");
  };

  const handleAuthSuccess = () => {
    setIsAuthOpen(false);
    if (onComplete) onComplete();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-main flex flex-col items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-10%] w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[250px] h-[250px] rounded-full bg-fuchsia-500/10 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-md z-10 gap-8"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-[120px] h-[120px] pink-purple-gradient rounded-full flex items-center justify-center purple-glow"
        >
          <LineChart size={60} className="text-white" />
        </motion.div>
        
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl font-bold mb-3"
          >
            <span className="text-gradient-pink-blue">Weara</span>
            <span className="text-white"> Body</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-white/70 mb-6"
          >
            Achieve your fitness goals with science-based personalized plans
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col gap-4 w-full"
        >
          {isReturningUser ? (
            // Show returning user message and options
            <div className="bg-white/5 rounded-xl p-4 mb-2 border border-white/10">
              <p className="text-white mb-3">Welcome back! You have existing data</p>
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsAuthOpen(true)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <UserRound size={18} />
                  <span>Sign in to sync data</span>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleContinueAsGuest}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ArrowRight size={18} />
                  <span>Continue without signing in</span>
                </Button>
              </div>
            </div>
          ) : (
            // Show new user options
            <>
              <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
                <Button 
                  variant="gradient" 
                  size="lg" 
                  onClick={() => setIsAuthOpen(true)}
                  className="w-full py-6 purple-glow flex items-center justify-center gap-2"
                >
                  <UserRound size={20} />
                  <span>Create Account</span>
                </Button>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Account</DialogTitle>
                    <DialogDescription>
                      Sign in to your account or create a new one to save your progress
                    </DialogDescription>
                  </DialogHeader>
                  <AuthForm onSuccess={handleAuthSuccess} />
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleContinueAsGuest}
                className="w-full py-6"
              >
                Continue as Guest
              </Button>
            </>
          )}
          
          <p className="text-xs text-white/60 mt-2">
            Guest mode saves data only on this device
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SplashScreen;

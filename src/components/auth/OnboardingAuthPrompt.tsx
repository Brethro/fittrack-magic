
import { useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserRound } from "lucide-react";
import AuthForm from "./AuthForm";

export function OnboardingAuthPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Don't render if user is already logged in
  if (user) {
    return null;
  }

  const handleAuthSuccess = () => {
    setIsOpen(false);
  };

  return (
    <div className="mb-8 rounded-xl glass-panel p-6">
      <div className="flex flex-col space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">
            Create an account to save your progress
          </h2>
          <p className="text-muted-foreground">
            Your data will be lost if you don't create an account
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex justify-end">
            <Button 
              variant="purple" 
              size="lg"
              onClick={() => setIsOpen(true)} 
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <UserRound size={18} />
              <span>Create Account</span>
            </Button>
          </div>
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
      </div>
    </div>
  );
}

export default OnboardingAuthPrompt;

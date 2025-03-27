
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
import { LogIn, User } from "lucide-react";
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
    <div className="mb-6 flex items-center justify-between">
      <div className="flex-1">
        <h2 className="text-sm font-medium">
          Create an account to save your progress
        </h2>
        <p className="text-xs text-muted-foreground">
          Your data will be lost if you don't create an account
        </p>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsOpen(true)} 
          className="flex items-center gap-2"
        >
          <User size={16} />
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
    </div>
  );
}

export default OnboardingAuthPrompt;

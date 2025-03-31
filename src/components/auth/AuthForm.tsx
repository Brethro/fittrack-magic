
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, Mail, AlertCircle } from "lucide-react";

export function AuthForm({ onSuccess }: { onSuccess?: () => void } = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const { signIn, signUp, loading, error } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
    if (!error && onSuccess) onSuccess();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signUp(email, password);
    
    // If signup was successful (no error), show verification screen
    if (!error && result) {
      setShowVerificationScreen(true);
    }
  };

  // Render verification instructions screen after signup
  if (showVerificationScreen) {
    return (
      <div className="py-6 flex flex-col items-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-2">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        
        <h3 className="text-xl font-medium text-center">Check your email</h3>
        
        <div className="bg-muted/50 rounded-lg p-4 flex items-start space-x-3 w-full">
          <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">
              We've sent a verification link to:
            </p>
            <p className="font-medium mt-1">{email}</p>
          </div>
        </div>
        
        <div className="text-sm text-center space-y-2 text-muted-foreground">
          <p>
            Click the link in the email to verify your account.
            The link will expire in 24 hours.
          </p>
          <p className="flex items-center gap-1 justify-center">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Check your spam folder if you don't see it</span>
          </p>
        </div>
        
        <div className="pt-4 w-full">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => {
              if (onSuccess) onSuccess();
            }}
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Create Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <form onSubmit={handleSignIn} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input 
                id="signin-email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input 
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && <p className="text-destructive text-sm">{error}</p>}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="signup">
          <form onSubmit={handleSignUp} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input 
                id="signup-email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input 
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>
            
            {error && <p className="text-destructive text-sm">{error}</p>}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AuthForm;

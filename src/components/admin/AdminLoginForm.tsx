
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginFormProps {
  onAuthenticate: (rememberMe: boolean) => void;
}

export function AdminLoginForm({ onAuthenticate }: AdminLoginFormProps) {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Password for the demo app
  const ADMIN_PASSWORD = "gayest";

  const handleAuthenticate = () => {
    setIsAuthenticating(true);
    
    // Simple timeout to simulate authentication process
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        onAuthenticate(rememberMe);
        toast({
          title: "Authentication successful",
          description: "Welcome to the admin panel",
        });
      } else {
        toast({
          title: "Authentication failed",
          description: "Invalid password",
          variant: "destructive",
        });
      }
      setIsAuthenticating(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Required</CardTitle>
        <CardDescription>
          Enter the admin password to access the control panel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAuthenticate();
                }
              }}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember-me" 
              checked={rememberMe} 
              onCheckedChange={(checked) => setRememberMe(checked === true)} 
            />
            <label 
              htmlFor="remember-me" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Keep me logged in
            </label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleAuthenticate} 
          disabled={isAuthenticating}
        >
          {isAuthenticating ? "Authenticating..." : "Authenticate"}
        </Button>
      </CardFooter>
    </Card>
  );
}

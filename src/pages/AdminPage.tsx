
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ADMIN_PASSWORD = "gayest"; // Simple password as requested
const ADMIN_AUTH_KEY = "fittrack_admin_auth"; // localStorage key

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check for saved authentication on component mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(ADMIN_AUTH_KEY);
    if (savedAuth === "true") {
      setAuthenticated(true);
      toast({
        title: "Authentication restored",
        description: "Welcome back to the admin panel",
      });
    }
  }, [toast]);

  const handleAuthenticate = () => {
    setIsAuthenticating(true);
    
    // Simple timeout to simulate authentication process
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        setAuthenticated(true);
        
        // Save authentication state if remember me is checked
        if (rememberMe) {
          localStorage.setItem(ADMIN_AUTH_KEY, "true");
        }
        
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

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem(ADMIN_AUTH_KEY);
    toast({
      title: "Logged out",
      description: "You have been logged out of the admin panel",
    });
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-6">
          <Shield className="mr-2 text-primary" />
          <h1 className="text-2xl font-bold text-gradient-purple">
            Admin Panel
          </h1>
        </div>

        {!authenticated ? (
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
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Admin Tools</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Administration</CardTitle>
                <CardDescription>
                  This section contains administrative tools for managing the application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No administrative tools are currently available.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPage;

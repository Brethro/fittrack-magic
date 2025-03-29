
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Shield } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UserCodeAuthProps {
  onVerify: () => void;
}

export function UserCodeAuth({ onVerify }: UserCodeAuthProps) {
  const { toast } = useToast();
  const [adminCode, setAdminCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    // This should be a stronger verification in production
    // For demo purposes, we use a simple code
    if (adminCode === "SUPER_ADMIN_ACCESS") {
      onVerify();
      toast({
        title: "Admin code verified",
        description: "You now have access to user management functions",
      });
    } else {
      toast({
        title: "Invalid admin code",
        description: "The admin code you entered is incorrect",
        variant: "destructive",
      });
    }
    setIsVerifying(false);
  };

  return (
    <Card className="mb-6 border-amber-500">
      <CardHeader className="bg-amber-50 dark:bg-amber-950/30">
        <CardTitle className="text-amber-800 dark:text-amber-300 flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Enhanced Security Required
        </CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-400">
          User management functions require additional authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <p className="text-sm">
            To access user data, you must enter the administrator security code.
            This helps protect sensitive user information.
          </p>
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Enter admin code"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleVerify();
                }
              }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify Code"}
        </Button>
      </CardFooter>
    </Card>
  );
}

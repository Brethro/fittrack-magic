
import { Button } from "@/components/ui/button";
import { Shield, LogOut } from "lucide-react";

interface AdminHeaderProps {
  onLogout: () => void;
}

export function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <>
      <div className="flex items-center mb-6">
        <Shield className="mr-2 text-primary" />
        <h1 className="text-2xl font-bold text-gradient-purple">
          Admin Panel
        </h1>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Admin Tools</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onLogout}
          className="flex items-center gap-1"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );
}

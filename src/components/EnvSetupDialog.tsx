
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface EnvSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnvSetupDialog({ open, onOpenChange }: EnvSetupDialogProps) {
  const { toast } = useToast();
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");

  const handleSave = () => {
    if (!supabaseUrl || !supabaseKey) {
      toast({
        title: "Missing values",
        description: "Please enter both Supabase URL and anon key",
        variant: "destructive",
      });
      return;
    }

    // Store in localStorage
    localStorage.setItem("SUPABASE_URL", supabaseUrl);
    localStorage.setItem("SUPABASE_ANON_KEY", supabaseKey);

    // Set environment variables
    window.sessionStorage.setItem("VITE_SUPABASE_URL", supabaseUrl);
    window.sessionStorage.setItem("VITE_SUPABASE_ANON_KEY", supabaseKey);

    toast({
      title: "Settings saved",
      description: "Supabase configuration has been saved. Please reload the page.",
    });
    
    onOpenChange(false);
    
    // Reload the page to apply the new settings
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Supabase Configuration</DialogTitle>
          <DialogDescription>
            Enter your Supabase project credentials to enable database functionality.
            You can find these in your Supabase project dashboard under Settings &gt; API.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="supabaseUrl">Supabase URL</Label>
            <Input
              id="supabaseUrl"
              placeholder="https://your-project-id.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="supabaseKey">Supabase Anon Key</Label>
            <Input
              id="supabaseKey"
              placeholder="your-anon-key"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use the anon/public key, not your service key.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EnvSetupDialog;

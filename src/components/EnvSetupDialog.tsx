
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { EnvSetupDialogProps } from "./EnvSetupDialog.d";

export function EnvSetupDialog({ open, onOpenChange, onConfigSaved, isAdminMode = false }: EnvSetupDialogProps) {
  const { toast } = useToast();
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [saving, setSaving] = useState(false);

  // Initialize with existing values if available
  useState(() => {
    const existingUrl = localStorage.getItem("SUPABASE_URL");
    const existingKey = localStorage.getItem("SUPABASE_ANON_KEY");
    
    if (existingUrl) setSupabaseUrl(existingUrl);
    if (existingKey) setSupabaseKey(existingKey);
  });

  const handleSave = () => {
    if (!supabaseUrl || !supabaseKey) {
      toast({
        title: "Missing values",
        description: "Please enter both Supabase URL and anon key",
        variant: "destructive",
      });
      return;
    }

    // Start saving process
    setSaving(true);

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
    
    // Call the onConfigSaved callback if provided
    if (onConfigSaved) {
      onConfigSaved();
    }
    
    // Reload the page to apply the new settings
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // If not in admin mode and dialog is shown, inform user and close
  if (!isAdminMode && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Developer Configuration</DialogTitle>
            <DialogDescription>
              This dialog is intended only for developers and administrators.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="rounded-md bg-amber-50 dark:bg-amber-950/50 p-3 text-sm flex gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div className="text-amber-800 dark:text-amber-200">
                You don't need to configure Supabase to use this application. 
                This configuration is only required for developers.
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

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
          <div className="rounded-md bg-amber-50 dark:bg-amber-950/50 p-3 text-sm flex gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="text-amber-800 dark:text-amber-200">
              After saving, the page will reload to apply your configuration.
              Visit the Admin page to verify the connection status.
            </div>
          </div>
          
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EnvSetupDialog;

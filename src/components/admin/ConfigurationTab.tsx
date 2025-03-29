
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";
import { DatabaseStatsDisplay } from "./DatabaseStatsDisplay";

interface ConfigurationTabProps {
  supabaseStatus: "checking" | "connected" | "error";
  dbStats: {
    tables: number;
    rows: { [key: string]: number };
    uniqueFoods: number;
    uniqueUsers: number;
  } | null;
  isLoading: boolean;
  onResetConfig: () => void;
  onRetryConnection: () => void;
  onRefreshStats: () => void;
}

export function ConfigurationTab({
  supabaseStatus,
  dbStats,
  isLoading,
  onResetConfig,
  onRetryConnection,
  onRefreshStats
}: ConfigurationTabProps) {
  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Supabase Configuration
            <Badge className="ml-3" variant={
              supabaseStatus === "connected" ? "outline" : 
              supabaseStatus === "checking" ? "secondary" : "destructive"
            }>
              {supabaseStatus === "connected" ? "Connected" : 
              supabaseStatus === "checking" ? "Checking..." : "Error"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage your Supabase database connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supabaseStatus === "connected" ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Current configuration:</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    URL: {localStorage.getItem("SUPABASE_URL") ? "✓ Configured" : "Using default"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Anon Key: {localStorage.getItem("SUPABASE_ANON_KEY") ? "✓ Configured" : "Using default"}
                  </p>
                </div>
                
                {dbStats && (
                  <DatabaseStatsDisplay 
                    dbStats={dbStats} 
                    isLoading={isLoading} 
                    onRefresh={onRefreshStats} 
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                {supabaseStatus === "checking" ? (
                  <p>Checking connection to Supabase...</p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-destructive">Unable to connect to Supabase. Please check your configuration.</p>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 rounded-md text-sm">
                      <p className="font-semibold">Possible issues:</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Your Supabase project URL or key might be incorrect</li>
                        <li>The required database tables don't exist (switch to the "Create Tables" tab)</li>
                        <li>RLS policies might be restricting access</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onResetConfig}>
            Update Configuration
          </Button>
          {supabaseStatus === "error" && (
            <Button 
              variant="outline" 
              className="ml-2"
              onClick={onRetryConnection}
            >
              Retry Connection
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
          <CardDescription>
            Tools for managing your application database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {supabaseStatus === "connected" ? (
            <div className="space-y-2">
              <p className="text-sm">Data management options:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button variant="outline" disabled={true} className="justify-start">
                  Export User Data
                </Button>
                <Button variant="outline" disabled={true} className="justify-start">
                  Clear Food Log Data
                </Button>
                <Button variant="outline" disabled={true} className="justify-start">
                  Reset Search History
                </Button>
                <Button variant="outline" disabled={true} className="justify-start">
                  Backup Database
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Note: These features will be implemented in future updates.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Connect to Supabase to access database management tools.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

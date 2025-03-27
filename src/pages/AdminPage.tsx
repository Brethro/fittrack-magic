
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield, LogOut, Database, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import EnvSetupDialog from "@/components/EnvSetupDialog";

const ADMIN_PASSWORD = "gayest"; // Simple password as requested
const ADMIN_AUTH_KEY = "fittrack_admin_auth"; // localStorage key

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "connected" | "error">("checking");
  const [showEnvSetup, setShowEnvSetup] = useState(false);
  const [dbStats, setDbStats] = useState<{tables: number, rows: {[key: string]: number}} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // Check Supabase connection
  useEffect(() => {
    if (authenticated) {
      checkSupabaseConnection();
    }
  }, [authenticated]);

  const checkSupabaseConnection = async () => {
    setSupabaseStatus("checking");
    try {
      // Simple health check query
      const { data, error } = await supabase.from('foods').select('id').limit(1);
      
      if (error) {
        console.error("Supabase connection error:", error);
        setSupabaseStatus("error");
      } else {
        setSupabaseStatus("connected");
        fetchDatabaseStats();
      }
    } catch (error) {
      console.error("Supabase connection check failed:", error);
      setSupabaseStatus("error");
    }
  };

  const fetchDatabaseStats = async () => {
    setIsLoading(true);
    try {
      // Create an object to store counts for different tables
      const stats = { tables: 0, rows: {} as {[key: string]: number} };
      
      // Array of tables to check
      const tables = ['foods', 'food_nutrients', 'user_favorites', 'search_logs', 'weight_logs'];
      
      // Count number of tables
      stats.tables = tables.length;
      
      // Fetch row counts for each table
      for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error(`Error fetching count for ${table}:`, error);
          stats.rows[table] = 0;
        } else {
          stats.rows[table] = count || 0;
        }
      }
      
      setDbStats(stats);
    } catch (error) {
      console.error("Error fetching database stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        
        // Check Supabase connection after authentication
        checkSupabaseConnection();
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

  const handleResetSupabaseConfig = () => {
    setShowEnvSetup(true);
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
                          URL: {localStorage.getItem("SUPABASE_URL") ? "✓ Configured" : "Not set"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Anon Key: {localStorage.getItem("SUPABASE_ANON_KEY") ? "✓ Configured" : "Not set"}
                        </p>
                      </div>
                      
                      {dbStats && (
                        <div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium">Database Statistics</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={fetchDatabaseStats}
                              disabled={isLoading}
                            >
                              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                              Refresh
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-card/50 p-2 rounded-md">
                              <p className="text-xs text-muted-foreground">Tables</p>
                              <p className="text-lg font-semibold">{dbStats.tables}</p>
                            </div>
                            {Object.entries(dbStats.rows).map(([table, count]) => (
                              <div key={table} className="bg-card/50 p-2 rounded-md">
                                <p className="text-xs text-muted-foreground">{table}</p>
                                <p className="text-lg font-semibold">{count} rows</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      {supabaseStatus === "checking" ? (
                        <p>Checking connection to Supabase...</p>
                      ) : (
                        <p className="text-destructive">Unable to connect to Supabase. Please check your configuration.</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleResetSupabaseConfig}>
                  Update Configuration
                </Button>
                {supabaseStatus === "error" && (
                  <Button 
                    variant="outline" 
                    className="ml-2"
                    onClick={checkSupabaseConnection}
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
          </div>
        )}
      </motion.div>
      
      <EnvSetupDialog open={showEnvSetup} onOpenChange={setShowEnvSetup} />
    </div>
  );
};

export default AdminPage;

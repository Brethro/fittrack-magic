import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield, LogOut, Database, RefreshCw, Code, Copy, Check, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import EnvSetupDialog from "@/components/EnvSetupDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const ADMIN_PASSWORD = "gayest"; // Simple password as requested
const ADMIN_AUTH_KEY = "fittrack_admin_auth"; // localStorage key

// SQL scripts for creating the tables
const createTableScripts = {
  foods: `CREATE TABLE public.foods (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  brand text,
  source text NOT NULL,
  source_id text NOT NULL,
  category text,
  serving_size numeric NOT NULL,
  serving_unit text NOT NULL,
  household_serving text,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL
);`,
  food_nutrients: `CREATE TABLE public.food_nutrients (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  food_id uuid REFERENCES public.foods(id) ON DELETE CASCADE,
  calories numeric NOT NULL,
  protein numeric NOT NULL,
  carbs numeric NOT NULL,
  fat numeric NOT NULL,
  fiber numeric NOT NULL,
  sugar numeric NOT NULL,
  other_nutrients jsonb NOT NULL
);`,
  user_favorites: `CREATE TABLE public.user_favorites (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL,
  food_id uuid REFERENCES public.foods(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL
);`,
  search_logs: `CREATE TABLE public.search_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  query text NOT NULL,
  source text NOT NULL,
  results_count integer NOT NULL,
  created_at timestamp with time zone NOT NULL
);`,
  weight_logs: `CREATE TABLE public.weight_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL,
  date timestamp with time zone NOT NULL,
  weight numeric NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL
);`
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "connected" | "error">("checking");
  const [showEnvSetup, setShowEnvSetup] = useState(false);
  const [dbStats, setDbStats] = useState<{
    tables: number,
    rows: {[key: string]: number},
    uniqueFoods: number,
    uniqueUsers: number
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("config");
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

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
      const stats = { 
        tables: 0, 
        rows: {} as {[key: string]: number},
        uniqueFoods: 0,
        uniqueUsers: 0
      };
      
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

      // Get count of unique foods
      const { count: foodsCount, error: foodsError } = await supabase
        .from('foods')
        .select('id', { count: 'exact', head: true });
      
      if (foodsError) {
        console.error("Error fetching unique foods count:", foodsError);
        stats.uniqueFoods = 0;
      } else {
        stats.uniqueFoods = foodsCount || 0;
      }

      // Get count of unique users (from user_favorites and weight_logs tables)
      const { data: userFavoritesData, error: userFavoritesError } = await supabase
        .from('user_favorites')
        .select('user_id');
      
      const { data: weightLogsData, error: weightLogsError } = await supabase
        .from('weight_logs')
        .select('user_id');
      
      if (userFavoritesError) {
        console.error("Error fetching user favorites:", userFavoritesError);
      }
      
      if (weightLogsError) {
        console.error("Error fetching weight logs:", weightLogsError);
      }
      
      // Combine user IDs from both tables and count unique ones
      const userIds = new Set<string>();
      
      if (userFavoritesData) {
        userFavoritesData.forEach(item => userIds.add(item.user_id));
      }
      
      if (weightLogsData) {
        weightLogsData.forEach(item => userIds.add(item.user_id));
      }
      
      stats.uniqueUsers = userIds.size;
      
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

  const copyToClipboard = (text: string, tableName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(tableName);
    
    toast({
      title: "Copied to clipboard",
      description: `SQL script for ${tableName} table copied`,
      duration: 2000,
    });
    
    setTimeout(() => {
      setCopiedScript(null);
    }, 2000);
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
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="config">
                  <Database className="h-4 w-4 mr-2" />
                  Supabase Configuration
                </TabsTrigger>
                <TabsTrigger value="tables">
                  <Code className="h-4 w-4 mr-2" />
                  Create Tables
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="config">
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
                                
                                {/* Updated card styles to match others */}
                                <div className="bg-card/50 p-2 rounded-md">
                                  <p className="text-xs text-muted-foreground flex items-center">
                                    <Database className="h-3 w-3 mr-1" />
                                    Unique Foods
                                  </p>
                                  <p className="text-lg font-semibold">{dbStats.uniqueFoods}</p>
                                </div>
                                
                                <div className="bg-card/50 p-2 rounded-md">
                                  <p className="text-xs text-muted-foreground flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    Unique Users
                                  </p>
                                  <p className="text-lg font-semibold">{dbStats.uniqueUsers}</p>
                                </div>
                                
                                {/* Table row counts */}
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
              </TabsContent>
              
              <TabsContent value="tables">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Code className="mr-2 h-5 w-5" />
                      Create Database Tables
                    </CardTitle>
                    <CardDescription>
                      Use these SQL scripts in your Supabase SQL Editor to create the required tables
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="rounded-md bg-amber-50 dark:bg-amber-950/50 p-3 text-sm">
                        <p className="text-amber-800 dark:text-amber-200">
                          <span className="font-semibold">Instructions:</span> Copy these SQL scripts and run them in your Supabase SQL Editor. 
                          Go to your Supabase dashboard, navigate to the SQL Editor section, paste the script, and click "Run".
                        </p>
                      </div>
                      
                      <ScrollArea className="h-[400px] rounded-md border p-4">
                        {Object.entries(createTableScripts).map(([tableName, script]) => (
                          <div key={tableName} className="mb-6 last:mb-0">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-md font-semibold">{tableName}</h3>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => copyToClipboard(script, tableName)}
                                className="h-7"
                              >
                                {copiedScript === tableName ? (
                                  <><Check className="h-3.5 w-3.5 mr-1" /> Copied</>
                                ) : (
                                  <><Copy className="h-3.5 w-3.5 mr-1" /> Copy</>
                                )}
                              </Button>
                            </div>
                            <pre className="bg-black font-mono text-green-400 p-3 rounded-md text-xs overflow-x-auto">
                              {script}
                            </pre>
                          </div>
                        ))}
                        
                        <div className="mt-4">
                          <h3 className="text-md font-semibold mb-2">Enable UUID Extension</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Run this first to enable UUID generation:
                          </p>
                          <pre className="bg-black font-mono text-green-400 p-3 rounded-md text-xs">
                            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
                          </pre>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => copyToClipboard('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', 'uuid-extension')}
                            className="mt-2 h-7"
                          >
                            {copiedScript === 'uuid-extension' ? (
                              <><Check className="h-3.5 w-3.5 mr-1" /> Copied</>
                            ) : (
                              <><Copy className="h-3.5 w-3.5 mr-1" /> Copy</>
                            )}
                          </Button>
                        </div>
                        
                        <div className="mt-6">
                          <h3 className="text-md font-semibold mb-2">Run All Tables Script</h3>
                          <Button 
                            onClick={() => copyToClipboard(
                              'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n' + 
                              Object.values(createTableScripts).join('\n\n'),
                              'all-tables'
                            )}
                            className="w-full"
                          >
                            {copiedScript === 'all-tables' ? (
                              <><Check className="h-4 w-4 mr-1" /> Copied All Scripts</>
                            ) : (
                              <><Copy className="h-4 w-4 mr-1" /> Copy All Table Scripts</>
                            )}
                          </Button>
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </motion.div>
      
      <EnvSetupDialog open={showEnvSetup} onOpenChange={setShowEnvSetup} />
    </div>
  );
};

export default AdminPage;

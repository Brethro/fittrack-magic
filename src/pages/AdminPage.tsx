
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import EnvSetupDialog from "@/components/EnvSetupDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Code, Users } from "lucide-react";
import { ValidTable } from "@/lib/supabase/db-helpers";

// Import refactored components
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfigurationTab } from "@/components/admin/ConfigurationTab";
import { TablesTab } from "@/components/admin/TablesTab";
import { UsersTab } from "@/components/admin/UsersTab";

// Constants
const ADMIN_AUTH_KEY = "fittrack_admin_auth";

// Types
type UserSearchResult = {
  id: string;
  email?: string;
  lastSignIn?: string;
  createdAt?: string;
  source?: string;
};

type SupabaseAuthUser = {
  id: string;
  email?: string;
  last_sign_in_at?: string;
  created_at?: string;
};

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
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(false);
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
  
  // User management state
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [adminCodeAuthenticated, setAdminCodeAuthenticated] = useState(false);

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
      const { data, error } = await supabase.from('foods' as ValidTable).select('id').limit(1);
      
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
      const tables = ['foods', 'food_nutrients', 'user_favorites', 'search_logs', 'weight_logs'] as const;
      
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
        userFavoritesData.forEach(item => {
          if (item && typeof item === 'object' && 'user_id' in item) {
            userIds.add(item.user_id as string);
          }
        });
      }
      
      if (weightLogsData) {
        weightLogsData.forEach(item => {
          if (item && typeof item === 'object' && 'user_id' in item) {
            userIds.add(item.user_id as string);
          }
        });
      }
      
      stats.uniqueUsers = userIds.size;
      
      setDbStats(stats);
    } catch (error) {
      console.error("Error fetching database stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = (rememberMe: boolean) => {
    setAuthenticated(true);
    
    // Save authentication state if remember me is checked
    if (rememberMe) {
      localStorage.setItem(ADMIN_AUTH_KEY, "true");
    }
    
    // Check Supabase connection after authentication
    checkSupabaseConnection();
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setAdminCodeAuthenticated(false);
    localStorage.removeItem(ADMIN_AUTH_KEY);
    toast({
      title: "Logged out",
      description: "You have been logged out of the admin panel",
    });
  };

  const handleResetSupabaseConfig = () => {
    setShowEnvSetup(true);
  };

  // User management functions
  const searchUsers = async (query: string) => {
    if (!adminCodeAuthenticated) {
      toast({
        title: "Admin authorization required",
        description: "Additional authentication is required for user management",
      });
      return;
    }

    if (!query.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter an email or user ID to search for",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingUsers(true);
    setSearchResults([]);
    
    try {
      // First try to search by user_id in the tables that reference users
      const tables = ['user_favorites', 'weight_logs'] as const;
      let foundUsers = new Map<string, UserSearchResult>();
      
      for (const table of tables) {
        // Search by exact user_id match
        if (query.length >= 36) { // UUID is 36 chars
          const { data, error } = await supabase
            .from(table)
            .select('user_id')
            .eq('user_id', query)
            .limit(10);
          
          if (error) {
            console.error(`Error searching ${table}:`, error);
          } else if (data && data.length > 0) {
            data.forEach(item => {
              if (item && typeof item === 'object' && 'user_id' in item) {
                foundUsers.set(item.user_id as string, { id: item.user_id as string, source: table });
              }
            });
          }
        }
      }
      
      // Then search auth.users if we have admin access - now restricted
      try {
        // Only attempt if we have the proper admin code authentication
        if (adminCodeAuthenticated) {
          const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 20,
          });
          
          if (!authError && authUsers) {
            // Filter users by the search query
            const users = authUsers.users as SupabaseAuthUser[];
            
            const filteredUsers = users.filter(user => 
              (user.email && user.email.toLowerCase().includes(query.toLowerCase())) ||
              user.id.includes(query)
            );
            
            filteredUsers.forEach(user => {
              foundUsers.set(user.id, { 
                id: user.id, 
                email: user.email,
                lastSignIn: user.last_sign_in_at,
                createdAt: user.created_at
              });
            });
          }
        }
      } catch (authListError) {
        console.error("Error listing auth users:", authListError);
        // This will likely fail in most cases unless the user has admin rights
      }
      
      // Convert the Map to an array
      const results = Array.from(foundUsers.values());
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No users found",
          description: "No users match your search criteria",
        });
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Error searching users",
        description: "An error occurred while searching for users",
        variant: "destructive",
      });
    } finally {
      setIsSearchingUsers(false);
    }
  };
  
  const getUserDetails = async (userId: string) => {
    if (!adminCodeAuthenticated) {
      toast({
        title: "Admin authorization required",
        description: "Additional authentication is required for user management",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Gather user data from various tables
      const userDetails: any = { id: userId, data: {} };
      
      // Check for weight logs
      const { data: weightLogs, error: weightLogsError } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId);
      
      if (weightLogsError) {
        console.error("Error fetching weight logs:", weightLogsError);
      } else {
        userDetails.data.weightLogs = weightLogs || [];
      }
      
      // Check for favorites
      const { data: favorites, error: favoritesError } = await supabase
        .from('user_favorites')
        .select('*, foods(name)')
        .eq('user_id', userId);
        
      if (favoritesError) {
        console.error("Error fetching favorites:", favoritesError);
      } else {
        userDetails.data.favorites = favorites || [];
      }
      
      setSelectedUser(userDetails);
    } catch (error) {
      console.error("Error getting user details:", error);
      toast({
        title: "Error fetching user details",
        description: "Could not retrieve complete user information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteUserData = async (userId: string) => {
    if (!adminCodeAuthenticated) {
      toast({
        title: "Admin authorization required",
        description: "Additional authentication is required for user management",
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      // Delete from weight_logs
      const { error: weightLogsError } = await supabase
        .from('weight_logs')
        .delete()
        .eq('user_id', userId);
      
      if (weightLogsError) {
        throw new Error(`Error deleting weight logs: ${weightLogsError.message}`);
      }
      
      // Delete from user_favorites
      const { error: favoritesError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId);
      
      if (favoritesError) {
        throw new Error(`Error deleting favorites: ${favoritesError.message}`);
      }
      
      // Try to delete the auth user (requires admin privileges)
      if (adminCodeAuthenticated) {
        try {
          const { error: authError } = await supabase.auth.admin.deleteUser(userId);
          
          if (authError) {
            console.warn("Could not delete auth user (may require higher privileges):", authError);
          }
        } catch (authDeleteError) {
          console.warn("Auth user deletion failed (likely insufficient permissions):", authDeleteError);
        }
      }
      
      toast({
        title: "User data deleted",
        description: "All user data has been successfully removed from the database",
      });
      
      // Update UI
      setSelectedUser(null);
      setSearchResults(searchResults.filter(user => user.id !== userId));
      
      // Refresh database stats
      fetchDatabaseStats();
    } catch (error: any) {
      console.error("Error deleting user data:", error);
      toast({
        title: "Error deleting user data",
        description: error.message || "An error occurred while deleting user data",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!authenticated ? (
          <AdminLoginForm onAuthenticate={handleAuthenticate} />
        ) : (
          <div className="space-y-6">
            <AdminHeader onLogout={handleLogout} />
            
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
                <TabsTrigger value="users">
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="config">
                <ConfigurationTab 
                  supabaseStatus={supabaseStatus}
                  dbStats={dbStats}
                  isLoading={isLoading}
                  onResetConfig={handleResetSupabaseConfig}
                  onRetryConnection={checkSupabaseConnection}
                  onRefreshStats={fetchDatabaseStats}
                />
              </TabsContent>
              
              <TabsContent value="tables">
                <TablesTab createTableScripts={createTableScripts} />
              </TabsContent>
              
              <TabsContent value="users">
                <UsersTab 
                  adminCodeAuthenticated={adminCodeAuthenticated}
                  onAdminCodeVerify={() => setAdminCodeAuthenticated(true)}
                  isSearchingUsers={isSearchingUsers}
                  isLoading={isLoading}
                  searchResults={searchResults}
                  selectedUser={selectedUser}
                  isDeleting={isDeleting}
                  onSearchUsers={searchUsers}
                  onGetUserDetails={getUserDetails}
                  onDeleteUserData={deleteUserData}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </motion.div>

      {/* Environment setup dialog */}
      <EnvSetupDialog 
        open={showEnvSetup} 
        onOpenChange={setShowEnvSetup} 
        onConfigSaved={() => {
          toast({
            title: "Configuration updated",
            description: "Supabase configuration has been updated. Reconnecting...",
          });
          checkSupabaseConnection();
        }}
      />
    </div>
  );
};

export default AdminPage;

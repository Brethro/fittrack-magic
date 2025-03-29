
import { supabase, fetcher } from './client';
import { 
  selectFilteredFromTable, 
  deleteFromTable 
} from './db-helpers';

// Utils for user management with improved security
export const userDb = {
  // Get user by ID
  async getUserById(userId: string) {
    try {
      // Verify the requesting user is authorized
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id || session.session.user.id !== userId) {
        console.error("Unauthorized access attempt to user data");
        return null;
      }
      
      // This only works for projects with admin access - for most users it will fail
      // Since we can't directly access the admin API properly, use user session instead
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Error fetching user by ID:", error);
        return null;
      }
      
      return data.user;
    } catch (error) {
      console.error("Error in getUserById:", error);
      return null;
    }
  },
  
  // Get user data from application database tables
  async getUserData(userId: string) {
    try {
      // Verify the requesting user is authorized
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id || session.session.user.id !== userId) {
        console.error("Unauthorized access attempt to user data");
        throw new Error("Unauthorized access");
      }
      
      const userData: any = { userId };
      
      // Get weight logs
      const weightLogsResponse = await selectFilteredFromTable(
        supabase,
        'weight_logs',
        'user_id',
        userId,
        '*'
      );
        
      userData.weightLogs = weightLogsResponse.data || [];
      
      // Get favorites
      const favoritesResponse = await selectFilteredFromTable(
        supabase,
        'user_favorites',
        'user_id',
        userId,
        '*, foods(id, name)'
      );
        
      userData.favorites = favoritesResponse.data || [];
      
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  },
  
  // Delete all user data from the application
  async deleteUserData(userId: string) {
    try {
      // Verify the requesting user is authorized to delete their own data
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id || session.session.user.id !== userId) {
        console.error("Unauthorized attempt to delete user data");
        throw new Error("Unauthorized access");
      }
      
      // Delete from weight_logs
      const { error: weightLogsError } = await deleteFromTable(
        supabase,
        'weight_logs',
        'user_id',
        userId
      );
      
      if (weightLogsError) {
        throw weightLogsError;
      }
      
      // Delete from user_favorites
      const { error: favoritesError } = await deleteFromTable(
        supabase,
        'user_favorites',
        'user_id',
        userId
      );
      
      if (favoritesError) {
        throw favoritesError;
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting user data:", error);
      throw error;
    }
  },
  
  // ADMIN ONLY: Search for users - restricted by authentication
  async searchUsers(query: string, adminSecret: string) {
    try {
      // Verify admin credentials are provided
      if (!adminSecret || adminSecret !== import.meta.env.VITE_ADMIN_SECRET) {
        console.error("Unauthorized admin access attempt");
        throw new Error("Admin authentication required");
      }
      
      // This is a placeholder - in a real app, you would implement
      // a secure admin-only endpoint through a serverless function
      // that requires proper authentication
      console.log("Admin search for users with query:", query);
      
      // Return empty results for security
      return [];
    } catch (error) {
      console.error("Error in admin searchUsers:", error);
      throw error;
    }
  }
};

// User-related types
export type UserDataResult = {
  userId: string;
  weightLogs: Array<{
    id: string;
    date: string;
    weight: number;
    notes?: string;
    created_at: string;
  }>;
  favorites: UserFavorite[];
};

export type UserSearchResult = {
  id: string;
  email?: string;
  last_sign_in_at?: string;
  created_at?: string;
};

// Import this type to avoid circular dependencies
type UserFavorite = {
  id: string;
  user_id: string;
  food_id: string;
  created_at: string;
  foods: {
    id: string;
    name: string;
  };
};

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Check for Supabase credentials in various places
const getEnvVariable = (key: string): string => {
  // Check sessionStorage first (for dynamically set values)
  const sessionValue = window.sessionStorage.getItem(key);
  if (sessionValue) return sessionValue;
  
  // Then check environment variables
  const envValue = import.meta.env[key];
  if (envValue) return envValue;
  
  return '';
};

// Initialize Supabase client
const supabaseUrl = getEnvVariable('VITE_SUPABASE_URL') || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = getEnvVariable('VITE_SUPABASE_ANON_KEY') || 'placeholder-key';

// Log appropriate warning
if (supabaseUrl === 'https://placeholder-url.supabase.co') {
  console.warn(
    'Missing Supabase URL. Please configure via environment variables or the setup dialog.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Create a typed helper function to fetch data
export async function fetcher<T>(
  query: Promise<{ data: T; error: any }>
): Promise<T> {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Utils for food database interactions
export const foodDb = {
  // Food search function
  async searchFoods(query: string, limit = 10) {
    const response = await supabase
      .from('foods')
      .select('*, food_nutrients(*)')
      .textSearch('name', query)
      .limit(limit);
    
    return fetcher(Promise.resolve(response));
  },

  // Get a food by ID
  async getFoodById(id: string) {
    const response = await supabase
      .from('foods')
      .select('*, food_nutrients(*)')
      .eq('id', id)
      .single();
    
    return fetcher(Promise.resolve(response));
  },

  // Save a food from external API to database
  async saveFood(food: any, source: string, sourceId: string) {
    // First check if food already exists to prevent duplicates
    const { data: existingFood } = await supabase
      .from('foods')
      .select('id')
      .eq('source', source)
      .eq('source_id', sourceId)
      .maybeSingle();

    if (existingFood) {
      return existingFood.id;
    }

    // Insert new food
    const { data: newFood, error } = await supabase
      .from('foods')
      .insert({
        name: food.description || food.foodName || food.product_name,
        description: food.ingredients || '',
        brand: food.brandName || food.brands || '',
        source,
        source_id: sourceId,
        category: food.foodCategory || food.categories || '',
        serving_size: food.servingSize || 100,
        serving_unit: food.servingSizeUnit || 'g',
        household_serving: food.householdServingFullText || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;

    // Extract nutrition data
    const nutritionData = food.nutrition || 
                         (food.foodNutrients ? extractNutritionFromUsda(food) : {});

    // Insert nutrition data
    await supabase.from('food_nutrients').insert({
      food_id: newFood.id,
      calories: nutritionData.calories || 0,
      protein: nutritionData.protein || 0,
      carbs: nutritionData.carbs || 0,
      fat: nutritionData.fat || 0,
      fiber: nutritionData.fiber || 0,
      sugar: nutritionData.sugars || 0,
      other_nutrients: {} // Empty JSON for now
    });

    return newFood.id;
  },

  // Log search query
  async logSearch(query: string, source: string, resultsCount: number) {
    await supabase.from('search_logs').insert({
      query,
      source,
      results_count: resultsCount,
      created_at: new Date().toISOString()
    });
  },

  // Add food to user favorites
  async addToFavorites(userId: string, foodId: string) {
    const response = await supabase.from('user_favorites').insert({
      user_id: userId,
      food_id: foodId,
      created_at: new Date().toISOString()
    });
    
    return fetcher(Promise.resolve(response));
  },

  // Get user's favorite foods
  async getFavorites(userId: string) {
    const response = await supabase
      .from('user_favorites')
      .select('*, foods(*, food_nutrients(*))')
      .eq('user_id', userId);
    
    return fetcher(Promise.resolve(response));
  }
};

// Utils for user management
export const userDb = {
  // Get user by ID
  async getUserById(userId: string) {
    try {
      // This only works for projects with admin access - for most users it will fail
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      
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
      const userData: any = { userId };
      
      // Get weight logs
      const weightLogsResponse = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId);
        
      userData.weightLogs = weightLogsResponse.data || [];
      
      // Get favorites
      const favoritesResponse = await supabase
        .from('user_favorites')
        .select('*, foods(id, name)')
        .eq('user_id', userId);
        
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
      // Delete from weight_logs
      const { error: weightLogsError } = await supabase
        .from('weight_logs')
        .delete()
        .eq('user_id', userId);
      
      if (weightLogsError) {
        throw weightLogsError;
      }
      
      // Delete from user_favorites
      const { error: favoritesError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId);
      
      if (favoritesError) {
        throw favoritesError;
      }
      
      // Try to delete the auth user (requires admin privileges)
      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch (error) {
        console.warn("Could not delete auth user (may require admin privileges):", error);
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting user data:", error);
      throw error;
    }
  }
};

// Helper to extract nutrition info from USDA food format
function extractNutritionFromUsda(usdaFood: any) {
  const nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugars: 0
  };

  // Map USDA nutrient IDs to our properties
  const nutrientMap: Record<number, keyof typeof nutrition> = {
    1008: 'calories', // Energy (kcal)
    1003: 'protein',  // Protein
    1005: 'carbs',    // Carbohydrates
    1004: 'fat',      // Total lipids (fat)
    1079: 'fiber',    // Fiber
    2000: 'sugars'    // Total sugars
  };

  // Extract values from USDA format
  if (usdaFood.foodNutrients) {
    usdaFood.foodNutrients.forEach((nutrient: any) => {
      const id = nutrient.nutrientId || nutrient.nutrient?.id;
      if (id && nutrientMap[id]) {
        nutrition[nutrientMap[id]] = nutrient.value || 0;
      }
    });
  }

  return nutrition;
}

// Types for search results
export type FoodSearchResult = {
  id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  source: string;
  source_id: string;
  serving_size: number;
  serving_unit: string;
  household_serving: string;
  food_nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
};

export type UserFavorite = {
  id: string;
  user_id: string;
  food_id: string;
  created_at: string;
  foods: FoodSearchResult;
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

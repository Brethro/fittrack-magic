
import { supabase, fetcher } from './client';
import { extractNutritionFromUsda } from './utils';
import { 
  insertIntoTable, 
  selectFromTable, 
  selectFilteredFromTable 
} from './db-helpers';
import { TablesInsertProps } from '../../types/supabase';

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
    const response = await selectFromTable(
      supabase,
      'public',
      'foods',
      '*, food_nutrients(*)'
    ).eq('id', id as any).single();
    
    return fetcher(Promise.resolve(response));
  },

  // Save a food from external API to database
  // This function can be used by any user - we'll rely on RLS policies
  // to control access, not client-side checks
  async saveFood(food: any, source: string, sourceId: string) {
    // First check if food already exists to prevent duplicates
    const { data: existingFood } = await selectFilteredFromTable(
      supabase,
      'public',
      'foods',
      'source',
      source as any
    ).eq('source_id', sourceId as any).maybeSingle();

    if (existingFood) {
      return existingFood.id;
    }

    // Insert new food
    const foodData: TablesInsertProps<'foods'> = {
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
    };

    const { data: newFood, error } = await insertIntoTable(
      supabase,
      'public',
      'foods',
      foodData
    ).select('id').single();

    if (error) throw error;

    // Extract nutrition data
    const nutritionData = food.nutrition || 
                         (food.foodNutrients ? extractNutritionFromUsda(food) : {});

    // Insert nutrition data
    const nutrientData: TablesInsertProps<'food_nutrients'> = {
      food_id: newFood.id,
      calories: nutritionData.calories || 0,
      protein: nutritionData.protein || 0,
      carbs: nutritionData.carbs || 0,
      fat: nutritionData.fat || 0,
      fiber: nutritionData.fiber || 0,
      sugar: nutritionData.sugars || 0,
      other_nutrients: {}
    };

    await insertIntoTable(
      supabase,
      'public',
      'food_nutrients',
      nutrientData
    );

    return newFood.id;
  },

  // Log search query
  async logSearch(query: string, source: string, resultsCount: number) {
    const searchLogData: TablesInsertProps<'search_logs'> = {
      query,
      source,
      results_count: resultsCount,
      created_at: new Date().toISOString()
    };

    await insertIntoTable(
      supabase,
      'public',
      'search_logs',
      searchLogData
    );
  },

  // Admin-only: Update an existing food entry
  async updateFood(foodId: string, foodData: any, adminKey?: string) {
    // This function should only be used by admins
    // RLS policies will enforce this on the backend
    const response = await supabase
      .from('foods')
      .update(foodData)
      .eq('id', foodId as any)
      .select();
    
    return fetcher(Promise.resolve(response));
  },

  // Add food to user favorites
  async addToFavorites(userId: string, foodId: string) {
    // Verify user is authenticated before adding favorites
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user.id || session.data.session.user.id !== userId) {
      throw new Error("User must be authenticated to add favorites");
    }
    
    const favoriteData: TablesInsertProps<'user_favorites'> = {
      user_id: userId,
      food_id: foodId,
      created_at: new Date().toISOString()
    };

    const response = await insertIntoTable(
      supabase,
      'public',
      'user_favorites',
      favoriteData
    );
    
    return fetcher(Promise.resolve(response));
  },

  // Get user's favorite foods
  async getFavorites(userId: string) {
    // Verify user is authenticated before getting favorites
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user.id || session.data.session.user.id !== userId) {
      throw new Error("User must be authenticated to view favorites");
    }
    
    const response = await selectFromTable(
      supabase,
      'public',
      'user_favorites',
      '*, foods(*, food_nutrients(*))'
    ).eq('user_id', userId as any);
    
    return fetcher(Promise.resolve(response));
  }
};

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

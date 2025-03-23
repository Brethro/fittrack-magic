import { FoodItem, FoodPrimaryCategory } from "@/types/diet";

// API endpoints
const BASE_URL = "https://world.openfoodfacts.org/api/v2";
const SEARCH_URL = `${BASE_URL}/search`;

// Types specific to Open Food Facts API
interface OpenFoodFactsResponse {
  count: number;
  page: number;
  page_count: number;
  page_size: number;
  products: OpenFoodFactsProduct[];
}

interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  product_name_en?: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number;
  nutriments?: {
    energy_100g?: number;
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    "saturated-fat_100g"?: number;
    cholesterol_100g?: number;
    sodium_100g?: number;
    "vitamin-a_100g"?: number;
    "vitamin-c_100g"?: number;
    "vitamin-d_100g"?: number;
    calcium_100g?: number;
    iron_100g?: number;
    potassium_100g?: number;
  };
  categories_tags?: string[];
  ingredients_analysis_tags?: string[];
}

// Cache for food search results
const foodSearchCache: Record<string, {timestamp: number, results: FoodItem[]}> = {};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// API call timeout - 5 seconds max
const API_TIMEOUT = 5000;

// Create a timeout promise
const timeoutPromise = (ms: number) => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
};

/**
 * Search for food items in Open Food Facts database
 */
export const searchFoods = async (query: string, page = 1, pageSize = 20): Promise<FoodItem[]> => {
  // Check cache first
  const cacheKey = `${query}-${page}-${pageSize}`;
  const cachedData = foodSearchCache[cacheKey];
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
    console.log("Using cached food search results");
    return cachedData.results;
  }
  
  // Parameters for the API request
  const params = new URLSearchParams({
    search_terms: query,
    page_size: pageSize.toString(),
    page: page.toString(),
    fields: "code,product_name,product_name_en,brands,nutriments,categories_tags,serving_size,serving_quantity,ingredients_analysis_tags",
  });
  
  try {
    console.log(`Searching Open Food Facts for "${query}"`);
    
    // Race between the fetch and a timeout
    const response = await Promise.race([
      fetch(`${SEARCH_URL}?${params.toString()}`),
      timeoutPromise(API_TIMEOUT)
    ]);
    
    if (!response.ok) {
      throw new Error(`Open Food Facts API error: ${response.status}`);
    }
    
    const data: OpenFoodFactsResponse = await response.json();
    const foodItems = data.products.map(mapProductToFoodItem);
    
    // Cache the results
    foodSearchCache[cacheKey] = {
      timestamp: now,
      results: foodItems
    };
    
    return foodItems;
  } catch (error) {
    console.error("Error searching Open Food Facts:", error);
    // Return empty array but don't throw - let calling code handle gracefully
    return [];
  }
};

/**
 * Get food details by barcode
 */
export const getFoodByBarcode = async (barcode: string): Promise<FoodItem | null> => {
  try {
    // Race between the fetch and a timeout
    const response = await Promise.race([
      fetch(`${BASE_URL}/product/${barcode}`),
      timeoutPromise(API_TIMEOUT)
    ]);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Open Food Facts API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.product) {
      return null;
    }
    
    return mapProductToFoodItem(data.product);
  } catch (error) {
    console.error(`Error getting food by barcode ${barcode}:`, error);
    return null;
  }
};

/**
 * Map Open Food Facts product to our FoodItem format
 */
const mapProductToFoodItem = (product: OpenFoodFactsProduct): FoodItem => {
  // Extract basic product info
  const name = product.product_name_en || product.product_name || "Unknown Food";
  
  // Determine serving size
  let servingSize = product.serving_size || "100g";
  const servingSizeGrams = product.serving_quantity || 100;
  
  // Extract nutriments - default to per 100g values if per serving not available
  const nutriments = product.nutriments || {};
  
  // Calculate calories (handling different energy units)
  const caloriesPerServing = nutriments["energy-kcal_100g"] || 
    (nutriments.energy_100g ? nutriments.energy_100g / 4.184 : 0);
  
  // Map categories to determine primary category
  let primaryCategory: FoodPrimaryCategory = "other";
  const categories = product.categories_tags || [];
  
  if (categories.some(c => c.includes("meat") && !c.includes("substitute"))) {
    primaryCategory = "meat";
    if (categories.some(c => c.includes("poultry") || c.includes("chicken") || c.includes("turkey"))) {
      primaryCategory = "poultry";
    } else if (categories.some(c => c.includes("beef") || c.includes("pork") || c.includes("lamb"))) {
      primaryCategory = "redMeat";
    }
  } else if (categories.some(c => c.includes("fish"))) {
    primaryCategory = "fish";
  } else if (categories.some(c => c.includes("seafood"))) {
    primaryCategory = "seafood";
    if (categories.some(c => c.includes("shellfish") || c.includes("crab") || c.includes("lobster") || c.includes("shrimp"))) {
      primaryCategory = "shellfish";
    }
  } else if (categories.some(c => c.includes("dairy") || c.includes("milk") || c.includes("cheese") || c.includes("yogurt"))) {
    primaryCategory = "dairy";
  } else if (categories.some(c => c.includes("egg"))) {
    primaryCategory = "egg";
  } else if (categories.some(c => c.includes("grain") || c.includes("cereal") || c.includes("bread") || c.includes("pasta"))) {
    primaryCategory = "grain";
  } else if (categories.some(c => c.includes("legume") || c.includes("bean") || c.includes("lentil") || c.includes("pea"))) {
    primaryCategory = "legume";
  } else if (categories.some(c => c.includes("vegetable"))) {
    primaryCategory = "vegetable";
  } else if (categories.some(c => c.includes("fruit"))) {
    primaryCategory = "fruit";
  } else if (categories.some(c => c.includes("nut"))) {
    primaryCategory = "nut";
  } else if (categories.some(c => c.includes("seed"))) {
    primaryCategory = "seed";
  } else if (categories.some(c => c.includes("oil"))) {
    primaryCategory = "oil";
  } else if (categories.some(c => c.includes("sweetener") || c.includes("sugar"))) {
    primaryCategory = "sweetener";
  } else if (categories.some(c => c.includes("herb"))) {
    primaryCategory = "herb";
  } else if (categories.some(c => c.includes("spice"))) {
    primaryCategory = "spice";
  } else if (categories.some(c => 
    c.includes("processed") || 
    c.includes("snack") || 
    c.includes("prepared") || 
    c.includes("canned"))) {
    primaryCategory = "processedFood";
  }
  
  // Determine diet compatibility
  const diets: string[] = [];
  const ingredientsTags = product.ingredients_analysis_tags || [];
  
  if (!categories.some(c => c.includes("meat") || c.includes("fish") || c.includes("seafood"))) {
    diets.push("vegetarian");
    
    if (!categories.some(c => c.includes("dairy") || c.includes("egg"))) {
      diets.push("vegan");
    }
  }
  
  if (categories.some(c => c.includes("fish") || c.includes("seafood")) && 
      !categories.some(c => c.includes("meat") && !c.includes("fish"))) {
    diets.push("pescatarian");
  }
  
  // Add diet detection based on additional tags
  if (ingredientsTags.some(tag => tag.includes("palm-oil-free"))) {
    diets.push("palm-oil-free");
  }
  
  if (ingredientsTags.some(tag => tag.includes("vegan"))) {
    if (!diets.includes("vegan")) diets.push("vegan");
  }
  
  if (ingredientsTags.some(tag => tag.includes("vegetarian"))) {
    if (!diets.includes("vegetarian")) diets.push("vegetarian");
  }
  
  // Detect low-carb foods
  if ((nutriments.carbohydrates_100g || 0) < 10) {
    diets.push("low-carb");
    
    // Foods very low in carbs might be keto-compatible
    if ((nutriments.carbohydrates_100g || 0) < 5 && (nutriments.fat_100g || 0) > 10) {
      diets.push("keto");
    }
  }
  
  // Detect high-protein foods
  if ((nutriments.proteins_100g || 0) > 20) {
    diets.push("high-protein");
  }
  
  // Create and return the FoodItem
  return {
    id: `off_${product.code}`,
    name,
    protein: nutriments.proteins_100g || 0,
    carbs: nutriments.carbohydrates_100g || 0,
    fats: nutriments.fat_100g || 0,
    caloriesPerServing: Math.round(caloriesPerServing),
    fiber: nutriments.fiber_100g || 0,
    sugars: nutriments.sugars_100g || 0,
    saturatedFat: nutriments["saturated-fat_100g"] || 0,
    cholesterol: (nutriments.cholesterol_100g || 0) * 1000, // Convert to mg
    sodium: (nutriments.sodium_100g || 0) * 1000, // Convert to mg
    vitaminA: nutriments["vitamin-a_100g"] || 0,
    vitaminC: nutriments["vitamin-c_100g"] || 0,
    vitaminD: nutriments["vitamin-d_100g"] || 0,
    calcium: nutriments.calcium_100g || 0,
    iron: nutriments.iron_100g || 0,
    potassium: nutriments.potassium_100g || 0,
    servingSize,
    servingSizeGrams,
    diets,
    primaryCategory
  };
};

/**
 * Get foods by diet type from Open Food Facts
 */
export const getFoodsByDiet = async (dietType: string, page = 1, pageSize = 20): Promise<FoodItem[]> => {
  let searchTerm = "";
  
  // Map diet types to appropriate search terms
  switch(dietType) {
    case "vegan":
      searchTerm = "vegan";
      break;
    case "vegetarian":
      searchTerm = "vegetarian";
      break;
    case "pescatarian":
      searchTerm = "fish OR seafood";
      break;
    case "keto":
      searchTerm = "keto OR low-carb";
      break;
    case "mediterranean":
      searchTerm = "olive-oil OR fish OR nuts OR seeds";
      break;
    default:
      searchTerm = dietType;
  }
  
  return searchFoods(searchTerm, page, pageSize);
};

/**
 * Get popular or recommended foods (useful for initial loading)
 */
export const getPopularFoods = async (): Promise<FoodItem[]> => {
  // Check cache first
  const cacheKey = "popular-foods";
  const cachedData = foodSearchCache[cacheKey];
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
    console.log("Using cached popular foods");
    return cachedData.results;
  }
  
  // Parameters for the API request - get popular foods based on popularity
  const params = new URLSearchParams({
    sort_by: "popularity_key",
    page_size: "20",
    fields: "code,product_name,product_name_en,brands,nutriments,categories_tags,serving_size,serving_quantity,ingredients_analysis_tags",
  });
  
  try {
    // Race between the fetch and a timeout
    const response = await Promise.race([
      fetch(`${SEARCH_URL}?${params.toString()}`),
      timeoutPromise(API_TIMEOUT)
    ]);
    
    if (!response.ok) {
      throw new Error(`Open Food Facts API error: ${response.status}`);
    }
    
    const data: OpenFoodFactsResponse = await response.json();
    const foodItems = data.products.map(mapProductToFoodItem);
    
    // Cache the results
    foodSearchCache[cacheKey] = {
      timestamp: now,
      results: foodItems
    };
    
    return foodItems;
  } catch (error) {
    console.error("Error getting popular foods:", error);
    return [];
  }
};

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

// Cache for seen product IDs to avoid duplicates across sessions
const seenProductCodesSet = new Set<string>();

// API call timeout - 8 seconds max
const API_TIMEOUT = 8000;

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
  // Sanitize the query to ensure it's not causing issues
  const sanitizedQuery = query.trim().slice(0, 50);
  
  // Check cache first
  const cacheKey = `${sanitizedQuery}-${page}-${pageSize}`;
  const cachedData = foodSearchCache[cacheKey];
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
    console.log(`Using cached food search results for "${sanitizedQuery}"`);
    return cachedData.results;
  }
  
  // Add category filter to improve relevance - this helps with searches like "chicken breast"
  // by adding category filters for meat, poultry, etc.
  let categoryFilter = '';
  const lowerQuery = sanitizedQuery.toLowerCase();
  
  if (lowerQuery.includes('chicken') || lowerQuery.includes('turkey') || lowerQuery.includes('poultry')) {
    categoryFilter = '&tagtype_0=categories&tag_contains_0=contains&tag_0=poultry';
  } else if (lowerQuery.includes('beef') || lowerQuery.includes('pork') || lowerQuery.includes('steak')) {
    categoryFilter = '&tagtype_0=categories&tag_contains_0=contains&tag_0=meat';
  } else if (lowerQuery.includes('fish') || lowerQuery.includes('salmon') || lowerQuery.includes('tuna')) {
    categoryFilter = '&tagtype_0=categories&tag_contains_0=contains&tag_0=fish';
  } else if (lowerQuery.includes('vegetable') || lowerQuery.includes('broccoli') || lowerQuery.includes('carrot')) {
    categoryFilter = '&tagtype_0=categories&tag_contains_0=contains&tag_0=vegetables';
  } else if (lowerQuery.includes('fruit') || lowerQuery.includes('apple') || lowerQuery.includes('banana')) {
    categoryFilter = '&tagtype_0=categories&tag_contains_0=contains&tag_0=fruits';
  } else if (lowerQuery.includes('dairy') || lowerQuery.includes('milk') || lowerQuery.includes('cheese')) {
    categoryFilter = '&tagtype_0=categories&tag_contains_0=contains&tag_0=dairy';
  }
  
  // Parameters for the API request
  const params = new URLSearchParams({
    search_terms: sanitizedQuery,
    page_size: pageSize.toString(),
    page: page.toString(),
    fields: "code,product_name,product_name_en,brands,nutriments,categories_tags,serving_size,serving_quantity,ingredients_analysis_tags",
  });
  
  try {
    console.log(`Searching Open Food Facts for "${sanitizedQuery}"`);
    
    // Race between the fetch and a timeout
    const apiUrl = `${SEARCH_URL}?${params.toString()}${categoryFilter}`;
    console.log(`API URL: ${apiUrl}`);
    
    const response = await Promise.race([
      fetch(apiUrl),
      timeoutPromise(API_TIMEOUT)
    ]);
    
    if (!response.ok) {
      throw new Error(`Open Food Facts API error: ${response.status}`);
    }
    
    const data: OpenFoodFactsResponse = await response.json();
    
    if (!data.products || !Array.isArray(data.products)) {
      console.error("Invalid API response format:", data);
      return [];
    }
    
    // If no results from API with category filter but there are generic results, 
    // try generic search as fallback
    if (data.products.length === 0 && categoryFilter !== '') {
      console.log("No results with category filter, trying generic search");
      const genericResponse = await fetch(`${SEARCH_URL}?${params.toString()}`);
      if (genericResponse.ok) {
        const genericData: OpenFoodFactsResponse = await genericResponse.json();
        if (genericData.products && Array.isArray(genericData.products)) {
          data.products = genericData.products;
        }
      }
    }
    
    // Filter out products with inadequate data
    const validProducts = data.products.filter(product => 
      product.code && 
      (product.product_name || product.product_name_en) &&
      product.nutriments
    );
    
    console.log(`Found ${validProducts.length} valid products out of ${data.products.length}`);
    
    // Filter out duplicates based on product code
    const uniqueFoodItems: FoodItem[] = [];
    const processedCodes = new Set<string>();
    
    validProducts.forEach(product => {
      if (!product.code || processedCodes.has(product.code)) {
        return;
      }
      
      // Add to processed set
      processedCodes.add(product.code);
      
      // Only add if not seen before in this session
      if (!seenProductCodesSet.has(product.code)) {
        seenProductCodesSet.add(product.code);
        
        // Map and add to results
        const foodItem = mapProductToFoodItem(product);
        uniqueFoodItems.push(foodItem);
      }
    });
    
    // If no results from API match, provide fallback items
    if (uniqueFoodItems.length === 0) {
      const fallbackItem = createFallbackFoodItem(sanitizedQuery);
      uniqueFoodItems.push(fallbackItem);
    }
    
    // Sort results by relevance to query
    sortResultsByRelevance(uniqueFoodItems, sanitizedQuery);
    
    // Cache the results
    foodSearchCache[cacheKey] = {
      timestamp: now,
      results: uniqueFoodItems
    };
    
    return uniqueFoodItems;
  } catch (error) {
    console.error("Error searching Open Food Facts:", error);
    
    // Return fallback item on error
    const fallbackItem = createFallbackFoodItem(sanitizedQuery);
    return [fallbackItem];
  }
};

/**
 * Create a fallback food item when API returns no results
 */
const createFallbackFoodItem = (query: string): FoodItem => {
  // Determine likely category based on query
  let primaryCategory: FoodPrimaryCategory = "other";
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('chicken') || lowerQuery.includes('turkey')) {
    primaryCategory = "poultry";
  } else if (lowerQuery.includes('beef') || lowerQuery.includes('pork') || lowerQuery.includes('steak')) {
    primaryCategory = "redMeat";
  } else if (lowerQuery.includes('fish') || lowerQuery.includes('salmon') || lowerQuery.includes('tuna')) {
    primaryCategory = "fish";
  } else if (lowerQuery.includes('vegetable') || lowerQuery.includes('broccoli') || lowerQuery.includes('carrot')) {
    primaryCategory = "vegetable";
  } else if (lowerQuery.includes('fruit') || lowerQuery.includes('apple') || lowerQuery.includes('banana')) {
    primaryCategory = "fruit";
  } else if (lowerQuery.includes('dairy') || lowerQuery.includes('milk') || lowerQuery.includes('cheese')) {
    primaryCategory = "dairy";
  }
  
  // Create a baseline item with reasonable defaults
  return {
    id: `fallback_${query.replace(/\s+/g, '_')}_${Date.now()}`,
    name: query.charAt(0).toUpperCase() + query.slice(1),
    protein: primaryCategory === "poultry" || primaryCategory === "redMeat" || primaryCategory === "fish" ? 25 : 5,
    carbs: primaryCategory === "vegetable" || primaryCategory === "fruit" ? 15 : 0,
    fats: primaryCategory === "redMeat" ? 15 : primaryCategory === "poultry" ? 5 : 0,
    caloriesPerServing: 120,
    fiber: primaryCategory === "vegetable" || primaryCategory === "fruit" ? 5 : 0,
    sugars: primaryCategory === "fruit" ? 10 : 0,
    saturatedFat: primaryCategory === "redMeat" ? 5 : 0,
    cholesterol: primaryCategory === "redMeat" || primaryCategory === "poultry" ? 70 : 0,
    sodium: 50,
    servingSize: "100g",
    servingSizeGrams: 100,
    diets: getDefaultDiets(primaryCategory),
    primaryCategory
  };
};

/**
 * Get default diets for fallback items based on category
 */
const getDefaultDiets = (category: FoodPrimaryCategory): string[] => {
  switch (category) {
    case "vegetable":
    case "fruit":
    case "grain":
    case "legume":
    case "nut":
    case "seed":
    case "herb":
    case "spice":
      return ["vegetarian", "vegan"];
    case "fish":
    case "seafood":
      return ["pescatarian"];
    case "dairy":
    case "egg":
      return ["vegetarian"];
    default:
      return [];
  }
};

/**
 * Sort search results by relevance to the search query
 */
const sortResultsByRelevance = (items: FoodItem[], query: string) => {
  const lowerQuery = query.toLowerCase();
  
  items.sort((a, b) => {
    // Exact matches come first
    const aNameLower = a.name.toLowerCase();
    const bNameLower = b.name.toLowerCase();
    
    if (aNameLower === lowerQuery && bNameLower !== lowerQuery) return -1;
    if (bNameLower === lowerQuery && aNameLower !== lowerQuery) return 1;
    
    // Then starts with
    if (aNameLower.startsWith(lowerQuery) && !bNameLower.startsWith(lowerQuery)) return -1;
    if (bNameLower.startsWith(lowerQuery) && !aNameLower.startsWith(lowerQuery)) return 1;
    
    // Then contains
    if (aNameLower.includes(lowerQuery) && !bNameLower.includes(lowerQuery)) return -1;
    if (bNameLower.includes(lowerQuery) && !aNameLower.includes(lowerQuery)) return 1;
    
    // Default to alphabetical
    return aNameLower.localeCompare(bNameLower);
  });
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
  
  // Ensure the ID is truly unique by adding a random suffix
  const uniqueId = `off_${product.code}_${Math.floor(Math.random() * 1000000)}`;
  
  // Create and return the FoodItem
  return {
    id: uniqueId,
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
  let categoryFilter = "";
  
  // Map diet types to appropriate search terms
  switch(dietType) {
    case "vegan":
      searchTerm = "vegan";
      categoryFilter = "&tagtype_0=ingredients_analysis&tag_contains_0=contains&tag_0=vegan";
      break;
    case "vegetarian":
      searchTerm = "vegetarian";
      categoryFilter = "&tagtype_0=ingredients_analysis&tag_contains_0=contains&tag_0=vegetarian";
      break;
    case "pescatarian":
      searchTerm = "fish OR seafood";
      categoryFilter = "&tagtype_0=categories&tag_contains_0=contains&tag_0=fish";
      break;
    case "keto":
      searchTerm = "keto OR low-carb";
      break;
    case "mediterranean":
      searchTerm = "olive-oil OR fish OR nuts OR seeds";
      break;
    case "low-carb":
      searchTerm = "low-carb";
      break;
    case "high-protein":
      searchTerm = "protein";
      break;
    default:
      searchTerm = dietType;
  }
  
  // Parameters for the API request
  const params = new URLSearchParams({
    search_terms: searchTerm,
    page_size: pageSize.toString(),
    page: page.toString(),
    fields: "code,product_name,product_name_en,brands,nutriments,categories_tags,serving_size,serving_quantity,ingredients_analysis_tags",
  });
  
  try {
    console.log(`Searching for ${dietType} foods`);
    
    // Include the category filter if specified
    const apiUrl = `${SEARCH_URL}?${params.toString()}${categoryFilter}`;
    
    // Race between the fetch and a timeout
    const response = await Promise.race([
      fetch(apiUrl),
      timeoutPromise(API_TIMEOUT)
    ]);
    
    if (!response.ok) {
      throw new Error(`Open Food Facts API error: ${response.status}`);
    }
    
    const data: OpenFoodFactsResponse = await response.json();
    
    if (!data.products || !Array.isArray(data.products)) {
      console.error("Invalid API response format:", data);
      return [];
    }
    
    // Filter out products with inadequate data
    const validProducts = data.products.filter(product => 
      product.code && 
      (product.product_name || product.product_name_en) &&
      product.nutriments
    );
    
    // Filter out duplicates
    const uniqueFoodItems: FoodItem[] = [];
    const processedCodes = new Set<string>();
    
    validProducts.forEach(product => {
      if (!product.code || processedCodes.has(product.code)) {
        return;
      }
      
      // Add to processed set
      processedCodes.add(product.code);
      
      // Only add if not seen before in this session
      if (!seenProductCodesSet.has(product.code)) {
        seenProductCodesSet.add(product.code);
        
        // Map and add to results
        const foodItem = mapProductToFoodItem(product);
        
        // For diet-specific searches, ensure the item actually belongs to that diet
        if (foodItem.diets?.includes(dietType) || dietType === "all") {
          uniqueFoodItems.push(foodItem);
        }
      }
    });
    
    return uniqueFoodItems;
  } catch (error) {
    console.error(`Error getting foods for diet ${dietType}:`, error);
    return [];
  }
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
    
    // Filter out products with missing crucial data
    const validProducts = data.products.filter(product => 
      product.code && 
      (product.product_name || product.product_name_en) &&
      product.nutriments
    );
    
    // Map products to food items, ensuring no duplicates
    const foodItems: FoodItem[] = [];
    validProducts.forEach(product => {
      if (!seenProductCodesSet.has(product.code)) {
        seenProductCodesSet.add(product.code);
        foodItems.push(mapProductToFoodItem(product));
      }
    });
    
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

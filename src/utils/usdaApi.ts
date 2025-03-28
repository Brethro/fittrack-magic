// USDA Food Data Central API utilities
const USDA_API_KEY = "1su4bvCoKYGVSnyCBgVCwQATKgRWw9uVHqWFTsw2";
const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

// Rate limiting parameters
const REQUEST_COOLDOWN = 2000; // Minimum time between requests (2 seconds)
let lastRequestTime = 0;
let pendingRequests: Array<{ promise: Promise<any>; isPending: boolean }> = [];
const MAX_CONCURRENT_REQUESTS = 1;

export interface UsdaFoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  brandName?: string;
  brandOwner?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: UsdaFoodNutrient[];
  foodPortions?: UsdaFoodPortion[];
  foodCategory?: string;
  foodCategoryId?: number;
  householdServingFullText?: string; // Added this property
}

export interface UsdaFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  value: number;
  unitName: string;
}

export interface UsdaFoodPortion {
  amount: number;
  gramWeight: number;
  measureUnit: {
    id: number;
    name: string;
    abbreviation: string;
  };
}

export interface UsdaSearchParams {
  query: string;
  dataType?: string[];
  pageSize?: number;
  pageNumber?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UsdaSearchResponse {
  foodSearchCriteria: {
    query: string;
    generalSearchInput: string;
    pageNumber: number;
    numberOfResultsPerPage: number;
  };
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: UsdaFoodItem[];
}

/**
 * Rate-limited fetch function for USDA API
 */
async function rateLimitedFetch(url: string, options: RequestInit): Promise<Response> {
  // Calculate time to wait before making the request
  const now = Date.now();
  const timeToWait = Math.max(0, REQUEST_COOLDOWN - (now - lastRequestTime));
  
  // Wait for the cooldown period
  if (timeToWait > 0) {
    console.log(`Throttling USDA API request: waiting ${timeToWait}ms`);
    await new Promise(resolve => setTimeout(resolve, timeToWait));
  }
  
  // Wait if we have too many concurrent requests
  while (pendingRequests.length >= MAX_CONCURRENT_REQUESTS) {
    console.log(`Waiting for pending USDA API requests to complete (${pendingRequests.length} pending)`);
    // Create a promise that resolves when any request completes
    await Promise.race(pendingRequests.map(req => req.promise));
    // Filter out completed requests
    pendingRequests = pendingRequests.filter(req => req.isPending);
  }
  
  // Make the request
  lastRequestTime = Date.now();
  
  try {
    const response = await fetch(url, options);
    
    // Handle rate limit errors
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default to 1 minute
      
      console.log(`USDA API rate limited. Waiting ${waitTime}ms before retry.`);
      
      const errorData = await response.json();
      throw new Error(`USDA API rate limit exceeded: ${errorData.error?.message || 'Try again later'}`);
    }
    
    return response;
  } catch (error) {
    console.error("USDA API request failed:", error);
    throw error;
  }
}

/**
 * Search for foods in the USDA FoodData Central database
 */
export async function searchUsdaFoods(
  params: UsdaSearchParams
): Promise<UsdaSearchResponse> {
  const defaultParams = {
    dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)", "Branded"],
    pageSize: 25,
    pageNumber: 1,
    sortBy: "dataType.keyword",
    sortOrder: "asc" as const,
  };
  
  const searchParams = { ...defaultParams, ...params };
  
  try {
    // Add API key to the URL as a query parameter
    const url = `${USDA_BASE_URL}/foods/search?api_key=${USDA_API_KEY}`;
    
    const response = await rateLimitedFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchParams),
    });
    
    if (!response.ok) {
      throw new Error(`USDA API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as UsdaSearchResponse;
  } catch (error) {
    console.error("Error searching USDA foods:", error);
    throw error;
  }
}

/**
 * Get detailed information about a food item by its FDC ID
 */
export async function getUsdaFoodDetails(fdcId: number): Promise<UsdaFoodItem> {
  try {
    const response = await rateLimitedFetch(
      `${USDA_BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`USDA API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as UsdaFoodItem;
  } catch (error) {
    console.error(`Error fetching USDA food details for ID ${fdcId}:`, error);
    throw error;
  }
}

/**
 * Extract standard nutritional information from USDA food nutrient data
 */
export function extractNutritionInfo(foodItem: UsdaFoodItem) {
  // Common nutrient IDs in USDA database
  const NUTRIENT_IDS = {
    ENERGY_KCAL: [1008, 2047, 2048, 1062], // Different energy measurements
    PROTEIN: [1003, 1299, 1162], // Protein
    TOTAL_FAT: [1004, 1300, 1085], // Total fat
    CARBOHYDRATES: [1005, 1050, 2000, 1072], // Carbs by difference, total carbs
    FIBER: [1079, 1082, 2033], // Dietary fiber
    SUGARS: [1063, 2000], // Total sugars
    CALCIUM: [1087, 1086], // Calcium
    IRON: [1089, 1090], // Iron
    SODIUM: [1093, 1090], // Sodium
    VITAMIN_C: [1162, 1175], // Vitamin C
    VITAMIN_A: [1104, 1105, 1106], // Various Vitamin A measurements
  };
  
  // Find nutrients with matching IDs
  const findNutrient = (nutrientIds: number[]) => {
    for (const id of nutrientIds) {
      const nutrient = foodItem.foodNutrients.find(n => n.nutrientId === id);
      if (nutrient) return nutrient;
    }
    return null;
  };
  
  // Extract nutritional values with fallbacks
  const calorieNutrient = findNutrient(NUTRIENT_IDS.ENERGY_KCAL);
  // Sometimes the data is stored in different units or formats, ensure we get a meaningful value
  let calories = calorieNutrient?.value || 0;
  
  // If calories seem too low (under 1.0), they might be in kJ and need conversion
  if (calories > 0 && calories < 1.0) {
    // Try to scale appropriately (possibly per g instead of per 100g)
    calories = calories * 1000;
  }
  
  const protein = findNutrient(NUTRIENT_IDS.PROTEIN)?.value || 0;
  const fat = findNutrient(NUTRIENT_IDS.TOTAL_FAT)?.value || 0;
  const carbs = findNutrient(NUTRIENT_IDS.CARBOHYDRATES)?.value || 0;
  const fiber = findNutrient(NUTRIENT_IDS.FIBER)?.value || 0;
  const sugars = findNutrient(NUTRIENT_IDS.SUGARS)?.value || 0;
  
  // Determine serving size and unit
  let servingSize = 100; // Default to 100g if no serving info available
  let servingUnit = "g";
  
  // Use the provided serving size if available
  if (foodItem.servingSize && !isNaN(foodItem.servingSize)) {
    servingSize = foodItem.servingSize;
    servingUnit = foodItem.servingSizeUnit || "g";
  } 
  // Look for standard portions if available
  else if (foodItem.foodPortions && foodItem.foodPortions.length > 0) {
    // Find a reasonable default portion (prefer household measures)
    const defaultPortion = foodItem.foodPortions.find(p => 
      p.measureUnit && (
        p.measureUnit.name.toLowerCase().includes("cup") || 
        p.measureUnit.name.toLowerCase().includes("tablespoon") ||
        p.measureUnit.name.toLowerCase().includes("teaspoon") ||
        p.measureUnit.name.toLowerCase().includes("piece") ||
        p.measureUnit.name.toLowerCase().includes("serving")
      )
    ) || foodItem.foodPortions[0];
    
    if (defaultPortion) {
      servingSize = defaultPortion.gramWeight;
      servingUnit = "g";
    }
  }
  // Try to extract from household serving text if available
  else if (foodItem.householdServingFullText) {
    // Try to find weight in parentheses like "1 cup (240g)"
    const weightMatch = foodItem.householdServingFullText.match(/\((\d+(?:\.\d+)?)\s*g\)/i);
    if (weightMatch && weightMatch[1]) {
      servingSize = parseFloat(weightMatch[1]);
      servingUnit = "g";
    }
  }
  
  // Log what we extracted for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`Extracted nutrition for ${foodItem.description}:`, {
      calories,
      protein,
      carbs,
      fat,
      servingSize,
      servingUnit
    });
  }
  
  // Return a clean nutrition object with serving info
  return {
    nutritionValues: {
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugars,
    },
    servingInfo: {
      size: servingSize,
      unit: servingUnit
    }
  };
}

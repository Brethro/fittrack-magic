
// USDA Food Data Central API utilities
const USDA_API_KEY = "4ESFMuftyo6ZdzIa6QtFG6VUKU5SWijTjcnklsxQ";
const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

export interface UsdaFoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  brandName?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: UsdaFoodNutrient[];
  foodPortions?: UsdaFoodPortion[];
  foodCategory?: string;
  foodCategoryId?: number;
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
  
  const queryParams = new URLSearchParams({
    api_key: USDA_API_KEY,
  });
  
  try {
    const response = await fetch(`${USDA_BASE_URL}/foods/search`, {
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
    const response = await fetch(
      `${USDA_BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`
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
    ENERGY_KCAL: [1008, 2047, 2048], // Different energy measurements
    PROTEIN: [1003, 1299], // Protein  
    TOTAL_FAT: [1004, 1300], // Total fat
    CARBOHYDRATES: [1005, 1050, 2000], // Carbs by difference, total carbs
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
  
  // Extract nutritional values
  const calories = findNutrient(NUTRIENT_IDS.ENERGY_KCAL)?.value || 0;
  const protein = findNutrient(NUTRIENT_IDS.PROTEIN)?.value || 0;
  const fat = findNutrient(NUTRIENT_IDS.TOTAL_FAT)?.value || 0;
  const carbs = findNutrient(NUTRIENT_IDS.CARBOHYDRATES)?.value || 0;
  const fiber = findNutrient(NUTRIENT_IDS.FIBER)?.value || 0;
  const sugars = findNutrient(NUTRIENT_IDS.SUGARS)?.value || 0;
  
  // For 100g serving
  return {
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugars,
    serving: "100g",
  };
}


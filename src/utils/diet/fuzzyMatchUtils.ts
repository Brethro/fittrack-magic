
import { FoodItem, FoodPrimaryCategory, FoodCategory } from "@/types/diet";

// Cache for fuzzy matching results to improve performance
const fuzzyMatchCache = new Map<string, any>();

// Clear the fuzzy match cache
export const clearFuzzyMatchCache = (): void => {
  fuzzyMatchCache.clear();
};

// Simple levenshtein distance implementation for fuzzy matching
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
};

// Get similarity score between two strings (0-1 scale)
export const getSimilarityScore = (a: string, b: string): number => {
  if (!a || !b) return 0;
  
  const cacheKey = `${a}:${b}`;
  if (fuzzyMatchCache.has(cacheKey)) {
    return fuzzyMatchCache.get(cacheKey);
  }
  
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  
  // Exact match
  if (aLower === bLower) return 1;
  
  // One is substring of the other
  if (aLower.includes(bLower) || bLower.includes(aLower)) {
    const score = 0.8;
    fuzzyMatchCache.set(cacheKey, score);
    return score;
  }
  
  // Calculate Levenshtein distance
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(aLower, bLower);
  const score = 1 - (distance / maxLength);
  
  fuzzyMatchCache.set(cacheKey, score);
  return score;
};

// Find potentially miscategorized foods
export const identifyPotentialMiscategorizations = (foods: FoodItem[]): FoodItem[] => {
  const result: FoodItem[] = [];
  const categoryKeywords: Record<FoodPrimaryCategory, string[]> = {
    meat: ["beef", "pork", "lamb", "steak", "ham"],
    redMeat: ["beef", "lamb", "venison", "bison", "steak"],
    poultry: ["chicken", "turkey", "duck", "goose"],
    fish: ["salmon", "tuna", "cod", "fish"],
    seafood: ["shrimp", "lobster", "crab", "oyster", "clam"],
    dairy: ["milk", "cheese", "yogurt", "cream", "butter"],
    egg: ["egg"],
    grain: ["wheat", "rice", "oat", "barley", "cereal", "bread"],
    legume: ["bean", "lentil", "pea", "chickpea", "soy"],
    vegetable: ["vegetable", "carrot", "broccoli", "spinach", "pepper"],
    fruit: ["fruit", "apple", "orange", "banana", "berry"],
    nut: ["nut", "almond", "walnut", "pecan", "cashew"],
    seed: ["seed", "flax", "chia", "sunflower", "sesame"],
    oil: ["oil", "olive", "coconut", "canola", "avocado"],
    sweetener: ["sugar", "honey", "syrup", "sweetener"],
    herb: ["herb", "basil", "oregano", "mint", "thyme"],
    spice: ["spice", "pepper", "cinnamon", "nutmeg", "cumin"],
    processedFood: ["processed", "frozen", "canned", "packaged"],
    other: []
  };
  
  foods.forEach(food => {
    const nameLower = food.name.toLowerCase();
    const currentCategory = food.primaryCategory;
    
    // Check if name contains keywords from other categories
    let bestMatchCategory = currentCategory;
    let highestScore = 0;
    
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      if (category === currentCategory) return;
      
      const matchingKeywords = keywords.filter(keyword => 
        nameLower.includes(keyword.toLowerCase())
      );
      
      if (matchingKeywords.length > 0) {
        const score = matchingKeywords.length / keywords.length;
        if (score > highestScore) {
          highestScore = score;
          bestMatchCategory = category as FoodPrimaryCategory;
        }
      }
    });
    
    if (bestMatchCategory !== currentCategory && highestScore > 0.5) {
      result.push(food);
    }
  });
  
  return result;
};

// Export the fuzzyFindFood function
export const fuzzyFindFood = (query: string, categories: FoodCategory[]): FoodItem[] => {
  // Return empty array for very short queries
  if (query.length < 2) return [];
  
  const results: FoodItem[] = [];
  const queryLower = query.toLowerCase();
  
  // Get all food items from all categories
  const allFoods: FoodItem[] = categories.flatMap(category => category.items);
  
  // First pass: exact matches in name
  const exactMatches = allFoods.filter(food => 
    food.name.toLowerCase().includes(queryLower)
  );
  
  if (exactMatches.length > 0) {
    return exactMatches;
  }
  
  // Second pass: fuzzy matches based on similarity score
  const SIMILARITY_THRESHOLD = 0.6;
  
  allFoods.forEach(food => {
    const similarity = getSimilarityScore(food.name, query);
    if (similarity >= SIMILARITY_THRESHOLD) {
      results.push(food);
    }
  });
  
  // Sort by similarity (most similar first)
  results.sort((a, b) => {
    const scoreA = getSimilarityScore(a.name, query);
    const scoreB = getSimilarityScore(b.name, query);
    return scoreB - scoreA;
  });
  
  return results;
};


import { useToast } from "@/hooks/use-toast";
import { searchUsdaFoods, UsdaFoodItem } from "@/utils/usdaApi";
import { useFoodLog } from "@/contexts/FoodLogContext";

// Keep track of user selections to improve search rankings
const userSelections: Record<string, number> = {};

/**
 * Update selection frequency for a food item
 * @param foodName The name of the selected food
 */
export function trackFoodSelection(foodName: string): void {
  const normalizedName = foodName.toLowerCase().trim();
  userSelections[normalizedName] = (userSelections[normalizedName] || 0) + 1;
  
  // Store in localStorage for persistence across sessions
  try {
    localStorage.setItem('foodSelections', JSON.stringify(userSelections));
  } catch (e) {
    console.warn('Could not save food selections to localStorage', e);
  }
}

/**
 * Load user food selections from localStorage on module load
 */
function loadUserSelections(): void {
  try {
    const saved = localStorage.getItem('foodSelections');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(userSelections, parsed);
    }
  } catch (e) {
    console.warn('Could not load food selections from localStorage', e);
  }
}

// Load saved selections when module initializes
loadUserSelections();

// Search Open Food Facts database
export async function searchOpenFoodFacts(
  searchQuery: string, 
  searchType: "exact" | "broad",
  userPreferences?: {
    dietary?: string[];
    excludeIngredients?: string[];
    preferHighProtein?: boolean;
  }
): Promise<any[]> {
  // Format the query for better results
  const encodedQuery = encodeURIComponent(searchQuery.trim());
  
  // Extract search terms for matching
  const searchTerms = searchQuery.toLowerCase().split(' ');
  
  // Determine search URL based on search type (exact or broad)
  let searchUrl;
  
  if (searchType === "exact") {
    // For exact search, use more specific parameters and tags to narrow results
    searchUrl = 
      `https://world.openfoodfacts.org/api/v2/search` +
      `?search_terms=${encodedQuery}` +
      `&fields=product_name,brands,serving_size,nutriments,image_url,categories,ingredients_text,labels,quantity,ecoscore_grade,nova_group,nutriscore_grade,product_name_en` +
      // Add tags to make search more precise for exact matches
      `&tag_contains_0=contains` +
      `&tag_0=${encodedQuery}` +
      `&sort_by=popularity_key` +
      `&page_size=100`; // Get more results to filter through
  } else {
    // Significantly improved broad search with better relevance
    // For broad search, create a more targeted query with main search terms
    const mainTerm = searchTerms[0]; // Use first term as primary filter
    
    searchUrl = 
      `https://world.openfoodfacts.org/api/v2/search` +
      `?search_terms=${encodedQuery}` +
      `&fields=product_name,brands,serving_size,nutriments,image_url,categories,ingredients_text,labels,quantity,ecoscore_grade,nova_group,nutriscore_grade,product_name_en` +
      // Add relevance boosting parameters
      `&sort_by=popularity_key` +
      // Ensure relevance by requiring the main search term in the product name
      `&tag_contains_0=contains` +
      `&tag_0=${mainTerm}` +
      `&tagtype_0=product_name` + // Force the tag to be in product name
      `&page_size=75`; // Increased to get more candidates for filtering
  }
  
  // Add dietary preference filters if provided
  if (userPreferences?.dietary && userPreferences.dietary.length > 0) {
    userPreferences.dietary.forEach((diet, index) => {
      searchUrl += `&tagtype_${index + 1}=labels&tag_contains_${index + 1}=contains&tag_${index + 1}=${encodeURIComponent(diet)}`;
    });
  }
  
  console.log(`Searching Open Food Facts with URL (${searchType} mode):`, searchUrl);
  
  const response = await fetch(searchUrl);
  
  if (!response.ok) {
    throw new Error(`Network response was not ok (${response.status})`);
  }
  
  const data = await response.json();
  console.log(`Open Food Facts API response (${searchType} mode):`, data);
  
  if (data.products && Array.isArray(data.products)) {
    // Enhanced scoring system with improved weighting for broad search
    const scoredResults = data.products.map(product => {
      const productName = (product.product_name || '').toLowerCase();
      const productNameEn = (product.product_name_en || '').toLowerCase();
      const brandName = (product.brands || '').toLowerCase();
      const categories = (product.categories || '').toLowerCase();
      const ingredients = (product.ingredients_text || '').toLowerCase();
      const labels = (product.labels || '').toLowerCase();
      
      // Normalized product identifiers for frequency matching
      const normalizedProductName = productName.trim();
      
      let score = 0;
      let exactMatch = false;
      let partialMatch = false;
      let matchedTermCount = 0;
      
      // ===== EXACT MATCH SCORING =====
      // Check for exact phrase match first (highest priority)
      if (productName === searchQuery.toLowerCase() || 
          productNameEn === searchQuery.toLowerCase()) {
        score += 1200; // Highest priority to exact matches
        exactMatch = true;
      } else if (productName.includes(searchQuery.toLowerCase()) || 
                 productNameEn.includes(searchQuery.toLowerCase())) {
        score += 600; // High priority for full phrase inclusion
        partialMatch = true;
      }
      
      // ===== SEQUENTIAL TERMS SCORING =====
      // Check for all search terms appearing in product name (in order)
      let allTermsInOrder = true;
      let lastIndex = -1;
      
      for (const term of searchTerms) {
        const index = productName.indexOf(term, lastIndex + 1);
        if (index <= lastIndex) {
          allTermsInOrder = false;
          break;
        }
        lastIndex = index;
      }
      
      if (allTermsInOrder && lastIndex > -1) {
        score += 400; // Increased from 300
        partialMatch = true;
      }
      
      // ===== INDIVIDUAL TERM MATCHING =====
      searchTerms.forEach(term => {
        if (term.length < 2) return; // Skip single-character terms
        
        // Direct matches in product name (highest priority)
        if (productName.includes(term)) {
          // Give higher score to matches at the beginning
          const position = productName.indexOf(term);
          const positionBonus = Math.max(0, 35 - position); // Higher bonus for earlier position
          
          score += 90 + positionBonus;
          matchedTermCount++;
          partialMatch = true;
        }
        
        // Match in English name if available
        if (productNameEn && productNameEn.includes(term)) {
          score += 80;
          matchedTermCount++;
          partialMatch = true;
        }
        
        // Category matches
        if (categories.includes(term)) {
          score += 60;
          partialMatch = true;
        }
        
        // Ingredient matches with leading word boundary check
        if (ingredients) {
          // Better matching with word boundaries
          const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, 'i');
          if (wordBoundaryRegex.test(ingredients)) {
            score += 70;
            partialMatch = true;
          } else if (ingredients.includes(term)) {
            score += 45;
            partialMatch = true;
          }
        }
        
        // Brand matches
        if (brandName.includes(term)) {
          score += 30;
          partialMatch = true;
        }
      });
      
      // ===== NUTRITIONAL COMPLETENESS SCORING =====
      // Boost score based on completeness of nutritional information
      let nutritionalCompletenessScore = 0;
      
      if (product.nutriments) {
        const nutrients = [
          'energy-kcal', 'proteins', 'carbohydrates', 'fat', 
          'fiber', 'sugars', 'sodium', 'salt', 'calcium', 'iron'
        ];
        
        // Count how many important nutrients are present
        nutrients.forEach(nutrient => {
          if (product.nutriments[nutrient] !== undefined) {
            nutritionalCompletenessScore += 4; // 4 points per nutrient (max 40)
          }
        });
        
        // Boost for having serving size information
        if (product.serving_size) {
          nutritionalCompletenessScore += 20;
        }
      }
      
      score += nutritionalCompletenessScore;
      
      // ===== USER PREFERENCE SCORING =====
      // Apply user preference filtering penalty for excluded ingredients
      if (userPreferences?.excludeIngredients && ingredients) {
        const excludedFound = userPreferences.excludeIngredients.some(
          ingredient => ingredients.includes(ingredient.toLowerCase())
        );
        
        if (excludedFound) {
          score -= 2000; // Major penalty to push to bottom or filter out
        }
      }
      
      // Boost for high protein (if user preference is set)
      if (userPreferences?.preferHighProtein && 
          product.nutriments && 
          product.nutriments.proteins && 
          product.nutriments.proteins > 15) { // 15g per 100g is relatively high protein
        score += 100;
      }
      
      // Boost for dietary preferences matching
      if (userPreferences?.dietary && labels) {
        userPreferences.dietary.forEach(diet => {
          if (labels.includes(diet.toLowerCase())) {
            score += 150;
          }
        });
      }
      
      // ===== PREVIOUS SELECTIONS SCORING =====
      // Major boost based on how often the user has selected this item before
      if (userSelections[normalizedProductName]) {
        // Logarithmic scaling to prevent super-popular items from dominating
        const frequencyBoost = Math.log10(1 + userSelections[normalizedProductName]) * 400;
        score += frequencyBoost;
      }
      
      // ===== ALL TERMS MATCH BONUS =====
      // Boost for matching all search terms
      if (matchedTermCount === searchTerms.length && searchTerms.length > 1) {
        score += 150;
      }
      
      // ===== IMPROVED BROAD SEARCH RELEVANCE FILTER =====
      // Much more aggressive penalization for irrelevant results in broad search
      if (searchType === "broad") {
        // Base requirement for broad search: must match primary term
        const primaryTermMatch = productName.includes(searchTerms[0]) || 
                              (productNameEn && productNameEn.includes(searchTerms[0]));
                              
        if (!primaryTermMatch) {
          // Heavily penalize items that don't contain the primary search term
          score -= 2000;
        }
        
        // Penalize items that don't match any terms at all
        if (matchedTermCount === 0) {
          score -= 1500;
        }
        
        // Significantly penalize items with very low match ratios
        if (matchedTermCount < Math.max(1, Math.floor(searchTerms.length * 0.25))) {
          score -= 1000;
        }
      }
      
      // In broad search, give bonus for partial name matches based on term length
      if (searchType === "broad" && partialMatch) {
        // Calculate percentage of search query covered in product name
        const searchQueryLength = searchQuery.length;
        const commonTerms = searchTerms.filter(term => 
          productName.includes(term) || 
          (productNameEn && productNameEn.includes(term))
        );
        
        const commonTermsLength = commonTerms.reduce((sum, term) => sum + term.length, 0);
        const coveragePercent = Math.min(100, (commonTermsLength / searchQueryLength) * 100);
        
        // Boost score based on coverage - higher bonus for broad search
        score += coveragePercent * 3;
      }
      
      // ===== DATA QUALITY BONUS =====
      // Complete data quality bonus points
      if (product.nutriments) score += 15; // Increased from 10
      if (product.image_url) score += 15;  // Increased from 10
      if (product.ingredients_text) score += 15; // New bonus for having ingredients
      if (product.nutriscore_grade) score += 10; // New bonus for having nutrition score
      
      return { 
        product, 
        score, 
        exactMatch,
        partialMatch,
        matchedTermCount,
        nutritionalCompleteness: nutritionalCompletenessScore
      };
    });
    
    // Filter based on search type
    let filteredResults;
    
    if (searchType === "exact") {
      // For exact search, prioritize exact matches and require at least partial matches
      filteredResults = scoredResults.filter(item => 
        item.exactMatch || (item.partialMatch && item.matchedTermCount >= Math.max(1, searchTerms.length - 1))
      );
    } else {
      // For broad search, more aggressive filtering
      filteredResults = scoredResults.filter(item => 
        // Must have a positive score (after all penalties)
        item.score > 0 && 
        // Must either be an exact/partial match, OR match at least one term with positive score
        ((item.partialMatch || item.exactMatch) || item.matchedTermCount > 0)
      );
    }
    
    // Sort by score (high to low) and extract just the product data
    const sortedResults = filteredResults
      .sort((a, b) => b.score - a.score)
      .map(item => {
        // Add a debug field to see the score in development
        if (process.env.NODE_ENV === 'development') {
          item.product._searchScore = item.score;
          item.product._nutritionalCompleteness = item.nutritionalCompleteness;
          item.product._matchedTermCount = item.matchedTermCount;
          item.product._exactMatch = item.exactMatch;
          item.product._partialMatch = item.partialMatch;
          item.product._searchType = searchType; // Add search type for debugging
        }
        return item.product;
      });
    
    console.log(`Scored and filtered results (${searchType} mode):`, 
      sortedResults.map(r => ({
        name: r.product_name,
        score: r._searchScore,
        matchCount: r._matchedTermCount
      })).slice(0, 5)
    );
    
    return sortedResults;
  }
  
  return [];
}

// Search USDA database with enhanced ranking
export async function searchUsdaDatabase(
  searchQuery: string,
  userPreferences?: {
    preferHighProtein?: boolean;
  }
): Promise<UsdaFoodItem[]> {
  console.log("Searching USDA database for:", searchQuery);
  
  // Configure USDA search parameters
  const searchParams = {
    query: searchQuery,
    dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)"], // Focus on standard reference foods
    pageSize: 15, // Increased from 10 to get more results to rank
    sortBy: "dataType.keyword",
    sortOrder: "asc" as const
  };
  
  const response = await searchUsdaFoods(searchParams);
  console.log("USDA API response:", response);
  
  if (response && response.foods && Array.isArray(response.foods)) {
    // Log complete first result for debugging
    if (response.foods.length > 0) {
      console.log("USDA first result details:", response.foods[0]);
    }
    
    // Extract search terms for better matching
    const searchTerms = searchQuery.toLowerCase().split(' ');
    
    // Enhanced scoring system for USDA results
    const scoredResults = response.foods.map(item => {
      const description = item.description.toLowerCase();
      const category = (item.foodCategory || '').toLowerCase();
      
      // Normalized food name for user selection lookup
      const normalizedName = description.trim();
      
      let score = 0;
      
      // Exact match in description (highest priority)
      if (description === searchQuery.toLowerCase()) {
        score += 1000;
      } else if (description.includes(searchQuery.toLowerCase())) {
        score += 500;
      }
      
      // Check for terms in description
      let matchCount = 0;
      searchTerms.forEach(term => {
        if (description.includes(term)) {
          // Position bonus (terms at start of description get higher scores)
          const position = description.indexOf(term);
          const positionBonus = Math.max(0, 30 - position);
          
          score += 80 + positionBonus;
          matchCount++;
        }
        
        // Check for terms in food category
        if (category && category.includes(term)) {
          score += 40;
        }
      });
      
      // Bonus for matching all terms
      if (matchCount === searchTerms.length && searchTerms.length > 1) {
        score += 200;
      }
      
      // Quality score based on data types (Foundation data is higher quality)
      switch (item.dataType) {
        case "Foundation":
          score += 150;
          break;
        case "SR Legacy":
          score += 100;
          break;
        case "Survey (FNDDS)":
          score += 50;
          break;
        default:
          score += 0;
      }
      
      // Bonus for completeness of nutrient data
      if (item.foodNutrients) {
        score += Math.min(100, item.foodNutrients.length * 2);
      }
      
      // High protein preference bonus
      if (userPreferences?.preferHighProtein) {
        const proteinNutrient = item.foodNutrients?.find(n => 
          (n.nutrientName?.toLowerCase().includes('protein') || n.nutrientId === 1003)
        );
        
        if (proteinNutrient && proteinNutrient.value > 15) {
          score += 150;
        }
      }
      
      // Previous selection frequency bonus
      if (userSelections[normalizedName]) {
        const frequencyBoost = Math.log10(1 + userSelections[normalizedName]) * 300;
        score += frequencyBoost;
      }
      
      return {
        item,
        score,
        matchCount
      };
    });
    
    // Filter and sort results
    const filteredResults = scoredResults
      .filter(result => result.matchCount > 0 || result.score > 250)
      .sort((a, b) => b.score - a.score)
      .map(result => {
        // Add debug score for development
        if (process.env.NODE_ENV === 'development') {
          const item = result.item as any;
          item._searchScore = result.score;
        }
        return result.item;
      });
    
    return filteredResults;
  }
  
  return [];
}

// Helper function to fetch broader results 
export async function fetchBroadResults(encodedQuery: string): Promise<any[]> {
  try {
    const broadSearchUrl = 
      `https://world.openfoodfacts.org/api/v2/search` +
      `?search_terms=${encodedQuery}` +
      `&fields=product_name,brands,serving_size,nutriments,image_url,categories,ingredients_text,labels,quantity,ecoscore_grade,nova_group,nutriscore_grade` +
      `&page_size=20`;
    
    const response = await fetch(broadSearchUrl);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (data.products && Array.isArray(data.products)) {
      return data.products;
    }
    
    return [];
  } catch (error) {
    console.error("Broad search error:", error);
    return [];
  }
}

// Fallback search approach for when the primary search returns no results
export async function searchWithFallback(encodedQuery: string): Promise<any[]> {
  try {
    // Use both API endpoints to maximize chances of finding results
    
    // 1. Try the legacy CGI search endpoint first (often finds more results)
    const fallbackSearchUrl = 
      `https://world.openfoodfacts.org/cgi/search.pl` +
      `?search_terms=${encodedQuery}` +
      `&search_simple=1` +
      `&action=process` +
      `&json=true` +
      `&page_size=50` +
      `&fields=product_name,brands,serving_size,nutriments,image_url,categories,ingredients_text,labels,quantity,ecoscore_grade,nova_group,nutriscore_grade`;
    
    console.log("Fallback search with URL:", fallbackSearchUrl);
    
    const response = await fetch(fallbackSearchUrl);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }
    
    const data = await response.json();
    console.log("Fallback search API response:", data);
    
    if (data.products && Array.isArray(data.products) && data.products.length > 0) {
      return data.products;
    }
    
    // 2. If the first attempt failed, try the v2 API with more lenient settings
    const v2FallbackUrl = 
      `https://world.openfoodfacts.org/api/v2/search` +
      `?search_terms=${encodedQuery}` +
      `&fields=product_name,brands,serving_size,nutriments,image_url,categories,ingredients_text,labels,quantity,ecoscore_grade,nova_group,nutriscore_grade` +
      `&sort_by=popularity_key` +
      `&page_size=75`;
      
    console.log("Secondary fallback search with URL:", v2FallbackUrl);
    
    const v2Response = await fetch(v2FallbackUrl);
    
    if (!v2Response.ok) {
      throw new Error(`Network response was not ok (${v2Response.status})`);
    }
    
    const v2Data = await v2Response.json();
    console.log("Secondary fallback search API response:", v2Data);
    
    if (v2Data.products && Array.isArray(v2Data.products)) {
      return v2Data.products;
    }
    
    return [];
  } catch (error) {
    console.error("Fallback search error:", error);
    return [];
  }
}

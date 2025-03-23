
import { useToast } from "@/hooks/use-toast";
import { searchUsdaFoods, UsdaFoodItem } from "@/utils/usdaApi";

// Search Open Food Facts database
export async function searchOpenFoodFacts(
  searchQuery: string, 
  searchType: "exact" | "broad"
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
    // Broad search with fewer restrictions
    searchUrl = 
      `https://world.openfoodfacts.org/api/v2/search` +
      `?search_terms=${encodedQuery}` +
      `&fields=product_name,brands,serving_size,nutriments,image_url,categories,ingredients_text,labels,quantity,ecoscore_grade,nova_group,nutriscore_grade,product_name_en` +
      `&sort_by=popularity_key` +
      `&page_size=50`;
  }
  
  console.log("Searching Open Food Facts with URL:", searchUrl);
  
  const response = await fetch(searchUrl);
  
  if (!response.ok) {
    throw new Error(`Network response was not ok (${response.status})`);
  }
  
  const data = await response.json();
  console.log("Open Food Facts API response:", data);
  
  if (data.products && Array.isArray(data.products)) {
    // Enhanced scoring system with precision boosting
    const scoredResults = data.products.map(product => {
      const productName = (product.product_name || '').toLowerCase();
      const productNameEn = (product.product_name_en || '').toLowerCase();
      const brandName = (product.brands || '').toLowerCase();
      const categories = (product.categories || '').toLowerCase();
      const ingredients = (product.ingredients_text || '').toLowerCase();
      
      let score = 0;
      let exactMatch = false;
      let partialMatch = false;
      
      // Check for exact phrase match first
      if (productName === searchQuery.toLowerCase() || 
          productNameEn === searchQuery.toLowerCase()) {
        score += 1000; // Huge boost for exact name match
        exactMatch = true;
      } else if (productName.includes(searchQuery.toLowerCase()) || 
                 productNameEn.includes(searchQuery.toLowerCase())) {
        score += 500; // Strong boost for full phrase inclusion
        partialMatch = true;
      }
      
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
        score += 300;
        partialMatch = true;
      }
      
      // Individual term matching with position awareness
      let matchedTermCount = 0;
      searchTerms.forEach(term => {
        // Direct matches in product name (highest priority)
        if (productName.includes(term)) {
          // Give higher score to matches at the beginning
          const position = productName.indexOf(term);
          const positionBonus = Math.max(0, 30 - position); // Higher bonus for earlier position
          
          score += 80 + positionBonus;
          matchedTermCount++;
          partialMatch = true;
        }
        
        // Match in English name if available
        if (productNameEn && productNameEn.includes(term)) {
          score += 70;
          matchedTermCount++;
          partialMatch = true;
        }
        
        // Category matches
        if (categories.includes(term)) {
          score += 50;
          partialMatch = true;
        }
        
        // Ingredient matches with leading word boundary check
        if (ingredients) {
          // Better matching with word boundaries
          const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, 'i');
          if (wordBoundaryRegex.test(ingredients)) {
            score += 60;
            partialMatch = true;
          } else if (ingredients.includes(term)) {
            score += 40;
            partialMatch = true;
          }
        }
        
        // Brand matches
        if (brandName.includes(term)) {
          score += 20;
          partialMatch = true;
        }
      });
      
      // Boost for matching all search terms
      if (matchedTermCount === searchTerms.length && searchTerms.length > 1) {
        score += 100;
      }
      
      // Complete data quality bonus points
      if (product.nutriments) score += 10;
      if (product.image_url) score += 10;
      
      return { 
        product, 
        score, 
        exactMatch,
        partialMatch,
        matchedTermCount
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
      // For broad search, include anything with some relevance
      filteredResults = scoredResults.filter(item => item.partialMatch);
    }
    
    // Sort by score (high to low) and extract just the product data
    const sortedResults = filteredResults
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
    
    return sortedResults;
  }
  
  return [];
}

// Search USDA database
export async function searchUsdaDatabase(searchQuery: string): Promise<UsdaFoodItem[]> {
  console.log("Searching USDA database for:", searchQuery);
  
  // Configure USDA search parameters
  const searchParams = {
    query: searchQuery,
    dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)"], // Focus on standard reference foods
    pageSize: 10,
    sortBy: "dataType.keyword",
    sortOrder: "asc" as const
  };
  
  const response = await searchUsdaFoods(searchParams);
  console.log("USDA API response:", response);
  
  if (response && response.foods && Array.isArray(response.foods)) {
    // Sort by relevance and quality of data
    const sortedResults = response.foods
      .filter(item => 
        // Filter out items without key nutritional data
        item.foodNutrients && 
        item.foodNutrients.length > 0 &&
        // Make sure description actually contains the search terms
        searchQuery.toLowerCase().split(' ').some(term => 
          item.description.toLowerCase().includes(term)
        )
      )
      .sort((a, b) => {
        // Prioritize Foundation and SR Legacy (high quality data)
        if (a.dataType !== b.dataType) {
          if (a.dataType === "Foundation") return -1;
          if (b.dataType === "Foundation") return 1;
          if (a.dataType === "SR Legacy") return -1;
          if (b.dataType === "SR Legacy") return 1;
        }
        
        // Then sort by exact match in name
        const aExactMatch = a.description.toLowerCase() === searchQuery.toLowerCase();
        const bExactMatch = b.description.toLowerCase() === searchQuery.toLowerCase();
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        
        // Then by number of nutrients (more data is better)
        return (b.foodNutrients?.length || 0) - (a.foodNutrients?.length || 0);
      });
    
    return sortedResults;
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
    // Use the legacy search endpoint with more permissive parameters
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
    
    if (data.products && Array.isArray(data.products)) {
      return data.products;
    }
    
    return [];
  } catch (error) {
    console.error("Fallback search error:", error);
    return [];
  }
}

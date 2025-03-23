import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, AlertCircle, CheckCircle, Loader2, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FoodSearchResults, { FoodSearchResultsSkeleton } from "@/components/diet/FoodSearchResults";
import { searchUsdaFoods, UsdaFoodItem } from "@/utils/usdaApi";

const DietPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [usdaResults, setUsdaResults] = useState<UsdaFoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<"idle" | "checking" | "connected" | "error">("checking");
  const [usdaApiStatus, setUsdaApiStatus] = useState<"idle" | "checking" | "connected" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchType, setSearchType] = useState<"exact" | "broad">("exact");
  // Update default search source to USDA
  const [searchSource, setSearchSource] = useState<"both" | "openfoods" | "usda">("usda");

  // Check Open Food Facts API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      setApiStatus("checking");
      try {
        // Using a more reliable endpoint for testing connection
        const response = await fetch(
          "https://world.openfoodfacts.org/api/v2/search?fields=product_name,brands&page_size=1"
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log("API connection test response:", data);
          
          if (data && data.products && Array.isArray(data.products)) {
            setApiStatus("connected");
          } else {
            setApiStatus("error");
            setErrorMessage("API responded but returned unexpected data format");
          }
        } else {
          setApiStatus("error");
          setErrorMessage(`API returned status: ${response.status}`);
        }
      } catch (error) {
        setApiStatus("error");
        setErrorMessage(`Connection error: ${error instanceof Error ? error.message : String(error)}`);
        console.error("API connection error:", error);
      }
    };

    checkApiConnection();
  }, []);

  // Check USDA API connection when selected
  useEffect(() => {
    if (searchSource === "usda" || searchSource === "both") {
      checkUsdaApiConnection();
    }
  }, [searchSource]);

  const checkUsdaApiConnection = async () => {
    setUsdaApiStatus("checking");
    try {
      // Simple search to test connection
      const response = await searchUsdaFoods({
        query: "apple",
        pageSize: 1
      });
      
      if (response && response.foods && Array.isArray(response.foods)) {
        setUsdaApiStatus("connected");
      } else {
        setUsdaApiStatus("error");
        toast({
          title: "USDA API Error",
          description: "Could not connect to USDA API",
          variant: "destructive",
        });
      }
    } catch (error) {
      setUsdaApiStatus("error");
      toast({
        title: "USDA API Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Empty search",
        description: "Please enter a food to search for",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSearchResults([]);
    setUsdaResults([]);
    
    try {
      // Search in Open Food Facts if selected
      if (searchSource === "openfoods" || searchSource === "both") {
        await searchOpenFoodFacts();
      }
      
      // Search in USDA if selected
      if (searchSource === "usda" || searchSource === "both") {
        await searchUsdaDatabase();
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: `Could not fetch food data: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const searchOpenFoodFacts = async () => {
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
      
      setSearchResults(sortedResults);
      
      if (sortedResults.length === 0) {
        // If no matches with exact search, try the fallback approach
        if (searchType === "exact" && searchSource !== "usda") {
          toast({
            title: "No exact matches found",
            description: "Trying broader search criteria...",
          });
          // Try with broader search
          setSearchType("broad");
          await searchWithFallback(encodedQuery);
        }
      }
    } else {
      console.error("Unexpected API response format:", data);
      toast({
        title: "Invalid response format",
        description: "The Open Food Facts API returned an unexpected data format",
        variant: "destructive",
      });
    }
  };
  
  const searchUsdaDatabase = async () => {
    try {
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
        
        setUsdaResults(sortedResults);
      }
    } catch (error) {
      console.error("USDA search error:", error);
      toast({
        title: "USDA search failed",
        description: `Could not fetch USDA food data: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  // Helper function to fetch broader results 
  const fetchBroadResults = async (encodedQuery: string): Promise<any[]> => {
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
  };

  // Fallback search approach for when the primary search returns no results
  const searchWithFallback = async (encodedQuery: string) => {
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
        if (data.products.length > 0) {
          setSearchResults(data.products);
          toast({
            title: "Limited results found",
            description: "We found some items that might match what you're looking for.",
          });
        } else {
          toast({
            title: "No results found",
            description: "Try different search terms or check your spelling.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Fallback search error:", error);
      // Don't show another toast here since we already showed one for the main search
    }
  };

  const toggleSearchType = () => {
    setSearchType(prev => prev === "exact" ? "broad" : "exact");
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold mb-6 text-gradient-purple">
          Diet Planner
        </h1>

        {/* API Status Indicators - Made more compact */}
        <div className="mb-4 flex flex-wrap gap-2">
          {apiStatus === "checking" && (
            <div className="text-xs bg-gray-100 py-1 px-3 rounded-full flex items-center">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              <span>Checking OFF API...</span>
            </div>
          )}
          {apiStatus === "connected" && (
            <div className="text-xs bg-green-50 text-green-700 py-1 px-3 rounded-full flex items-center">
              <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
              <span>Open Food Facts API ready</span>
            </div>
          )}
          {apiStatus === "error" && (
            <div className="text-xs bg-red-50 text-red-700 py-1 px-3 rounded-full flex items-center">
              <AlertCircle className="mr-1 h-3 w-3 text-red-500" />
              <span>OFF API error</span>
            </div>
          )}
          
          {usdaApiStatus === "checking" && (
            <div className="text-xs bg-gray-100 py-1 px-3 rounded-full flex items-center">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              <span>Checking USDA API...</span>
            </div>
          )}
          {usdaApiStatus === "connected" && (
            <div className="text-xs bg-emerald-50 text-emerald-700 py-1 px-3 rounded-full flex items-center">
              <CheckCircle className="mr-1 h-3 w-3 text-emerald-500" />
              <span>USDA API ready</span>
            </div>
          )}
          {usdaApiStatus === "error" && (
            <div className="text-xs bg-red-50 text-red-700 py-1 px-3 rounded-full flex items-center">
              <AlertCircle className="mr-1 h-3 w-3 text-red-500" />
              <span>USDA API error</span>
            </div>
          )}
        </div>

        <section className="glass-panel rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Food Search</h2>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                placeholder="Search for a food (e.g., apple, yogurt, chicken breast)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" /> Search
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Search mode: <span className="font-medium">{searchType === "exact" ? "Exact match" : "Broad match"}</span>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleSearchType} 
                  className="text-xs"
                >
                  Switch to {searchType === "exact" ? "broad" : "exact"} search
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Data source:
                </span>
                <Select 
                  value={searchSource} 
                  onValueChange={(value) => setSearchSource(value as "both" | "openfoods" | "usda")}
                >
                  <SelectTrigger className="h-8 w-[180px]">
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both databases</SelectItem>
                    <SelectItem value="openfoods">Open Food Facts</SelectItem>
                    <SelectItem value="usda">USDA Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Search Results */}
        {isLoading ? (
          <FoodSearchResultsSkeleton />
        ) : (
          (searchResults.length > 0 || usdaResults.length > 0) && (
            <FoodSearchResults results={searchResults} usdaResults={usdaResults} />
          )
        )}
      </motion.div>
    </div>
  );
};

export default DietPage;

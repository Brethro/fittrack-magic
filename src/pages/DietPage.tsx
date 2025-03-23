
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FoodSearchResults, { FoodSearchResultsSkeleton } from "@/components/diet/FoodSearchResults";

const DietPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<"idle" | "checking" | "connected" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState("");

  // Check API connection on component mount
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
    try {
      // Format the query for better results
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      
      /**
       * REVISED SEARCH APPROACH: Using the basic search endpoint and standard parameters
       * without overly complex filtering that could restrict results too much
       */
      
      // Basic search approach
      const basicSearchUrl = 
        `https://world.openfoodfacts.org/api/v2/search` +
        `?search_terms=${encodedQuery}` +
        `&fields=product_name,brands,serving_size,nutriments,image_url,categories,ingredients_text,labels,quantity,ecoscore_grade,nova_group,nutriscore_grade` +
        `&page_size=50`;
      
      console.log("Searching with URL:", basicSearchUrl);
      
      const response = await fetch(basicSearchUrl);
      
      if (!response.ok) {
        throw new Error(`Network response was not ok (${response.status})`);
      }
      
      const data = await response.json();
      console.log("Search API response:", data);
      
      if (data.products && Array.isArray(data.products)) {
        // Convert search terms to lowercase for comparison
        const searchTerms = searchQuery.toLowerCase().split(' ');
        
        // Score and filter results for relevance
        const scoredResults = data.products.map(product => {
          const productName = (product.product_name || '').toLowerCase();
          const brandName = (product.brands || '').toLowerCase();
          const categories = (product.categories || '').toLowerCase();
          const ingredients = (product.ingredients_text || '').toLowerCase();
          
          let score = 0;
          let matches = false;
          
          // Check for matches in any field
          searchTerms.forEach(term => {
            // Direct matches in product name (highest priority)
            if (productName === term) {
              score += 100;
              matches = true;
            } else if (productName.includes(` ${term} `)) {
              score += 80;
              matches = true;
            } else if (productName.includes(term)) {
              score += 60;
              matches = true;
            }
            
            // Category matches
            if (categories.includes(term)) {
              score += 50;
              matches = true;
            }
            
            // Ingredient matches
            if (ingredients && ingredients.includes(term)) {
              score += 40;
              matches = true;
            }
            
            // Brand matches
            if (brandName.includes(term)) {
              score += 20;
              matches = true;
            }
          });
          
          // Complete data quality bonus points
          if (product.nutriments) score += 5;
          if (product.image_url) score += 5;
          
          return { product, score, matches };
        });
        
        // Filter to only include items with at least one match to any search term
        const matchedResults = scoredResults.filter(item => item.matches);
        
        // Sort by score (high to low) and extract just the product data
        const sortedResults = matchedResults
          .sort((a, b) => b.score - a.score)
          .map(item => item.product);
        
        setSearchResults(sortedResults);
        
        if (sortedResults.length === 0) {
          // If no matches, try a fallback approach with a different endpoint
          await searchWithFallback(encodedQuery);
        }
      } else {
        console.error("Unexpected API response format:", data);
        toast({
          title: "Invalid response format",
          description: "The API returned an unexpected data format",
          variant: "destructive",
        });
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: `Could not fetch food data: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
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

        {/* API Status Indicator */}
        <div className="mb-4">
          {apiStatus === "checking" && (
            <Alert>
              <AlertDescription className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking connection to Open Food Facts API...
              </AlertDescription>
            </Alert>
          )}
          {apiStatus === "connected" && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <AlertDescription className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Open Food Facts API is connected and ready
              </AlertDescription>
            </Alert>
          )}
          {apiStatus === "error" && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Unable to connect to Open Food Facts API: {errorMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <section className="glass-panel rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Food Search</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Search for a food (e.g., apple, yogurt, chicken)"
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
        </section>

        {/* Search Results */}
        {isLoading ? (
          <FoodSearchResultsSkeleton />
        ) : (
          searchResults.length > 0 && (
            <FoodSearchResults results={searchResults} />
          )
        )}
      </motion.div>
    </div>
  );
};

export default DietPage;

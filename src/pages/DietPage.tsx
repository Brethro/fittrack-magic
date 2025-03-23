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
       * IMPROVED API SEARCH:
       * 1. Using the 'search_terms' parameter for full-text search
       * 2. Adding 'tagtype_0=categories' and 'tag_contains_0=contains' to filter by food categories 
       * 3. Adding search terms to tag_0 to prioritize matching items
       * 4. Requesting relevant product fields we need to display
       * 5. Sorting by popularity to get better quality results first
       */
      const searchUrl = 
        `https://world.openfoodfacts.org/api/v2/search` +
        `?search_terms=${encodedQuery}` +
        `&tagtype_0=categories` +
        `&tag_contains_0=contains` +
        `&tag_0=${encodedQuery}` +
        `&sort_by=popularity_key` +
        `&fields=product_name,brands,serving_size,nutriments,image_url,categories,ingredients_text` + 
        `&page_size=50`;
      
      console.log("Searching with URL:", searchUrl);
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`Network response was not ok (${response.status})`);
      }
      
      const data = await response.json();
      console.log("Search API response:", data);
      
      if (data.products && Array.isArray(data.products)) {
        // Convert search terms to lowercase for comparison
        const searchTerms = searchQuery.toLowerCase().split(' ');
        
        // First pass: Score all products by relevance
        const scoredResults = data.products.map(product => {
          const productName = (product.product_name || '').toLowerCase();
          const brandName = (product.brands || '').toLowerCase();
          const categories = (product.categories || '').toLowerCase();
          const ingredients = (product.ingredients_text || '').toLowerCase();
          
          let score = 0;
          
          // Score based on exact match of specific search terms
          searchTerms.forEach(term => {
            // Direct matches in product name (highest priority)
            if (productName === term) score += 100;
            else if (productName.includes(term)) score += 50;
            
            // Brand matches
            if (brandName.includes(term)) score += 20;
            
            // Category matches (important for food types)
            if (categories.includes(term)) score += 30;
            
            // Ingredient matches (vital for foods)
            if (ingredients && ingredients.includes(term)) score += 40;
            
            // Extra points for having complete data
            if (product.nutriments) score += 5;
            if (product.image_url) score += 5;
          });
          
          // Filter out items with zero relevance score
          return { product, score };
        });
        
        // Sort by score (high to low) and extract just the product data
        const sortedResults = scoredResults
          .sort((a, b) => b.score - a.score)
          .map(item => item.product);
        
        // Get only the products with a positive relevance score
        const relevantResults = sortedResults.filter((_, index) => 
          scoredResults[index].score > 0);
        
        if (relevantResults.length > 0) {
          setSearchResults(relevantResults);
        } else {
          // If no relevant results, show a message and return a limited set of general results
          toast({
            title: "Limited relevant matches",
            description: "Showing general results. Try different search terms for more specific items.",
          });
          setSearchResults(sortedResults.slice(0, 10));
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

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
      // Update the search URL to be more specific and include the search term in multiple parameters
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      
      // Building a more specific search URL that targets product name and categories
      const searchUrl = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodedQuery}&fields=product_name,brands,serving_size,nutriments,image_url,categories,ingredients_text&page_size=50`;
      
      console.log("Searching with URL:", searchUrl);
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`Network response was not ok (${response.status})`);
      }
      
      const data = await response.json();
      console.log("Search API response:", data); // Debug log
      
      if (data.products && Array.isArray(data.products)) {
        // Convert search terms to lowercase for comparison
        const searchTerms = searchQuery.toLowerCase().split(' ');
        
        // First pass: Keep only products that have the search terms in their name, brand, or categories
        let filteredResults = data.products.filter(product => {
          const productName = (product.product_name || '').toLowerCase();
          const brandName = (product.brands || '').toLowerCase();
          const categories = (product.categories || '').toLowerCase();
          const ingredients = (product.ingredients_text || '').toLowerCase();
          
          // Check if any search term appears in the product details
          return searchTerms.some(term => 
            productName.includes(term) || 
            brandName.includes(term) || 
            categories.includes(term) || 
            ingredients.includes(term)
          );
        });
        
        // If we don't have enough filtered results, take some from the original list
        if (filteredResults.length < 5 && data.products.length > 0) {
          filteredResults = data.products.slice(0, 10);
          toast({
            title: "Limited exact matches",
            description: "Showing some potentially relevant products",
          });
        }
        
        // Second pass: Score the remaining products by relevance
        const scoredResults = filteredResults.map(product => {
          const productName = (product.product_name || '').toLowerCase();
          const brandName = (product.brands || '').toLowerCase();
          const categories = (product.categories || '').toLowerCase();
          const ingredients = (product.ingredients_text || '').toLowerCase();
          
          let score = 0;
          
          // Score based on match location - exact product name matches are most valuable
          searchTerms.forEach(term => {
            // Full product name matches are worth a lot
            if (productName === term) score += 100;
            
            // Product name containing the term is next best
            else if (productName.includes(term)) score += 50;
            
            // Brand matches are also valuable
            if (brandName.includes(term)) score += 20;
            
            // Category and ingredient matches are helpful
            if (categories.includes(term)) score += 10;
            if (ingredients.includes(term)) score += 15;
            
            // Bonus for having nutritional info
            if (product.nutriments && 
                (product.nutriments.proteins_100g || 
                 product.nutriments.proteins || 
                 product.nutriments.fat_100g || 
                 product.nutriments.fat)) {
              score += 5;
            }
            
            // Bonus for having an image
            if (product.image_url) score += 5;
          });
          
          return { product, score };
        });
        
        // Sort by score (high to low) and extract just the product data
        const sortedResults = scoredResults
          .sort((a, b) => b.score - a.score)
          .map(item => item.product);
        
        if (sortedResults.length > 0) {
          setSearchResults(sortedResults);
        } else {
          toast({
            title: "No results found",
            description: "Try a different search term or check your spelling",
          });
          setSearchResults([]);
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

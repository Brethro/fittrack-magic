
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { searchUsdaFoods } from "@/utils/usdaApi";

type ApiStatus = "idle" | "checking" | "connected" | "error" | "rate_limited";

export function useApiConnection() {
  const { toast } = useToast();
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [usdaApiStatus, setUsdaApiStatus] = useState<ApiStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const lastUsdaCheckRef = useRef<number>(0);
  const isInitialMount = useRef(true);
  const apiCheckAttempted = useRef(false);
  
  // Check Open Food Facts API connection only once on initial mount
  useEffect(() => {
    // Only check on initial mount and if not already attempted
    if (isInitialMount.current && !apiCheckAttempted.current) {
      isInitialMount.current = false;
      apiCheckAttempted.current = true;
      
      const checkApiConnection = async () => {
        setApiStatus("checking");
        try {
          // Using a more reliable endpoint for testing connection
          const response = await fetch(
            "https://world.openfoodfacts.org/api/v2/search?fields=product_name,brands&page_size=1",
            { 
              method: 'GET',
              headers: { 'Accept': 'application/json' },
              signal: AbortSignal.timeout(5000) // Timeout after 5 seconds
            }
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
    }
  }, []);

  // Check USDA API connection with rate limiting
  const checkUsdaApiConnection = useCallback(async () => {
    // Prevent checking too frequently (once per minute)
    const now = Date.now();
    const minimumInterval = 60000; // 1 minute in milliseconds
    
    if (now - lastUsdaCheckRef.current < minimumInterval) {
      console.log("Skipping USDA API check due to rate limiting");
      return;
    }
    
    // If we've already successfully connected, don't check again
    if (usdaApiStatus === "connected") {
      console.log("USDA API already connected, skipping check");
      return;
    }
    
    lastUsdaCheckRef.current = now;
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
      console.error("USDA API check error:", error);
      
      // Check if it's a rate limit error
      if (error instanceof Error && 
          (error.message.includes("OVER_RATE_LIMIT") || 
           error.message.includes("rate limit") || 
           error.message.includes("429"))) {
        setUsdaApiStatus("rate_limited");
        toast({
          title: "USDA API Rate Limited",
          description: "You've reached the API rate limit. Please try again later.",
          variant: "destructive",
        });
      } else {
        setUsdaApiStatus("error");
        toast({
          title: "USDA API Error",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    }
  }, [toast, usdaApiStatus]);

  return {
    apiStatus,
    usdaApiStatus,
    errorMessage,
    checkUsdaApiConnection,
  };
}

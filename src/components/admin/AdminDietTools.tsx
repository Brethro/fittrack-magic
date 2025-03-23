
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Database, ExternalLink, Search, BarChart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { searchFoods, getPopularFoods } from "@/services/openFoodFacts";

export const AdminDietTools = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchFoods(searchQuery);
      setSearchResults(results);
      toast({
        title: "Search Complete",
        description: `Found ${results.length} food items`,
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Could not fetch food data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const checkApiStatus = async () => {
    setApiStatus("loading");
    try {
      const foods = await getPopularFoods();
      if (foods.length > 0) {
        setApiStatus("success");
        toast({
          title: "API Status",
          description: "Open Food Facts API is up and running.",
        });
      } else {
        setApiStatus("error");
        toast({
          title: "API Status",
          description: "API responded but returned no results.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("API status check error:", error);
      setApiStatus("error");
      toast({
        title: "API Status",
        description: "Could not connect to Open Food Facts API.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
        <Database className="h-4 w-4" />
        <AlertTitle>Open Food Facts Integration</AlertTitle>
        <AlertDescription>
          The food database now uses Open Food Facts API for real-time food data.
          Use the tools below to test and manage the integration.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">API Search</TabsTrigger>
          <TabsTrigger value="status">API Status</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Open Food Facts Search
              </CardTitle>
              <CardDescription>
                Search for food items in the Open Food Facts database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter food name (e.g., chicken, apple)"
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="border rounded-md p-4 space-y-3">
                    <h3 className="text-sm font-medium">Search Results</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {searchResults.map((item, index) => (
                        <div key={item.id || index} className="border-b pb-2">
                          <p className="font-medium">{item.name}</p>
                          <div className="grid grid-cols-3 gap-1 text-sm">
                            <span>Protein: {item.protein}g</span>
                            <span>Carbs: {item.carbs}g</span>
                            <span>Fat: {item.fats}g</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.servingSize} • {item.caloriesPerServing} calories
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5" />
                API Status
              </CardTitle>
              <CardDescription>
                Check the connection to Open Food Facts API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">API Connection Status</h3>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      apiStatus === 'idle' ? 'bg-gray-400' :
                      apiStatus === 'loading' ? 'bg-blue-500' :
                      apiStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <p className="text-sm">
                      {apiStatus === 'idle' ? 'Not Checked' :
                       apiStatus === 'loading' ? 'Checking...' :
                       apiStatus === 'success' ? 'Connected' : 'Connection Error'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <a 
                    href="https://wiki.openfoodfacts.org/API" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    API Documentation
                  </a>
                  
                  <Button 
                    onClick={checkApiStatus} 
                    disabled={apiStatus === 'loading'}
                    variant="outline"
                  >
                    Check API Status
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

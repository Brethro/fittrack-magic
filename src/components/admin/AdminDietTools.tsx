
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Database, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { foodCategoriesData } from "@/data/diet";
import { reparseFoodDatabaseForDietTypes } from "@/utils/diet/foodDataProcessing";

// Import all food data modules directly to ensure we parse everything
import { meatsAndPoultryData } from "@/data/diet/meatData";
import { nutsAndSeedsData } from "@/data/diet/nutsAndSeedsData";
import { healthyFatsData } from "@/data/diet/healthyFatsData";
import { spicesAndHerbsData } from "@/data/diet/spicesData";
import { beveragesData } from "@/data/diet/beveragesData";
import { starchyVegetablesData } from "@/data/diet/starchyVegetablesData";
import { otherVegetablesData } from "@/data/diet/otherVegetablesData";
import { greenVegetablesData } from "@/data/diet/greenVegetablesData";
import { plantProteinsData } from "@/data/diet/plantProteinsData";
import { condimentsAndSaucesData } from "@/data/diet/condimentsData";
import { fishAndSeafoodData } from "@/data/diet/seafoodData";
import { breadsAndBreakfastData } from "@/data/diet/breadsData";
import { eggsAndDairyData } from "@/data/diet/dairyData";
import { grainsAndPastasData } from "@/data/diet/grainsData";
import { fruitsData } from "@/data/diet/fruitsData";

export const AdminDietTools = () => {
  const { toast } = useToast();
  const [isReparsing, setIsReparsing] = useState(false);
  const [lastParseResults, setLastParseResults] = useState<string[]>([]);
  const [totalFoodItems, setTotalFoodItems] = useState<number>(0);

  // Get all raw food data (including categories that might be filtered out in foodCategoriesData)
  const getAllRawFoodData = () => {
    const allRawData = [
      meatsAndPoultryData,
      nutsAndSeedsData,
      healthyFatsData,
      spicesAndHerbsData,
      beveragesData,
      starchyVegetablesData,
      otherVegetablesData,
      greenVegetablesData,
      plantProteinsData,
      condimentsAndSaucesData,
      fishAndSeafoodData,
      breadsAndBreakfastData,
      eggsAndDairyData,
      grainsAndPastasData,
      fruitsData
    ];
    
    // Count total food items across all categories
    const total = allRawData.reduce((sum, category) => 
      sum + (category.items?.length || 0), 0);
    setTotalFoodItems(total);
    
    return allRawData;
  };

  const handleReparse = () => {
    setIsReparsing(true);
    
    // Small timeout to ensure UI updates
    setTimeout(() => {
      try {
        // Use ALL raw food data directly instead of the processed foodCategoriesData
        const allRawFoodData = getAllRawFoodData();
        console.log(`Reparsing with ALL food data - ${allRawFoodData.length} categories with ${totalFoodItems} total items`);
        
        const results = reparseFoodDatabaseForDietTypes(allRawFoodData);
        setLastParseResults(results);
        
        toast({
          title: "Database Reparsed",
          description: `Found ${results.length} diet types from ${totalFoodItems} food items`,
        });
      } catch (error) {
        console.error("Error reparsing food database:", error);
        toast({
          title: "Error Reparsing Database",
          description: "Check console for details",
          variant: "destructive",
        });
      } finally {
        setIsReparsing(false);
      }
    }, 100);
  };

  // Get total count on initial load
  useEffect(() => {
    getAllRawFoodData();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Diet Database Tools
          </CardTitle>
          <CardDescription>
            Tools for managing the diet database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Reparse Food Database for Diet Types</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will scan all {totalFoodItems} food items in the database and update the available diet types.
              </p>
              <Button 
                onClick={handleReparse} 
                disabled={isReparsing}
                className="flex items-center"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isReparsing ? 'animate-spin' : ''}`} />
                {isReparsing ? "Reparsing..." : "Reparse Diet Database"}
              </Button>
            </div>

            {lastParseResults.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Last Parse Results:</h4>
                <div className="bg-secondary/50 p-3 rounded text-sm">
                  <p>Found {lastParseResults.length} diet types from {totalFoodItems} food items:</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lastParseResults.map((diet) => (
                      <div key={diet} className="bg-primary/10 px-2 py-1 rounded text-xs">
                        {diet}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

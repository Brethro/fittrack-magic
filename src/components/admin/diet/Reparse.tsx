
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { reparseFoodDatabaseForDietTypes } from "@/utils/diet/foodDataProcessing";
import { useFoodDatabase } from "./FoodUtils";

type ReparseProps = {
  totalFoodItems: number;
  setLastParseResults: (results: string[]) => void;
}

export const Reparse = ({ totalFoodItems, setLastParseResults }: ReparseProps) => {
  const { toast } = useToast();
  const [isReparsing, setIsReparsing] = useState(false);
  const { getAllRawFoodData } = useFoodDatabase();

  const handleReparse = () => {
    setIsReparsing(true);
    
    // Small timeout to ensure UI updates
    setTimeout(() => {
      try {
        // Get all raw food data from the utility hook
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

  return (
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
  );
};

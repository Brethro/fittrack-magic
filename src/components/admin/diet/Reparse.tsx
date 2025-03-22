
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { reparseFoodDatabaseForDietTypes } from "@/utils/diet/foodDataProcessing";

type ReparseProps = {
  totalFoodItems: number;
  setLastParseResults: (results: string[]) => void;
}

export const Reparse = ({ totalFoodItems, setLastParseResults }: ReparseProps) => {
  const { toast } = useToast();
  const [isReparsing, setIsReparsing] = useState(false);

  const handleReparse = () => {
    setIsReparsing(true);
    
    // Small timeout to ensure UI updates
    setTimeout(() => {
      try {
        // Get all raw food data directly from the parent component
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

  // This function should come from the parent component
  const getAllRawFoodData = () => {
    // Import all food data modules directly
    const allRawData = [
      require('@/data/diet/meatData').meatsAndPoultryData,
      require('@/data/diet/nutsAndSeedsData').nutsAndSeedsData,
      require('@/data/diet/healthyFatsData').healthyFatsData,
      require('@/data/diet/spicesData').spicesAndHerbsData,
      require('@/data/diet/beveragesData').beveragesData,
      require('@/data/diet/starchyVegetablesData').starchyVegetablesData,
      require('@/data/diet/otherVegetablesData').otherVegetablesData,
      require('@/data/diet/greenVegetablesData').greenVegetablesData,
      require('@/data/diet/plantProteinsData').plantProteinsData,
      require('@/data/diet/condimentsData').condimentsAndSaucesData,
      require('@/data/diet/seafoodData').fishAndSeafoodData,
      require('@/data/diet/breadsData').breadsAndBreakfastData,
      require('@/data/diet/dairyData').eggsAndDairyData,
      require('@/data/diet/grainsData').grainsAndPastasData,
      require('@/data/diet/fruitsData').fruitsData
    ];
    
    return allRawData;
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

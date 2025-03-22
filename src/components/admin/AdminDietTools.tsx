
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Database } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { foodCategoriesData } from "@/data/diet";
import { reparseFoodDatabaseForDietTypes } from "@/utils/diet/foodDataProcessing";

export const AdminDietTools = () => {
  const { toast } = useToast();
  const [isReparsing, setIsReparsing] = useState(false);
  const [lastParseResults, setLastParseResults] = useState<string[]>([]);

  const handleReparse = () => {
    setIsReparsing(true);
    
    // Small timeout to ensure UI updates
    setTimeout(() => {
      try {
        const results = reparseFoodDatabaseForDietTypes(foodCategoriesData);
        setLastParseResults(results);
        
        toast({
          title: "Database Reparsed",
          description: `Found ${results.length} diet types`,
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
                This will scan all food items in the database and update the available diet types.
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
                  <p>Found {lastParseResults.length} diet types:</p>
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

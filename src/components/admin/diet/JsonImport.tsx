
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { importFoodsFromJson } from "@/utils/diet/foodManagement";

type JsonImportProps = {
  setLastParseResults: (results: string[]) => void;
}

export const JsonImport = ({ setLastParseResults }: JsonImportProps) => {
  const { toast } = useToast();
  const [jsonData, setJsonData] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleJsonImport = () => {
    if (!jsonData.trim()) {
      toast({
        title: "Missing Data",
        description: "Please enter JSON data to import",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Use the importFoodsFromJson function
      const result = importFoodsFromJson(jsonData);
      
      if (result.success) {
        // Update the last parse results
        setLastParseResults(result.dietTypes);
        
        toast({
          title: "Foods Imported",
          description: result.message,
        });
        
        // Reset the JSON data
        setJsonData("");
      } else {
        toast({
          title: "Error Importing Foods",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error importing foods from JSON:", error);
      toast({
        title: "Error Importing Foods",
        description: "Check console for details",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="mt-10 pt-6 border-t">
      <h3 className="text-sm font-medium mb-2">Import Foods from JSON</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Batch import food items from JSON. Supports both an array of food items or a categorized object format. Diet types will be automatically reparsed.
      </p>
      
      <Textarea
        value={jsonData}
        onChange={(e) => setJsonData(e.target.value)}
        placeholder='{"category1": [{"id": "food_1", "name": "Food Name", "primaryCategory": "category1", ...}], "category2": [...]}'
        className="min-h-32 mb-4 font-mono text-xs"
      />
      
      <Button 
        onClick={handleJsonImport} 
        disabled={isImporting}
        className="flex items-center"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isImporting ? "Importing..." : "Import Foods from JSON"}
      </Button>
    </div>
  );
};

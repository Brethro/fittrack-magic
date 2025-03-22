
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { importFoodsFromJson } from "@/utils/diet/foodManagement";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CategoryManager } from "./CategoryManager";

type JsonImportProps = {
  setLastParseResults: (results: string[]) => void;
}

export const JsonImport = ({ setLastParseResults }: JsonImportProps) => {
  const { toast } = useToast();
  const [jsonData, setJsonData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [categoryMappings, setCategoryMappings] = useState<Record<string, string>>({});

  const handleCategoryMappingUpdate = (mappings: Record<string, string>) => {
    setCategoryMappings(mappings);
  };

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
    setImportError(null);
    
    try {
      // Use the importFoodsFromJson function with category mappings
      const result = importFoodsFromJson(jsonData, categoryMappings);
      
      if (result.success) {
        // Update the last parse results
        setLastParseResults(result.dietTypes);
        
        toast({
          title: "Foods Imported",
          description: result.message,
        });
        
        // Reset the JSON data only if successful
        if (result.failedCount === 0) {
          setJsonData("");
        }
      } else {
        // Store the detailed error message
        setImportError(result.message);
        
        toast({
          title: "Error Importing Foods",
          description: "See details below",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error importing foods from JSON:", error);
      
      // Provide detailed error information
      const errorMessage = error instanceof Error 
        ? `${error.name}: ${error.message}` 
        : String(error);
      
      setImportError(errorMessage);
      
      toast({
        title: "Error Importing Foods",
        description: "See details below",
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
      
      {importError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Import Failed</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap">{importError}</AlertDescription>
        </Alert>
      )}
      
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
      
      {/* Add the CategoryManager component */}
      <CategoryManager onCategoryMappingUpdate={handleCategoryMappingUpdate} />
    </div>
  );
};

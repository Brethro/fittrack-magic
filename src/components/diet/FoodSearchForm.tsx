
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface FoodSearchFormProps {
  onSearch: (query: string, searchType: "exact" | "broad", searchSource: "both" | "openfoods" | "usda") => Promise<void>;
  isLoading: boolean;
}

const FoodSearchForm = ({ onSearch, isLoading }: FoodSearchFormProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"exact" | "broad">("exact");
  const [searchSource, setSearchSource] = useState<"both" | "openfoods" | "usda">("usda");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Empty search",
        description: "Please enter a food to search for",
        variant: "destructive",
      });
      return;
    }

    await onSearch(searchQuery, searchType, searchSource);
  };

  const toggleSearchType = () => {
    setSearchType(prev => prev === "exact" ? "broad" : "exact");
  };

  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Food Search</h2>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            placeholder="Search for a food (e.g., apple, yogurt)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isLoading} className="px-6">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" /> Search
              </>
            )}
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Search mode: <span className="font-medium">{searchType === "exact" ? "Exact match" : "Broad match"}</span>
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleSearchType} 
              className="text-xs h-7"
            >
              Switch to {searchType === "exact" ? "broad" : "exact"} search
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Data source:
            </span>
            <Select 
              value={searchSource} 
              onValueChange={(value) => setSearchSource(value as "both" | "openfoods" | "usda")}
            >
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Both databases</SelectItem>
                <SelectItem value="openfoods">Open Food Facts</SelectItem>
                <SelectItem value="usda">USDA Database</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodSearchForm;

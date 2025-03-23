
import { useState } from "react";
import { Search, Loader2, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export interface UserPreferences {
  dietary?: string[];
  excludeIngredients?: string[];
  preferHighProtein?: boolean;
}

interface FoodSearchFormProps {
  onSearch: (
    query: string, 
    searchType: "exact" | "broad", 
    searchSource: "both" | "openfoods" | "usda",
    preferences?: UserPreferences
  ) => Promise<void>;
  isLoading: boolean;
}

const DIETARY_OPTIONS = [
  { label: "Vegan", value: "vegan" },
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Gluten Free", value: "gluten-free" },
  { label: "Organic", value: "organic" },
  { label: "Dairy Free", value: "dairy-free" },
  { label: "Low Sugar", value: "low-sugar" },
];

const FoodSearchForm = ({ onSearch, isLoading }: FoodSearchFormProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"exact" | "broad">("exact");
  const [searchSource, setSearchSource] = useState<"both" | "openfoods" | "usda">("usda");
  const [showFilters, setShowFilters] = useState(false);
  
  // User preference states
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [excludeIngredient, setExcludeIngredient] = useState("");
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [preferHighProtein, setPreferHighProtein] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Empty search",
        description: "Please enter a food to search for",
        variant: "destructive",
      });
      return;
    }

    // Collect user preferences
    const preferences: UserPreferences = {};
    
    if (selectedDietary.length > 0) {
      preferences.dietary = selectedDietary;
    }
    
    if (excludedIngredients.length > 0) {
      preferences.excludeIngredients = excludedIngredients;
    }
    
    if (preferHighProtein) {
      preferences.preferHighProtein = true;
    }
    
    await onSearch(
      searchQuery, 
      searchType, 
      searchSource, 
      Object.keys(preferences).length > 0 ? preferences : undefined
    );
  };

  const toggleSearchType = () => {
    setSearchType(prev => prev === "exact" ? "broad" : "exact");
  };
  
  const addExcludedIngredient = () => {
    if (excludeIngredient.trim() && !excludedIngredients.includes(excludeIngredient.trim())) {
      setExcludedIngredients(prev => [...prev, excludeIngredient.trim()]);
      setExcludeIngredient("");
    }
  };
  
  const removeExcludedIngredient = (ingredient: string) => {
    setExcludedIngredients(prev => prev.filter(item => item !== ingredient));
  };
  
  const toggleDietaryOption = (option: string) => {
    setSelectedDietary(prev => 
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
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
        
        {/* Search Filters */}
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs h-7"
          >
            {showFilters ? "Hide Filters" : "Show Filters"} 
            {(selectedDietary.length > 0 || excludedIngredients.length > 0 || preferHighProtein) && (
              <Badge className="ml-2 bg-primary-foreground text-primary h-5">
                {selectedDietary.length + excludedIngredients.length + (preferHighProtein ? 1 : 0)}
              </Badge>
            )}
          </Button>
          
          {showFilters && (
            <div className="mt-3 space-y-4 p-3 border rounded-md bg-background/50">
              {/* Dietary Preferences */}
              <div>
                <h3 className="text-sm font-medium mb-2">Dietary Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map(option => (
                    <Badge
                      key={option.value}
                      variant={selectedDietary.includes(option.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleDietaryOption(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Exclude Ingredients */}
              <div>
                <h3 className="text-sm font-medium mb-2">Exclude Ingredients</h3>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Enter ingredient to exclude"
                    value={excludeIngredient}
                    onChange={(e) => setExcludeIngredient(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addExcludedIngredient()}
                    className="h-8 text-sm"
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={addExcludedIngredient}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {excludedIngredients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {excludedIngredients.map(ingredient => (
                      <Badge key={ingredient} variant="secondary" className="pl-2">
                        {ingredient}
                        <button 
                          onClick={() => removeExcludedIngredient(ingredient)}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Nutritional Preferences */}
              <div>
                <h3 className="text-sm font-medium mb-2">Nutritional Preferences</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="protein-preference"
                    checked={preferHighProtein}
                    onCheckedChange={setPreferHighProtein}
                  />
                  <Label htmlFor="protein-preference">Prefer high protein foods</Label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FoodSearchForm;

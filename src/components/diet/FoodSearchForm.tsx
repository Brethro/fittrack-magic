import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Settings2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";

export interface UserPreferences {
  dietary?: string[];
  excludeIngredients?: string[];
  preferHighProtein?: boolean;
}

interface FoodSearchFormProps {
  onSearch: (
    searchQuery: string, 
    searchSource: "both" | "openfoods" | "usda",
    userPreferences?: UserPreferences
  ) => void;
  isLoading?: boolean;
  disableUsdaOption?: boolean; // New prop to control USDA option visibility
}

const FoodSearchForm = ({ onSearch, isLoading = false, disableUsdaOption = false }: FoodSearchFormProps) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSource, setSearchSource] = useState<"both" | "openfoods" | "usda">("openfoods"); // Default to openfoods
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  
  // User preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    dietary: [],
    excludeIngredients: [],
    preferHighProtein: false,
  });
  
  // Load user preferences from local storage
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem("food_search_preferences");
      if (savedPreferences) {
        setUserPreferences(JSON.parse(savedPreferences));
      }
      
      // If USDA is disabled, force searchSource to "openfoods" regardless of saved preference
      if (disableUsdaOption) {
        setSearchSource("openfoods");
      } else {
        const savedSource = localStorage.getItem("food_search_source");
        if (savedSource) {
          setSearchSource(savedSource as "both" | "openfoods" | "usda");
        }
      }
    } catch (error) {
      console.error("Error loading search preferences:", error);
    }
  }, [disableUsdaOption]);
  
  // Save user preferences to local storage
  const savePreferences = (newPreferences: UserPreferences, newSource?: "both" | "openfoods" | "usda") => {
    try {
      localStorage.setItem("food_search_preferences", JSON.stringify(newPreferences));
      setUserPreferences(newPreferences);
      
      if (newSource && !disableUsdaOption) {
        localStorage.setItem("food_search_source", newSource);
        setSearchSource(newSource);
      }
    } catch (error) {
      console.error("Error saving search preferences:", error);
    }
  };
  
  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Force "openfoods" as searchSource if USDA is disabled
      const effectiveSearchSource = disableUsdaOption ? "openfoods" : searchSource;
      onSearch(searchQuery, effectiveSearchSource, userPreferences);
    }
  };
  
  // Handle dietary preference toggle
  const toggleDietary = (diet: string) => {
    const current = [...(userPreferences.dietary || [])];
    const newDietary = current.includes(diet)
      ? current.filter(d => d !== diet)
      : [...current, diet];
    
    savePreferences({
      ...userPreferences,
      dietary: newDietary
    });
  };
  
  // Handle excluded ingredient toggle
  const toggleExcludeIngredient = (ingredient: string) => {
    const current = [...(userPreferences.excludeIngredients || [])];
    const newExcluded = current.includes(ingredient)
      ? current.filter(i => i !== ingredient)
      : [...current, ingredient];
    
    savePreferences({
      ...userPreferences,
      excludeIngredients: newExcluded
    });
  };
  
  // Common dietary preferences and allergens
  const dietaryOptions = [
    "vegetarian",
    "vegan",
    "gluten-free",
    "organic",
    "kosher",
    "halal",
  ];
  
  const allergenOptions = [
    "gluten",
    "dairy",
    "peanuts",
    "tree-nuts",
    "soy",
    "eggs",
    "shellfish",
    "fish",
  ];
  
  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search for a food (e.g., chicken breast, apple)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
        
        <div className="flex gap-2">
          <Sheet open={preferencesOpen} onOpenChange={setPreferencesOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" type="button" size="icon" className="relative">
                <Settings2 className="h-4 w-4" />
                {(userPreferences.dietary?.length || userPreferences.excludeIngredients?.length || userPreferences.preferHighProtein) && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Search Settings</SheetTitle>
                <SheetDescription>
                  Customize your food search to find exactly what you're looking for.
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-4 space-y-4">
                {/* Search source - only show if USDA is not disabled */}
                {!disableUsdaOption && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Search In</h3>
                    <Tabs 
                      defaultValue={searchSource} 
                      onValueChange={(value) => savePreferences(userPreferences, value as "both" | "openfoods" | "usda")}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="both">Both</TabsTrigger>
                        <TabsTrigger value="openfoods">Open Food Facts</TabsTrigger>
                        <TabsTrigger value="usda">USDA Database</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                )}
                
                <Separator />
                
                {/* High protein preference */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-protein">Prefer High Protein</Label>
                    <p className="text-xs text-muted-foreground">Prioritize foods higher in protein</p>
                  </div>
                  <Switch
                    id="high-protein"
                    checked={userPreferences.preferHighProtein}
                    onCheckedChange={(checked) => savePreferences({
                      ...userPreferences,
                      preferHighProtein: checked
                    })}
                  />
                </div>
                
                <Separator />
                
                {/* Dietary preferences */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Dietary Preferences</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {dietaryOptions.map(diet => (
                      <div key={diet} className="flex items-center space-x-2">
                        <Checkbox 
                          id={diet} 
                          checked={userPreferences.dietary?.includes(diet)}
                          onCheckedChange={() => toggleDietary(diet)}
                        />
                        <Label htmlFor={diet} className="text-sm capitalize">{diet}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Exclude ingredients/allergens */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Exclude Ingredients</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {allergenOptions.map(allergen => (
                      <div key={allergen} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`exclude-${allergen}`} 
                          checked={userPreferences.excludeIngredients?.includes(allergen)}
                          onCheckedChange={() => toggleExcludeIngredient(allergen)}
                        />
                        <Label htmlFor={`exclude-${allergen}`} className="text-sm capitalize">{allergen}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    className="w-full" 
                    onClick={() => setPreferencesOpen(false)}
                  >
                    Apply Settings
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Search
          </Button>
        </div>
      </form>
      
      {/* Current settings display */}
      {(userPreferences.dietary?.length > 0 || 
        userPreferences.excludeIngredients?.length > 0 || 
        userPreferences.preferHighProtein) && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {!disableUsdaOption && searchSource !== "both" && (
            <Badge variant="outline" className="text-xs">
              Source: {searchSource === "openfoods" ? "Open Food Facts" : "USDA Database"}
            </Badge>
          )}
          
          {userPreferences.preferHighProtein && (
            <Badge variant="outline" className="text-xs">
              High Protein
            </Badge>
          )}
          
          {userPreferences.dietary?.map(diet => (
            <Badge key={diet} variant="outline" className="text-xs capitalize">
              {diet}
            </Badge>
          ))}
          
          {userPreferences.excludeIngredients?.map(ingredient => (
            <Badge key={ingredient} variant="outline" className="text-xs">
              No {ingredient}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodSearchForm;

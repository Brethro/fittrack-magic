
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DietType } from "@/types/diet";
import { Info, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const dietDescriptions: Record<string, string> = {
  all: "All foods available",
  mediterranean: "Rich in olive oil, vegetables, fruits, fish, and moderate wine",
  vegetarian: "Excludes meat and seafood, includes dairy and eggs",
  vegan: "Plant-based only, excludes all animal products including dairy and eggs",
  japanese: "Rich in seafood, rice, vegetables, fermented foods, and minimal dairy",
  korean: "Featuring fermented foods, vegetables, rice, and meat dishes",
  mexican: "Corn, beans, rice, vegetables, and spices with meat and dairy",
  italian: "Pasta, olive oil, tomatoes, cheese, and diverse proteins",
  paleo: "Mimics hunter-gatherer diet with meats, fish, fruits, vegetables, nuts, seeds",
  keto: "High fat, moderate protein, very low carb for ketosis",
  pescatarian: "Plant-based diet that includes fish and seafood, but excludes other meats",
  "low-carb": "Restricts carbohydrate intake to favor protein and fat sources",
  "high-protein": "Emphasizes protein-rich foods for muscle building and satiety",
  carnivore: "Animal products only, excludes all plant foods",
  whole30: "30-day reset eliminating grains, dairy, legumes, alcohol, and added sugar",
  atkins: "Phased approach starting with severe carb restriction, gradually adding some back",
  zone: "Balanced macronutrients with 40% carbs, 30% protein, and 30% fat"
};

// Function to format diet name for display
const formatDietName = (diet: string): string => {
  if (diet === "all") return "All Foods";
  
  // Handle hyphenated names like "low-carb"
  if (diet.includes("-")) {
    return diet.split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join("-");
  }
  
  // Regular capitalization
  return diet.charAt(0).toUpperCase() + diet.slice(1);
};

interface DietSelectorProps {
  selectedDiet: DietType;
  onDietChange: (diet: DietType) => void;
  availableDiets: DietType[];
}

export function DietSelector({ selectedDiet, onDietChange, availableDiets }: DietSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Debug what diets are actually available
  React.useEffect(() => {
    console.log("Available diets in DietSelector:", availableDiets);
  }, [availableDiets]);

  return (
    <Card className="mb-6">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 hover:bg-accent/50 transition-colors">
          <div className="flex items-center">
            <h3 className="text-lg font-medium">Dietary Preference: {formatDietName(selectedDiet)}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-2 h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>Select a diet type to filter food options that match your preference.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen ? "rotate-180" : "rotate-0"
          )} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Choose a specific diet to filter compatible foods
            </p>
            
            <ToggleGroup type="single" value={selectedDiet} onValueChange={(value) => {
              if (value) onDietChange(value as DietType);
            }} className="flex flex-wrap gap-2 justify-start">
              {availableDiets.map((diet) => (
                <ToggleGroupItem key={diet} value={diet} className="rounded-full">
                  {formatDietName(diet)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            
            {selectedDiet !== "all" && dietDescriptions[selectedDiet] && (
              <p className="mt-4 text-sm">
                <span className="font-medium">{formatDietName(selectedDiet)}:</span>{" "}
                {dietDescriptions[selectedDiet]}
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

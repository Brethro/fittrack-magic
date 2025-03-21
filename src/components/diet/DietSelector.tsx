
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DietType } from "@/types/diet";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const dietDescriptions: Record<DietType, string> = {
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
  pescatarian: "Plant-based diet that includes fish and seafood, but excludes other meats"
};

interface DietSelectorProps {
  selectedDiet: DietType;
  onDietChange: (diet: DietType) => void;
  availableDiets: DietType[];
}

export function DietSelector({ selectedDiet, onDietChange, availableDiets }: DietSelectorProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center">
          <h3 className="text-lg font-medium">Dietary Preference</h3>
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
        <p className="text-sm text-muted-foreground mb-4">
          Choose a specific diet to filter compatible foods
        </p>
        
        <ToggleGroup type="single" value={selectedDiet} onValueChange={(value) => {
          if (value) onDietChange(value as DietType);
        }} className="flex flex-wrap gap-2 justify-start">
          {availableDiets.map((diet) => (
            <ToggleGroupItem key={diet} value={diet} className="rounded-full">
              {diet === "all" ? "All Foods" : diet.charAt(0).toUpperCase() + diet.slice(1)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        
        {selectedDiet !== "all" && (
          <p className="mt-4 text-sm">
            <span className="font-medium">{selectedDiet.charAt(0).toUpperCase() + selectedDiet.slice(1)}:</span>{" "}
            {dietDescriptions[selectedDiet]}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

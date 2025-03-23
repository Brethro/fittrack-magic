
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { DietType, FoodItem } from "@/types/diet";

interface FoodSubcategoryListProps {
  categoryName: string;
  subcategoryName: string;
  subcategoryItems: FoodItem[];
  selectedFoods: Record<string, boolean>;
  toggleFoodSelection: (foodId: string) => void;
  toggleAllInGroup: (foodIds: string[]) => void;
  searchQuery: string;
  selectedDiet: DietType;
  openSubcategories: Record<string, boolean>;
  toggleSubcategory: (subcategory: string) => void;
  openFeedbackDialog: (food: FoodItem, event: React.MouseEvent) => void;
  openNutritionDialog: (food: FoodItem) => void;
  isLoading?: boolean;
}

export function FoodSubcategoryList({ 
  subcategoryItems,
  selectedFoods 
}: FoodSubcategoryListProps) {
  // Minimal implementation that just returns null
  return null;
}

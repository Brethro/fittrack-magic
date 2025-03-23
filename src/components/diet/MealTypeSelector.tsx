
import { Coffee, Sun, Moon, CookingPot } from "lucide-react";

interface MealTypeSelectorProps {
  selectedMeal: "breakfast" | "lunch" | "dinner" | "snack";
  onChange: (meal: "breakfast" | "lunch" | "dinner" | "snack") => void;
}

const MealTypeSelector = ({ selectedMeal, onChange }: MealTypeSelectorProps) => {
  const mealTypes = [
    { id: "breakfast", name: "Breakfast", icon: <Coffee className="h-4 w-4" /> },
    { id: "lunch", name: "Lunch", icon: <Sun className="h-4 w-4" /> },
    { id: "dinner", name: "Dinner", icon: <Moon className="h-4 w-4" /> },
    { id: "snack", name: "Snack", icon: <CookingPot className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-1.5 mb-4 w-full">
      {mealTypes.map((meal) => (
        <button
          key={meal.id}
          onClick={() => onChange(meal.id)}
          className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-md text-sm transition-all
            ${selectedMeal === meal.id 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary hover:bg-secondary/80"}`}
        >
          {meal.icon}
          <span className="text-xs">{meal.name}</span>
        </button>
      ))}
    </div>
  );
};

export default MealTypeSelector;

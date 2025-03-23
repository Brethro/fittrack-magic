
import { Coffee, Sun, CloudSun, Moon, CookingPot } from "lucide-react";

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
    <div className="flex flex-wrap gap-2 justify-center mb-4">
      {mealTypes.map((meal) => (
        <button
          key={meal.id}
          onClick={() => onChange(meal.id)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm 
            ${selectedMeal === meal.id 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary hover:bg-secondary/80"}`}
        >
          {meal.icon}
          <span>{meal.name}</span>
        </button>
      ))}
    </div>
  );
};

export default MealTypeSelector;

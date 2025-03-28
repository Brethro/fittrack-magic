
// Helper to extract nutrition info from USDA food format
export function extractNutritionFromUsda(usdaFood: any) {
  const nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugars: 0
  };

  // Map USDA nutrient IDs to our properties
  const nutrientMap: Record<number, keyof typeof nutrition> = {
    1008: 'calories', // Energy (kcal)
    1003: 'protein',  // Protein
    1005: 'carbs',    // Carbohydrates
    1004: 'fat',      // Total lipids (fat)
    1079: 'fiber',    // Fiber
    2000: 'sugars'    // Total sugars
  };

  // Extract values from USDA format
  if (usdaFood.foodNutrients) {
    usdaFood.foodNutrients.forEach((nutrient: any) => {
      const id = nutrient.nutrientId || nutrient.nutrient?.id;
      if (id && nutrientMap[id]) {
        nutrition[nutrientMap[id]] = nutrient.value || 0;
      }
    });
  }

  return nutrition;
}

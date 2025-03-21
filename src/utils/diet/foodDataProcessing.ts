
import { FoodCategory, FoodItem } from "@/types/diet";
import { migrateExistingFoodData, batchMigrateExistingFoodData, validateFoodData } from "@/utils/diet/dietDataMigration";
import { tagFoodWithDiets } from "@/utils/diet/dietDataMigration";

// Process each food item with the migration helper to add primaryCategory and validate
export const processRawFoodData = (categories: { name: string, items: Omit<FoodItem, 'primaryCategory'>[] }[]): FoodCategory[] => {
  console.log("Processing raw food data...");
  
  const processedCategories = categories.map(category => {
    console.log(`Processing category: ${category.name}`);
    
    const migratedItems = category.items.map(item => {
      // First ensure we have proper categorization
      const migratedItem = migrateExistingFoodData(item as FoodItem);
      
      // Validate the migrated item
      const validation = validateFoodData(migratedItem);
      if (!validation.isValid) {
        console.warn(`Validation issues with food "${migratedItem.name}" in category "${category.name}":`, validation.issues);
      }
      
      // Add diet compatibility tags
      return tagFoodWithDiets(migratedItem);
    });
    
    return {
      name: category.name,
      items: migratedItems
    };
  });
  
  console.log("Food data processing complete.");
  return processedCategories;
};

// Process and validate all food data in batch
export const batchProcessFoodData = (categories: { name: string, items: Omit<FoodItem, 'primaryCategory'>[] }[]): FoodCategory[] => {
  const startTime = performance.now();
  
  // First migrate all items to have proper categorization
  const migratedCategories = categories.map(category => ({
    name: category.name,
    items: batchMigrateExistingFoodData(category.items as Partial<FoodItem>[])
  }));
  
  // Then tag all items with diet compatibility
  const processedCategories = migratedCategories.map(category => ({
    name: category.name,
    items: category.items.map(item => tagFoodWithDiets(item))
  }));
  
  const endTime = performance.now();
  console.log(`Batch food data processing completed in ${(endTime - startTime).toFixed(2)}ms`);
  
  return processedCategories;
};

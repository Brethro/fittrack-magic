/**
 * Converts kebab-case, camelCase or snake_case to Title Case for display
 */
export const getCategoryDisplayName = (categoryName: string): string => {
  if (!categoryName) return 'Other';
  
  // Handle special case for 'redMeat'
  if (categoryName === 'redMeat') return 'Red Meat';
  
  // If it already has spaces, just capitalize first letter of each word
  if (categoryName.includes(' ')) {
    return categoryName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Handle kebab-case
  if (categoryName.includes('-')) {
    return categoryName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Handle snake_case
  if (categoryName.includes('_')) {
    return categoryName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Handle camelCase
  // Insert a space before all capital letters and uppercase the first letter
  return categoryName
    // First capitalize the first letter
    .replace(/^([a-z])/, (match) => match.toUpperCase())
    // Then insert a space before all caps
    .replace(/([A-Z])/g, ' $1')
    // Remove any duplicate spaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Gets the appropriate display name based on category hierarchy
 */
export const getDisplayNameForCategory = (category: string): string => {
  const displayNameMap: Record<string, string> = {
    'vegetables': 'Vegetables',
    'fruits': 'Fruits',
    'grains': 'Grains & Cereals',
    'protein': 'Protein Sources',
    'dairy': 'Dairy Products',
    'fats': 'Healthy Fats',
    'nuts': 'Nuts & Seeds',
    'seafood': 'Seafood',
    'poultry': 'Poultry',
    'redMeat': 'Red Meat',
    'legumes': 'Legumes & Beans',
    'condiments': 'Condiments & Sauces',
    'beverages': 'Beverages',
    'desserts': 'Desserts & Sweets',
    'miscellaneous': 'Miscellaneous',
  };
  
  return displayNameMap[category] || getCategoryDisplayName(category);
};

/**
 * Assigns a default category to a food item based on its name or other properties
 */
export const assignDefaultCategory = (food: import('@/types/diet').FoodItem): import('@/types/diet').FoodPrimaryCategory => {
  const name = food.name.toLowerCase();

  // Basic categorization patterns
  if (/chicken|turkey|duck|fowl|poultry/i.test(name)) return 'poultry';
  if (/beef|steak|pork|lamb|veal|bison|venison|redMeat/i.test(name)) return 'redMeat';
  if (/fish|salmon|tuna|cod|tilapia|sardine|anchov|trout/i.test(name)) return 'fish';
  if (/shrimp|prawn|lobster|crab|clam|mussel|oyster|scallop/i.test(name)) return 'seafood';
  if (/milk|cheese|yogurt|butter|cream|dairy/i.test(name)) return 'dairy';
  if (/bread|bun|roll|bagel|croissant|pastry|muffin/i.test(name)) return 'grain';
  if (/rice|pasta|noodle|grain|cereal|oat|quinoa|barley/i.test(name)) return 'grain';
  if (/apple|orange|banana|berry|fruit|pear|grape|melon/i.test(name)) return 'fruit';
  if (/vegetable|broccoli|carrot|spinach|lettuce|greens/i.test(name)) return 'vegetable';
  if (/bean|lentil|pea|tofu|tempeh|legume/i.test(name)) return 'legume';
  if (/oil|avocado|olive|coconut|fat/i.test(name)) return 'oil';
  if (/nut|seed|almond|peanut|walnut|cashew/i.test(name)) return 'nut';
  if (/sauce|dressing|condiment|ketchup|mustard/i.test(name)) return 'processedFood';
  if (/water|juice|soda|coffee|tea|drink|beverage/i.test(name)) return 'processedFood';
  
  // Default fallback
  return 'other';
};

/**
 * Infers possible secondary categories for a food item
 */
export const inferSecondaryCategories = (food: import('@/types/diet').FoodItem): import('@/types/diet').FoodPrimaryCategory[] | undefined => {
  const name = food.name.toLowerCase();
  const secondaryCategories: import('@/types/diet').FoodPrimaryCategory[] = [];
  
  // Add meat category for all meat types
  if (food.primaryCategory === 'poultry' || 
      food.primaryCategory === 'redMeat' || 
      food.primaryCategory === 'fish') {
    secondaryCategories.push('meat');
  }
  
  // Add protein category for protein-rich foods
  if (['meat', 'poultry', 'redMeat', 'seafood', 'fish', 'legume', 'nut'].includes(food.primaryCategory as string) || 
      food.protein > 10) {
    secondaryCategories.push('meat'); // Using 'meat' as a proxy for protein-rich foods
  }
  
  // Add fruit category for fruit-based items
  if (/fruit|berry|apple|orange|banana|pear|grape|melon/i.test(name) && 
      food.primaryCategory !== 'fruit') {
    secondaryCategories.push('fruit');
  }
  
  // Add vegetables category for veggie-based items
  if (/veggie|vegetable|salad|broccoli|spinach|kale|carrot/i.test(name) && 
      food.primaryCategory !== 'vegetable') {
    secondaryCategories.push('vegetable');
  }
  
  return secondaryCategories.length > 0 ? secondaryCategories : undefined;
};

/**
 * Resolves ambiguous categories based on additional food properties
 */
export const resolveAmbiguousCategory = (food: import('@/types/diet').FoodItem): import('@/types/diet').FoodPrimaryCategory => {
  const name = food.name.toLowerCase();
  
  // Use macros to help determine category
  if (food.protein > 15 && food.carbs < 5) {
    // High protein, low carb likely meat or seafood
    if (/fish|salmon|tuna|cod|seafood/i.test(name)) return 'fish';
    if (/chicken|turkey|poultry/i.test(name)) return 'poultry';
    return 'meat';
  }
  
  if (food.carbs > 20 && food.protein < 5) {
    // High carb, low protein likely fruit, grain or starchy veggie
    if (/sweet|sugar|dessert/i.test(name)) return 'processedFood';
    if (/fruit|berry|apple|banana/i.test(name)) return 'fruit';
    return 'grain';
  }
  
  if (food.fats > 15) {
    // High fat items
    if (/oil|butter|cream/i.test(name)) return 'oil';
    if (/nut|seed|almond|peanut/i.test(name)) return 'nut';
    return 'oil';
  }
  
  // Check for prepared foods or dishes
  if (/salad|soup|stew|curry|dish|meal|prepared/i.test(name)) {
    return 'processedFood';
  }
  
  // Keep 'other' as fallback
  return 'other';
};

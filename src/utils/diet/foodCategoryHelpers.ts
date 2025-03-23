
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


import { FoodItem, FoodCategory } from '@/types/diet';

// Types for monitoring
type CategorizeEvent = {
  foodName: string;
  assignedCategory: string;
  confidence: number;
  timestamp: number;
};

type ErrorEvent = {
  type: 'categorization' | 'compatibility' | 'other';
  message: string;
  details?: any;
  timestamp: number;
};

// Store for monitoring events
const monitoringEvents: (CategorizeEvent | ErrorEvent)[] = [];
const MAX_EVENTS = 100; // Maximum number of events to keep in memory

/**
 * Logs a categorization event for monitoring
 */
export const logCategorizationEvent = (
  foodItem: FoodItem,
  assignedCategory: string,
  confidence: number = 1.0
) => {
  const event: CategorizeEvent = {
    foodName: foodItem.name,
    assignedCategory,
    confidence,
    timestamp: Date.now()
  };
  
  // Add to monitoring store with size limit
  monitoringEvents.push(event);
  if (monitoringEvents.length > MAX_EVENTS) {
    monitoringEvents.shift(); // Remove oldest event
  }
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Diet App: Categorized "${foodItem.name}" as "${assignedCategory}" (confidence: ${confidence.toFixed(2)})`);
  }
};

/**
 * Logs an error event for monitoring
 */
export const logErrorEvent = (
  type: 'categorization' | 'compatibility' | 'other',
  message: string,
  details?: any
) => {
  const event: ErrorEvent = {
    type,
    message,
    details,
    timestamp: Date.now()
  };
  
  // Add to monitoring store with size limit
  monitoringEvents.push(event);
  if (monitoringEvents.length > MAX_EVENTS) {
    monitoringEvents.shift(); // Remove oldest event
  }
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`Diet App Error (${type}): ${message}`, details);
  }
};

/**
 * Gets recent monitoring events for debugging
 */
export const getMonitoringEvents = () => {
  return [...monitoringEvents];
};

/**
 * Gets categorization accuracy statistics
 */
export const getCategorizationStats = () => {
  const categorizationEvents = monitoringEvents.filter(
    (event): event is CategorizeEvent => 'foodName' in event
  );
  
  if (categorizationEvents.length === 0) {
    return { averageConfidence: 0, total: 0 };
  }
  
  const totalConfidence = categorizationEvents.reduce(
    (sum, event) => sum + event.confidence, 
    0
  );
  
  return {
    averageConfidence: totalConfidence / categorizationEvents.length,
    total: categorizationEvents.length
  };
};

/**
 * Tests food categorization logic with sample data
 */
export const testCategorization = (
  categorizeFn: (food: Partial<FoodItem>) => string | null,
  sampleSize: number = 10
) => {
  // Sample test data with known categories
  const testData: Array<[Partial<FoodItem>, string]> = [
    [{ name: "Grilled Chicken Breast" }, "Meats & Poultry"],
    [{ name: "Atlantic Salmon" }, "Fish & Seafood"],
    [{ name: "Greek Yogurt" }, "Eggs & Dairy"],
    [{ name: "Firm Tofu" }, "Plant Proteins"],
    [{ name: "Brown Rice" }, "Grains & Pastas"],
    [{ name: "Sweet Potato" }, "Starchy Vegetables"],
    [{ name: "Whole Wheat Bread" }, "Breads & Breakfast"],
    [{ name: "Fresh Spinach" }, "Green Vegetables"],
    [{ name: "Bell Pepper" }, "Other Vegetables"],
    [{ name: "Apple" }, "Fruits"],
    [{ name: "Almonds" }, "Nuts & Seeds"],
    [{ name: "Olive Oil" }, "Healthy Fats"],
    [{ name: "Tomato Sauce" }, "Condiments & Sauces"],
    [{ name: "Green Tea" }, "Beverages"],
    [{ name: "Cinnamon" }, "Spices & Herbs"]
  ];
  
  // Take a random sample of the test data
  const shuffled = [...testData].sort(() => 0.5 - Math.random());
  const sampleData = shuffled.slice(0, Math.min(sampleSize, testData.length));
  
  // Run tests
  const results = sampleData.map(([food, expectedCategory]) => {
    const assignedCategory = categorizeFn(food);
    const success = assignedCategory === expectedCategory;
    
    return {
      foodName: food.name,
      expectedCategory,
      assignedCategory,
      success
    };
  });
  
  // Calculate success rate
  const successCount = results.filter(r => r.success).length;
  const successRate = successCount / results.length;
  
  return {
    successRate,
    totalTests: results.length,
    details: results
  };
};

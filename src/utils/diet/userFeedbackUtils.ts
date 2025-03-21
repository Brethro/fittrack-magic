
import { FoodItem, FoodCategory, FoodPrimaryCategory } from '@/types/diet';
import { logErrorEvent, logCategorizationEvent } from './testingMonitoring';

// Type definitions for user feedback
export type FeedbackEntry = {
  id: string;
  foodItem: FoodItem;
  suggestedCategory: string;
  originalCategory: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  userId?: string; // Optional user identifier
};

// In-memory store for feedback (in a real app, this would be in a database)
const feedbackStore: FeedbackEntry[] = [];

/**
 * Generates a unique ID for feedback entries
 */
const generateFeedbackId = (): string => {
  return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Submits user feedback about food categorization
 */
export const submitCategoryFeedback = (
  foodItem: FoodItem,
  suggestedCategory: string,
  reason: string,
  userId?: string
): FeedbackEntry => {
  // Create a feedback entry
  const feedbackEntry: FeedbackEntry = {
    id: generateFeedbackId(),
    foodItem,
    suggestedCategory,
    originalCategory: foodItem.primaryCategory || 'Unknown',
    reason,
    status: 'pending',
    timestamp: Date.now(),
    userId
  };
  
  // Store the feedback entry
  feedbackStore.push(feedbackEntry);
  
  // Log the event for monitoring
  logCategorizationEvent(foodItem, suggestedCategory as FoodPrimaryCategory, 0.5); // 0.5 confidence as it's user feedback
  
  return feedbackEntry;
};

/**
 * Gets all pending feedback entries
 */
export const getPendingFeedback = (): FeedbackEntry[] => {
  return feedbackStore.filter(entry => entry.status === 'pending');
};

/**
 * Gets all feedback entries
 */
export const getAllFeedback = (): FeedbackEntry[] => {
  return [...feedbackStore];
};

/**
 * Updates a feedback entry status
 */
export const updateFeedbackStatus = (
  feedbackId: string, 
  status: 'approved' | 'rejected'
): FeedbackEntry | null => {
  const entryIndex = feedbackStore.findIndex(entry => entry.id === feedbackId);
  
  if (entryIndex === -1) {
    logErrorEvent('other', `Feedback entry with ID ${feedbackId} not found`);
    return null;
  }
  
  // Update the entry
  feedbackStore[entryIndex] = {
    ...feedbackStore[entryIndex],
    status
  };
  
  return feedbackStore[entryIndex];
};

/**
 * Apply approved feedback to update food categorization
 * This would typically be done by an admin or automated process
 */
export const applyApprovedFeedback = (
  foodCategories: FoodCategory[]
): FoodCategory[] => {
  // Get all approved feedback
  const approvedFeedback = feedbackStore.filter(entry => entry.status === 'approved');
  
  if (approvedFeedback.length === 0) {
    return foodCategories; // No changes needed
  }
  
  // Create a deep copy of the categories to avoid mutating the original
  const updatedCategories = JSON.parse(JSON.stringify(foodCategories)) as FoodCategory[];
  
  // Apply each approved feedback
  approvedFeedback.forEach(feedback => {
    // Find the food item in the categories
    let foundItem = false;
    
    for (const category of updatedCategories) {
      const itemIndex = category.items.findIndex(item => item.id === feedback.foodItem.id);
      
      if (itemIndex !== -1) {
        // Remove the item from its current category
        const [item] = category.items.splice(itemIndex, 1);
        
        // Find the target category
        const targetCategory = updatedCategories.find(cat => cat.name === feedback.suggestedCategory);
        
        if (targetCategory) {
          // Update the item's primary category
          const updatedItem = {
            ...item,
            primaryCategory: feedback.suggestedCategory as FoodPrimaryCategory
          };
          
          // Add it to the new category
          targetCategory.items.push(updatedItem);
          foundItem = true;
          
          // Log the event
          logCategorizationEvent(updatedItem, feedback.suggestedCategory as FoodPrimaryCategory, 1.0);
        } else {
          logErrorEvent('categorization', `Target category "${feedback.suggestedCategory}" not found`);
          // Add the item back to its original category
          category.items.push(item);
        }
        
        break;
      }
    }
    
    if (!foundItem) {
      logErrorEvent('categorization', `Food item "${feedback.foodItem.name}" not found in any category`);
    }
  });
  
  return updatedCategories;
};

/**
 * Creates a feedback component for reporting food categorization issues
 */
export const createFeedbackReport = (
  foodCategories: FoodCategory[]
): string => {
  // Count items in each category
  const categoryCounts = foodCategories.map(category => ({
    name: category.name,
    count: category.items.length
  }));
  
  // Get pending feedback count
  const pendingCount = getPendingFeedback().length;
  
  // Generate a report
  const report = [
    `# Food Categorization Feedback Report`,
    `Generated: ${new Date().toLocaleString()}`,
    ``,
    `## Category Counts`,
    ...categoryCounts.map(cat => `- ${cat.name}: ${cat.count} items`),
    ``,
    `## Feedback Status`,
    `- Pending feedback entries: ${pendingCount}`,
    `- Total feedback submissions: ${feedbackStore.length}`,
    ``
  ].join('\n');
  
  return report;
};

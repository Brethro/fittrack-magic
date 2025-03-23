
// Simple logging utilities for development and testing purposes

// Log with timestamp
export const logWithTime = (message: string, data?: any): void => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] ${message}`, data);
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
};

// Performance monitoring
export const startPerformanceTimer = (label: string): void => {
  console.time(label);
};

export const endPerformanceTimer = (label: string): void => {
  console.timeEnd(label);
};

// Data validation utilities
export const validateFoodData = (food: any): string[] => {
  const errors: string[] = [];
  
  if (!food.id) errors.push("Missing ID");
  if (!food.name) errors.push("Missing name");
  if (!food.primaryCategory) errors.push("Missing primary category");
  
  return errors;
};

// Monitor API calls
export const logApiCall = (endpoint: string, params: any): void => {
  console.log(`API call to ${endpoint}`, params);
};

// Count instances for statistics
const counters: Record<string, number> = {};

export const incrementCounter = (counterName: string): void => {
  if (!counters[counterName]) {
    counters[counterName] = 0;
  }
  counters[counterName]++;
};

export const getCounter = (counterName: string): number => {
  return counters[counterName] || 0;
};

export const resetCounter = (counterName: string): void => {
  counters[counterName] = 0;
};

export const getAllCounters = (): Record<string, number> => {
  return { ...counters };
};

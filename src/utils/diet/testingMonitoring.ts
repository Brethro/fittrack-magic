// Simple logging utility for diet-related functions

// Keep a log of monitoring events
const monitoringLog: string[] = [];

// Add a log entry
export const addMonitorLog = (message: string): void => {
  monitoringLog.push(`${new Date().toISOString()}: ${message}`);
  console.log(`[Diet Monitor] ${message}`);
};

// Get the complete log
export const getMonitorLog = (): string[] => {
  return [...monitoringLog];
};

// Clear the log
export const clearMonitorLog = (): void => {
  monitoringLog.length = 0;
};

// Log performance metrics
export const logPerformance = (functionName: string, startTime: number): void => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  addMonitorLog(`${functionName} executed in ${duration.toFixed(2)}ms`);
};

// Monitor function execution
export const monitorFunction = <T extends any[], R>(
  fn: (...args: T) => R,
  functionName: string
): ((...args: T) => R) => {
  return (...args: T): R => {
    const startTime = performance.now();
    addMonitorLog(`Executing ${functionName}`);
    
    try {
      const result = fn(...args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result
          .then(value => {
            logPerformance(functionName, startTime);
            return value;
          })
          .catch(error => {
            addMonitorLog(`Error in ${functionName}: ${error}`);
            throw error;
          }) as unknown as R;
      }
      
      logPerformance(functionName, startTime);
      return result;
    } catch (error) {
      addMonitorLog(`Error in ${functionName}: ${error}`);
      throw error;
    }
  };
};


import React from "react";

export const ErrorFallback = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="mb-4">We encountered an error loading the application.</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-purple-600 text-white rounded-md"
      >
        Refresh Page
      </button>
    </div>
  );
};

export default ErrorFallback;

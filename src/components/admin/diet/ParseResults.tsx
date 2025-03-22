
import React from "react";

type ParseResultsProps = {
  lastParseResults: string[];
}

export const ParseResults = ({ lastParseResults }: ParseResultsProps) => {
  if (lastParseResults.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-2">Last Parse Results:</h4>
      <div className="bg-secondary/50 p-3 rounded text-sm">
        <p>Found {lastParseResults.length} diet types:</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {lastParseResults.map((diet) => (
            <div key={diet} className="bg-primary/10 px-2 py-1 rounded text-xs">
              {diet}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

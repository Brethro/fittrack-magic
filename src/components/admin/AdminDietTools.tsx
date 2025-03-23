
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Reparse } from "./diet/Reparse";
import { ParseResults } from "./diet/ParseResults";
import { JsonImport } from "./diet/JsonImport";
import { AddFoodForm } from "./diet/AddFoodForm";
import { useFoodDatabase } from "./diet/FoodUtils";

export const AdminDietTools = () => {
  const { totalFoodItems, lastParseResults, setLastParseResults, importPoultryData } = useFoodDatabase();

  return (
    <div className="space-y-6">
      <Alert variant="warning" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Deprecation Notice</AlertTitle>
        <AlertDescription>
          The current food database system is being deprecated and will be replaced with Open Food Facts API integration.
          Only use these tools for maintenance until the new system is implemented.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Diet Database Tools
          </CardTitle>
          <CardDescription>
            Tools for managing the diet database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <button 
              onClick={importPoultryData} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mb-4"
            >
              Import Poultry Data Manually
            </button>
            
            <Reparse 
              totalFoodItems={totalFoodItems} 
              setLastParseResults={setLastParseResults} 
            />

            <ParseResults lastParseResults={lastParseResults} />
            
            <JsonImport setLastParseResults={setLastParseResults} />

            <AddFoodForm setLastParseResults={setLastParseResults} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

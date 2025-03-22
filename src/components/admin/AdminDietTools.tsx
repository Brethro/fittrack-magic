
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";
import { Reparse } from "./diet/Reparse";
import { ParseResults } from "./diet/ParseResults";
import { JsonImport } from "./diet/JsonImport";
import { AddFoodForm } from "./diet/AddFoodForm";
import { useFoodDatabase } from "./diet/FoodUtils";

export const AdminDietTools = () => {
  const { totalFoodItems, lastParseResults, setLastParseResults } = useFoodDatabase();

  return (
    <div className="space-y-6">
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

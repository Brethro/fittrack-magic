
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";

/**
 * Transition component to inform about Open Food Facts API migration
 * This component replaces the old FoodData component
 */
const FoodData = () => {
  return (
    <Alert variant="warning" className="mb-6">
      <AlertTitle>Food Database Migration in Progress</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          The internal food database is being migrated to Open Food Facts API for improved data quality and sustainability.
        </p>
        <p className="flex items-center text-sm">
          <ExternalLink className="w-4 h-4 mr-1" />
          <a 
            href="https://openfoodfacts.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Learn more about Open Food Facts
          </a>
        </p>
      </AlertDescription>
    </Alert>
  );
};

// Legacy export for backward compatibility during migration
export const foodCategoriesData = [];

export default FoodData;

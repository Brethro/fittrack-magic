
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Database, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const AdminDietTools = () => {
  return (
    <div className="space-y-6">
      <Alert variant="warning" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Food Database Migration</AlertTitle>
        <AlertDescription>
          The internal food database has been deprecated and is being replaced with Open Food Facts API integration.
          This admin panel will be updated when the new system is implemented.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Open Food Facts API Migration
          </CardTitle>
          <CardDescription>
            Admin tools for the new Open Food Facts API integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">Migration Status</h3>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                <p className="text-sm">In Progress</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                The food database system is being migrated to Open Food Facts API.
                Admin tools will be available after integration is complete.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Open Food Facts Resources</h3>
              <div className="space-y-2">
                <a 
                  href="https://openfoodfacts.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Food Facts Website
                </a>
                <a 
                  href="https://wiki.openfoodfacts.org/API" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  API Documentation
                </a>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button disabled>
                Check API Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

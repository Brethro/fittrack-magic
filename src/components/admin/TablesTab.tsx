
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Code, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TablesTabProps {
  createTableScripts: Record<string, string>;
}

export function TablesTab({ createTableScripts }: TablesTabProps) {
  const { toast } = useToast();
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const copyToClipboard = (text: string, tableName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(tableName);
    
    toast({
      title: "Copied to clipboard",
      description: `SQL script for ${tableName} table copied`,
      duration: 2000,
    });
    
    setTimeout(() => {
      setCopiedScript(null);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Code className="mr-2 h-5 w-5" />
          Create Database Tables
        </CardTitle>
        <CardDescription>
          Use these SQL scripts in your Supabase SQL Editor to create the required tables
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="rounded-md bg-amber-50 dark:bg-amber-950/50 p-3 text-sm">
            <p className="text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Instructions:</span> Copy these SQL scripts and run them in your Supabase SQL Editor. 
              Go to your Supabase dashboard, navigate to the SQL Editor section, paste the script, and click "Run".
            </p>
          </div>
          
          <ScrollArea className="h-[400px] rounded-md border p-4">
            {Object.entries(createTableScripts).map(([tableName, script]) => (
              <div key={tableName} className="mb-6 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-semibold">{tableName}</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(script, tableName)}
                    className="h-7"
                  >
                    {copiedScript === tableName ? (
                      <><Check className="h-3.5 w-3.5 mr-1" /> Copied</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5 mr-1" /> Copy</>
                    )}
                  </Button>
                </div>
                <pre className="bg-black font-mono text-green-400 p-3 rounded-md text-xs overflow-x-auto">
                  {script}
                </pre>
              </div>
            ))}
            
            <div className="mt-4">
              <h3 className="text-md font-semibold mb-2">Enable UUID Extension</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Run this first to enable UUID generation:
              </p>
              <pre className="bg-black font-mono text-green-400 p-3 rounded-md text-xs">
                CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
              </pre>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', 'uuid-extension')}
                className="mt-2 h-7"
              >
                {copiedScript === 'uuid-extension' ? (
                  <><Check className="h-3.5 w-3.5 mr-1" /> Copied</>
                ) : (
                  <><Copy className="h-3.5 w-3.5 mr-1" /> Copy</>
                )}
              </Button>
            </div>
            
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Run All Tables Script</h3>
              <Button 
                onClick={() => copyToClipboard(
                  'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n' + 
                  Object.values(createTableScripts).join('\n\n'),
                  'all-tables'
                )}
                className="w-full"
              >
                {copiedScript === 'all-tables' ? (
                  <><Check className="h-4 w-4 mr-1" /> Copied All Scripts</>
                ) : (
                  <><Copy className="h-4 w-4 mr-1" /> Copy All Table Scripts</>
                )}
              </Button>
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

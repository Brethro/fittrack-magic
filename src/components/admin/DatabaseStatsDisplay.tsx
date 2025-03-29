
import { Button } from "@/components/ui/button";
import { Database, Users, RefreshCw } from "lucide-react";

interface DatabaseStatsProps {
  dbStats: {
    tables: number;
    rows: { [key: string]: number };
    uniqueFoods: number;
    uniqueUsers: number;
  };
  isLoading: boolean;
  onRefresh: () => void;
}

export function DatabaseStatsDisplay({ dbStats, isLoading, onRefresh }: DatabaseStatsProps) {
  return (
    <div>
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Database Statistics</p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="bg-card/50 p-2 rounded-md">
          <p className="text-xs text-muted-foreground">Tables</p>
          <p className="text-lg font-semibold">{dbStats.tables}</p>
        </div>
        
        <div className="bg-card/50 p-2 rounded-md">
          <p className="text-xs text-muted-foreground flex items-center">
            <Database className="h-3 w-3 mr-1" />
            Unique Foods
          </p>
          <p className="text-lg font-semibold">{dbStats.uniqueFoods}</p>
        </div>
        
        <div className="bg-card/50 p-2 rounded-md">
          <p className="text-xs text-muted-foreground flex items-center">
            <Users className="h-3 w-3 mr-1" />
            Unique Users
          </p>
          <p className="text-lg font-semibold">{dbStats.uniqueUsers}</p>
        </div>
        
        {/* Table row counts */}
        {Object.entries(dbStats.rows).map(([table, count]) => (
          <div key={table} className="bg-card/50 p-2 rounded-md">
            <p className="text-xs text-muted-foreground">{table}</p>
            <p className="text-lg font-semibold">{count} rows</p>
          </div>
        ))}
      </div>
    </div>
  );
}

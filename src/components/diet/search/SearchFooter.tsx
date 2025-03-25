
import { useCallback } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFooterProps {
  usdaApiStatus: string;
  className?: string;
}

export function SearchFooter({ usdaApiStatus, className }: SearchFooterProps) {
  const renderApiStatus = useCallback(() => {
    switch (usdaApiStatus) {
      case "connected":
        return (
          <span className="flex items-center text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
            USDA API Connected
          </span>
        );
      case "rate_limited":
        return (
          <span className="flex items-center text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
            USDA API Rate Limited
          </span>
        );
      case "error":
        return (
          <span className="flex items-center text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
            USDA API Error
          </span>
        );
      case "checking":
        return (
          <span className="flex items-center text-xs">
            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5 animate-pulse"></span>
            Checking USDA API...
          </span>
        );
      default:
        return null;
    }
  }, [usdaApiStatus]);

  return (
    <div className={cn("p-3 flex items-center justify-between text-muted-foreground", className)}>
      <div className="flex items-center text-xs">
        <Info className="h-3 w-3 mr-1.5" />
        <span>Powered by Open Food Facts and USDA</span>
      </div>
      <div>{renderApiStatus()}</div>
    </div>
  );
}

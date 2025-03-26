
import { useEffect } from "react";
import { useApiConnection } from "@/hooks/useApiConnection";
import { SearchPanel } from "@/components/diet/search/SearchPanel";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const { usdaApiStatus } = useApiConnection();
  
  // No more automatic API checking on each open
  
  return (
    <SearchPanel 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      usdaApiStatus={usdaApiStatus}
    />
  );
}

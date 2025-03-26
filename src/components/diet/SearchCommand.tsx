
import { useState, useEffect } from "react";
import { useApiConnection } from "@/hooks/useApiConnection";
import { useToast } from "@/hooks/use-toast";
import { useFoodLog } from "@/contexts/FoodLogContext";
import { trackFoodSelection } from "@/services/foodSearchService";
import { SearchInput } from "@/components/diet/search/SearchInput";
import { RecentSearches } from "@/components/diet/search/RecentSearches";
import { SearchResults } from "@/components/diet/search/SearchResults";
import { SearchFooter } from "@/components/diet/search/SearchFooter";
import { useSearch } from "@/hooks/useSearch";
import { SearchPanel } from "@/components/diet/search/SearchPanel";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const { toast } = useToast();
  const { usdaApiStatus, checkUsdaApiConnection } = useApiConnection();
  
  // Check USDA API connection when opened
  useEffect(() => {
    if (open) {
      checkUsdaApiConnection();
    }
  }, [open, checkUsdaApiConnection]);
  
  return (
    <SearchPanel 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      usdaApiStatus={usdaApiStatus}
    />
  );
}

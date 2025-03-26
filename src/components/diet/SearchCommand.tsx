
import { useApiConnection } from "@/hooks/useApiConnection";
import { SearchPanel } from "@/components/diet/search/SearchPanel";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const { usdaApiStatus } = useApiConnection();
  
  return (
    <div className="relative">
      <SearchPanel 
        isOpen={open} 
        onClose={() => onOpenChange(false)}
        usdaApiStatus={usdaApiStatus}
      />
    </div>
  );
}

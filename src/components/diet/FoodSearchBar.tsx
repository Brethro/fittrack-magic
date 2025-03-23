
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FoodSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function FoodSearchBar({ searchQuery, setSearchQuery }: FoodSearchBarProps) {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search foods..."
        className="pl-9"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}

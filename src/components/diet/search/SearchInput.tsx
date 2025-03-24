
import { CommandInput } from "@/components/ui/command";

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchInput({ searchQuery, setSearchQuery }: SearchInputProps) {
  return (
    <div className="border-b shadow-sm">
      <CommandInput 
        placeholder="Search foods..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
    </div>
  );
}

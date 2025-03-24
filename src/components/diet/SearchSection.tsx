
import { useApiConnection } from "@/hooks/useApiConnection";
import SearchSectionPanel from "@/components/diet/SearchSectionPanel";

interface SearchSectionProps {
  usdaApiStatus: "idle" | "checking" | "connected" | "error" | "rate_limited";
}

const SearchSection = ({ usdaApiStatus }: SearchSectionProps) => {
  return <SearchSectionPanel usdaApiStatus={usdaApiStatus} />;
};

export default SearchSection;

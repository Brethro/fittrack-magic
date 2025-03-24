
interface SearchFooterProps {
  usdaApiStatus: string;
}

export function SearchFooter({ usdaApiStatus }: SearchFooterProps) {
  if (usdaApiStatus !== "rate_limited") {
    return null;
  }
  
  return (
    <div className="p-2 text-xs text-amber-700 bg-amber-50 border-t">
      USDA API rate limit reached. Only showing Open Food Facts results.
    </div>
  );
}

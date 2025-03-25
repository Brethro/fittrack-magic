
interface SearchFooterProps {
  usdaApiStatus: string;
  className?: string; // Added optional className prop
}

export function SearchFooter({ usdaApiStatus, className }: SearchFooterProps) {
  if (usdaApiStatus !== "rate_limited") {
    return null;
  }
  
  return (
    <div className={`p-2 text-xs text-amber-700 bg-amber-50 border-t ${className || ''}`}>
      USDA API rate limit reached. Only showing Open Food Facts results.
    </div>
  );
}

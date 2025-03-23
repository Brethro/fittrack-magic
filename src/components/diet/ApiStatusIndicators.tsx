
import { AlertCircle, CheckCircle, Loader2, Clock } from "lucide-react";

interface ApiStatusIndicatorsProps {
  apiStatus: "idle" | "checking" | "connected" | "error" | "rate_limited";
  usdaApiStatus: "idle" | "checking" | "connected" | "error" | "rate_limited";
}

const ApiStatusIndicators = ({ apiStatus, usdaApiStatus }: ApiStatusIndicatorsProps) => {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {apiStatus === "checking" && (
        <div className="text-xs bg-gray-100 py-1 px-3 rounded-full flex items-center">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          <span>Checking OFF API...</span>
        </div>
      )}
      {apiStatus === "connected" && (
        <div className="text-xs bg-green-50 text-green-700 py-1 px-3 rounded-full flex items-center">
          <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
          <span>Open Food Facts API ready</span>
        </div>
      )}
      {apiStatus === "error" && (
        <div className="text-xs bg-red-50 text-red-700 py-1 px-3 rounded-full flex items-center">
          <AlertCircle className="mr-1 h-3 w-3 text-red-500" />
          <span>OFF API error</span>
        </div>
      )}
      
      {usdaApiStatus === "checking" && (
        <div className="text-xs bg-gray-100 py-1 px-3 rounded-full flex items-center">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          <span>Checking USDA API...</span>
        </div>
      )}
      {usdaApiStatus === "connected" && (
        <div className="text-xs bg-emerald-50 text-emerald-700 py-1 px-3 rounded-full flex items-center">
          <CheckCircle className="mr-1 h-3 w-3 text-emerald-500" />
          <span>USDA API ready</span>
        </div>
      )}
      {usdaApiStatus === "error" && (
        <div className="text-xs bg-red-50 text-red-700 py-1 px-3 rounded-full flex items-center">
          <AlertCircle className="mr-1 h-3 w-3 text-red-500" />
          <span>USDA API error</span>
        </div>
      )}
      {usdaApiStatus === "rate_limited" && (
        <div className="text-xs bg-amber-50 text-amber-700 py-1 px-3 rounded-full flex items-center">
          <Clock className="mr-1 h-3 w-3 text-amber-500" />
          <span>USDA API rate limited</span>
        </div>
      )}
    </div>
  );
};

export default ApiStatusIndicators;

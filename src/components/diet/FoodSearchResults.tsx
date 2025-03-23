
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import FoodItem from "./FoodItem";

interface FoodSearchResultsProps {
  results: any[];
}

const FoodSearchResults = ({ results }: FoodSearchResultsProps) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h2 className="text-lg font-semibold">Search Results</h2>
      <div className="space-y-3">
        {results.map((product, index) => (
          <motion.div
            key={product.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <FoodItem product={product} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export function FoodSearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Search Results</h2>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-panel p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-4 mt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FoodSearchResults;

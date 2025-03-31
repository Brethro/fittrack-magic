
import { useState, useRef, useEffect } from "react";
import { useFoodLog } from "@/contexts/FoodLogContext";
import FoodLogList from "./FoodLogList";
import QuickFoodEntry from "./QuickFoodEntry";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type FoodLogEntry } from "@/contexts/FoodLogContext";
import { Utensils, History, Plus, Search } from "lucide-react";
import RecentFoods from "./RecentFoods";
import { PersistentSearchBar } from "./search/PersistentSearchBar";
import { SearchPanel } from "./search/SearchPanel";
import { useApiConnection } from "@/hooks/useApiConnection";

const FoodLog = () => {
  const { updateFoodEntry, getDailyTotals, currentDate, getDailyFoodLog } = useFoodLog();
  const { usdaApiStatus } = useApiConnection();
  const [activeTab, setActiveTab] = useState("log");
  const [editingEntry, setEditingEntry] = useState<FoodLogEntry | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Daily nutrition totals
  const dailyTotals = getDailyTotals(currentDate);
  
  // Check if there are any food entries
  const dailyEntries = getDailyFoodLog(currentDate);
  const hasFoodEntries = dailyEntries.length > 0;
  
  // This function will be passed to QuickFoodEntry to switch tabs after adding food
  const handleFoodAdded = () => {
    setActiveTab("log");
  };
  
  // Handle editing a food entry
  const handleEditEntry = (entry: FoodLogEntry) => {
    setEditingEntry(entry);
    setActiveTab("add");
  };

  // Handle the "Add Food" button click from FoodLogList
  const handleAddFoodClick = () => {
    setActiveTab("add");
  };

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  
  return (
    <div className={`flex flex-col w-full h-full relative ${!hasFoodEntries && !searchOpen ? 'max-h-[450px]' : ''}`}>
      {!searchOpen ? (
        <>
          <Tabs 
            defaultValue="log" 
            className="w-full flex flex-col h-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="w-full grid grid-cols-3 mb-2">
              <TabsTrigger value="log" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                <span>Food Log</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>Recent</span>
              </TabsTrigger>
              <TabsTrigger value="add" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Quick Add</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="h-full">
              <TabsContent 
                value="log" 
                className="m-0 h-full data-[state=active]:flex data-[state=active]:flex-col"
              >
                <FoodLogList 
                  onEditEntry={handleEditEntry} 
                  onAddFoodClick={handleAddFoodClick} 
                />
              </TabsContent>
              
              <TabsContent 
                value="recent" 
                className="m-0 h-full"
              >
                <div className="border rounded-lg p-4 bg-card h-full overflow-y-auto">
                  <RecentFoods />
                </div>
              </TabsContent>
              
              <TabsContent 
                value="add" 
                className="m-0 h-full"
              >
                <div className="border rounded-lg p-4 bg-card h-full overflow-y-auto">
                  <QuickFoodEntry 
                    onAddSuccess={handleFoodAdded} 
                    editingEntry={editingEntry}
                    onEditSuccess={() => {
                      setEditingEntry(null);
                      setActiveTab("log");
                    }}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          {/* Search bar at the bottom */}
          <div className="mt-3">
            <PersistentSearchBar 
              onClick={() => setSearchOpen(true)} 
              isActive={searchOpen}
            />
          </div>
        </>
      ) : (
        /* Search panel replaces the entire food log content when open */
        <div className="h-full flex flex-col">
          <SearchPanel 
            isOpen={searchOpen} 
            onClose={() => setSearchOpen(false)} 
            usdaApiStatus={usdaApiStatus}
          />
        </div>
      )}
    </div>
  );
};

export default FoodLog;

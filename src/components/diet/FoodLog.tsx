
import { useState } from "react";
import { useFoodLog } from "@/contexts/FoodLogContext";
import FoodLogList from "./FoodLogList";
import QuickFoodEntry from "./QuickFoodEntry";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type FoodLogEntry } from "@/contexts/FoodLogContext";

const FoodLog = () => {
  const { updateFoodEntry } = useFoodLog();
  const [activeTab, setActiveTab] = useState("log");
  const [editingEntry, setEditingEntry] = useState<FoodLogEntry | null>(null);
  
  // This function will be passed to QuickFoodEntry to switch tabs after adding food
  const handleFoodAdded = () => {
    setActiveTab("log");
  };
  
  // Handle editing a food entry
  const handleEditEntry = (entry: FoodLogEntry) => {
    setEditingEntry(entry);
    setActiveTab("add");
  };
  
  return (
    <div className="flex flex-col space-y-3 w-full h-full">
      <Tabs 
        defaultValue="log" 
        className="w-full flex flex-col flex-1"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full grid grid-cols-2 mb-2">
          <TabsTrigger value="log">Food Log</TabsTrigger>
          <TabsTrigger value="add">Quick Add</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 flex overflow-hidden">
          <TabsContent 
            value="log" 
            className="flex-1 m-0 h-full data-[state=active]:flex data-[state=active]:flex-col w-full"
          >
            <FoodLogList onEditEntry={handleEditEntry} />
          </TabsContent>
          
          <TabsContent 
            value="add" 
            className="flex-1 m-0 h-full"
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
    </div>
  );
};

export default FoodLog;

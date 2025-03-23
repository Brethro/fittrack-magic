
import { useState } from "react";
import { useFoodLog } from "@/contexts/FoodLogContext";
import FoodLogSummary from "./FoodLogSummary";
import FoodLogList from "./FoodLogList";
import QuickFoodEntry from "./QuickFoodEntry";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FoodLog = () => {
  const { currentDate, setCurrentDate } = useFoodLog();
  const [activeTab, setActiveTab] = useState("log");
  
  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };
  
  return (
    <div className="flex flex-col space-y-3 w-full h-full">
      <h2 className="text-xl font-semibold">Food Log</h2>
      
      <div className="mb-1">
        <FoodLogSummary onDateChange={handleDateChange} />
      </div>
      
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
            <FoodLogList />
          </TabsContent>
          
          <TabsContent 
            value="add" 
            className="flex-1 m-0 h-full"
          >
            <div className="border rounded-lg p-4 bg-card h-full overflow-y-auto">
              <QuickFoodEntry onSuccess={() => setActiveTab("log")} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default FoodLog;

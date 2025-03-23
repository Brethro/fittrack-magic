
import { useState } from "react";
import { useFoodLog } from "@/contexts/FoodLogContext";
import FoodLogSummary from "./FoodLogSummary";
import FoodLogList from "./FoodLogList";
import QuickFoodEntry from "./QuickFoodEntry";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FoodLog = () => {
  const { currentDate, setCurrentDate } = useFoodLog();
  
  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Food Log</h2>
      
      <FoodLogSummary onDateChange={handleDateChange} />
      
      <Tabs defaultValue="log" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="log">Food Log</TabsTrigger>
          <TabsTrigger value="add">Quick Add</TabsTrigger>
        </TabsList>
        
        <TabsContent value="log" className="mt-4">
          <FoodLogList />
        </TabsContent>
        
        <TabsContent value="add" className="mt-4">
          <QuickFoodEntry />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FoodLog;


import { useState, useRef, useEffect } from "react";
import { useFoodLog } from "@/contexts/FoodLogContext";
import FoodLogList from "./FoodLogList";
import QuickFoodEntry from "./QuickFoodEntry";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type FoodLogEntry } from "@/contexts/FoodLogContext";
import { Search, Utensils, History, Star, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import RecentFoods from "./RecentFoods";
import { SearchCommand } from "./SearchCommand";

const FoodLog = () => {
  const { updateFoodEntry, getDailyTotals, currentDate } = useFoodLog();
  const [activeTab, setActiveTab] = useState("log");
  const [editingEntry, setEditingEntry] = useState<FoodLogEntry | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Daily nutrition totals
  const dailyTotals = getDailyTotals(currentDate);
  
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
    <div className="flex flex-col w-full h-full relative">
      <Tabs 
        defaultValue="log" 
        className="w-full flex flex-col h-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full grid grid-cols-4 mb-2">
          <TabsTrigger value="log" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            <span>Food Log</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" />
            <span>Search</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Recent</span>
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Quick Add</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="h-full">
          <TabsContent 
            value="log" 
            className="m-0 h-full data-[state=active]:flex data-[state=active]:flex-col"
          >
            <FoodLogList onEditEntry={handleEditEntry} />
          </TabsContent>
          
          <TabsContent 
            value="search" 
            className="m-0 h-full"
          >
            <div className="border rounded-lg p-4 bg-card h-full overflow-y-auto">
              <div className="text-center py-8">
                <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-1">Search for foods</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Find foods from our database
                </p>
                <Button onClick={() => setSearchOpen(true)}>
                  Open Search
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent 
            value="recent" 
            className="m-0 h-full"
          >
            <Card className="h-full overflow-hidden flex flex-col">
              <div className="p-4 border-b bg-muted/30">
                <h3 className="text-lg font-medium">Recent Foods</h3>
                <p className="text-sm text-muted-foreground">Quickly add foods you've logged before</p>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <RecentFoods />
              </div>
            </Card>
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
      
      {/* Floating search command */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
};

export default FoodLog;


import * as React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { WeightLogEntry, useUserData } from "@/contexts/UserDataContext";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface WeightLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editEntry?: WeightLogEntry;
}

export function WeightLogDialog({ open, onOpenChange, editEntry }: WeightLogDialogProps) {
  const { userData, addWeightLogEntry, updateWeightLogEntry } = useUserData();
  const { toast } = useToast();
  
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // When dialog opens, initialize form fields
  useEffect(() => {
    if (open) {
      if (editEntry) {
        setDate(editEntry.date);
        setWeight(editEntry.weight.toString());
      } else {
        setDate(new Date());
        setWeight(userData.weight ? userData.weight.toString() : "");
      }
      setError(null);
    }
  }, [open, editEntry, userData.weight]);

  const handleSave = () => {
    // Validate input
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      setError("Please enter a valid weight");
      return;
    }

    // Check if selected date is today or in the past (before today)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    if (date < today) {
      setError("Cannot log weight for dates before today");
      return;
    }

    const weightValue = parseFloat(parseFloat(weight).toFixed(1));

    if (editEntry) {
      // Update existing entry
      updateWeightLogEntry({
        id: editEntry.id,
        date,
        weight: weightValue
      });
      
      toast({
        title: "Weight entry updated",
        description: `Updated weight: ${weightValue} ${userData.useMetric ? "kg" : "lbs"} on ${format(date, "MMM d, yyyy")}`,
      });
    } else {
      // Add new entry
      addWeightLogEntry({
        date,
        weight: weightValue
      });
      
      toast({
        title: "Weight logged",
        description: `Logged weight: ${weightValue} ${userData.useMetric ? "kg" : "lbs"} on ${format(date, "MMM d, yyyy")}`,
      });
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editEntry ? "Edit Weight Entry" : "Log Your Weight"}</DialogTitle>
          <DialogDescription>
            Keep track of your progress by logging your weight regularly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  disabled={(date) => {
                    // Disable dates in the past (before today)
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today || date > new Date();
                  }}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="weight" className="text-sm font-medium">Weight</label>
            <div className="flex items-center gap-2">
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  setError(null);
                }}
                placeholder={`Weight in ${userData.useMetric ? "kg" : "lbs"}`}
                className="col-span-3"
              />
              <span className="text-sm text-muted-foreground">
                {userData.useMetric ? "kg" : "lbs"}
              </span>
            </div>
            {error && <p className="text-destructive text-sm mt-1">{error}</p>}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editEntry ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default WeightLogDialog;

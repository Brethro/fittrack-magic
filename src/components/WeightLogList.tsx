
import * as React from "react";
import { useState } from "react";
import { format } from "date-fns";
import { Pencil, Plus, Trash2, Weight } from "lucide-react";
import { WeightLogEntry, useUserData } from "@/contexts/UserDataContext";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import WeightLogDialog from "./WeightLogDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function WeightLogList() {
  const { userData, deleteWeightLogEntry } = useUserData();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<WeightLogEntry | undefined>(undefined);
  const [entryToDelete, setEntryToDelete] = useState<string | undefined>(undefined);
  
  // Sort weight log entries by date (newest first)
  const sortedEntries = [...userData.weightLog].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  const handleAddEntry = () => {
    setEditEntry(undefined);
    setDialogOpen(true);
  };

  const handleEditEntry = (entry: WeightLogEntry) => {
    setEditEntry(entry);
    setDialogOpen(true);
  };

  const handleDeleteEntry = (id: string) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!entryToDelete) return;
    
    deleteWeightLogEntry(entryToDelete);
    toast({
      title: "Entry deleted",
      description: "Weight entry has been removed",
    });
    
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium">Weight Log</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddEntry}
            className="group"
          >
            <Weight className="mr-1 h-4 w-4 group-hover:text-primary transition-colors" />
            Log Weight
          </Button>
        </div>
        
        {sortedEntries.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Weight className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No weight entries yet</p>
            <p className="text-xs mt-1">Add your first weight measurement</p>
          </div>
        ) : (
          <div className="mt-2 glass-panel rounded-lg overflow-hidden">
            <div className="max-h-[240px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-background/95 backdrop-blur-sm">
                  <tr className="border-b border-border/50">
                    <th className="text-left p-2 text-xs font-medium">Date</th>
                    <th className="text-left p-2 text-xs font-medium">Weight</th>
                    <th className="p-2 text-right text-xs font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/20 hover:bg-accent/10">
                      <td className="p-2 text-sm">
                        {format(entry.date, "MMM d, yyyy")}
                      </td>
                      <td className="p-2 text-sm font-medium">
                        {entry.weight} {userData.useMetric ? "kg" : "lbs"}
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <WeightLogDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        editEntry={editEntry} 
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete weight entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this weight entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default WeightLogList;

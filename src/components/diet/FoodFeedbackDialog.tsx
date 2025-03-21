
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FoodItem, FoodCategory, FoodPrimaryCategory } from "@/types/diet";
import { submitCategoryFeedback } from "@/utils/diet/userFeedbackUtils";
import { useToast } from "@/components/ui/use-toast";

interface FoodFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  foodItem: FoodItem | null;
  foodCategories: FoodCategory[];
}

export function FoodFeedbackDialog({
  open,
  onClose,
  foodItem,
  foodCategories,
}: FoodFeedbackDialogProps) {
  const { toast } = useToast();
  const [suggestedCategory, setSuggestedCategory] = useState<string>("");
  const [feedbackReason, setFeedbackReason] = useState<string>("");

  const handleSubmitFeedback = () => {
    if (!foodItem || !suggestedCategory || !feedbackReason) {
      toast({
        title: "Incomplete feedback",
        description: "Please select a category and provide a reason for your suggestion.",
        variant: "destructive"
      });
      return;
    }

    // Submit the feedback
    submitCategoryFeedback(foodItem, suggestedCategory, feedbackReason);

    // Show success message
    toast({
      title: "Feedback submitted",
      description: "Thank you for helping us improve our food categorization!",
    });

    // Reset form and close dialog
    setSuggestedCategory("");
    setFeedbackReason("");
    onClose();
  };

  if (!foodItem) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Suggest Different Category</DialogTitle>
          <DialogDescription>
            Help us improve our food database by suggesting a more appropriate category for this item.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="current-food">Food Item</Label>
            <div id="current-food" className="text-sm font-medium p-2 bg-muted rounded-md">
              {foodItem.name}
              <div className="text-xs text-muted-foreground mt-1">
                Current category: {foodItem.primaryCategory || "Uncategorized"}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="suggested-category">Suggested Category</Label>
            <Select value={suggestedCategory} onValueChange={setSuggestedCategory}>
              <SelectTrigger id="suggested-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {foodCategories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="feedback-reason">Reason for Suggestion</Label>
            <Textarea
              id="feedback-reason"
              placeholder="Please explain why you think this food belongs in a different category..."
              value={feedbackReason}
              onChange={(e) => setFeedbackReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

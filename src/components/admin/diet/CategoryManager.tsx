
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check, FolderPlus } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { categoryDisplayNames } from "@/utils/diet/categoryDisplayNames";
import { FoodPrimaryCategory } from "@/types/diet";
import { foodCategoryHierarchy } from "@/utils/diet/foodCategoryHierarchy";

type CategoryManagerProps = {
  onCategoryMappingUpdate: (mappings: Record<string, string>) => void;
}

export const CategoryManager = ({ onCategoryMappingUpdate }: CategoryManagerProps) => {
  const { toast } = useToast();
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [categoryMappings, setCategoryMappings] = useState<Record<string, string>>({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [parentCategory, setParentCategory] = useState<string>("");
  
  // Get all available parent categories from the hierarchy
  useEffect(() => {
    // Get the top-level categories (ones with null as parent)
    const parentCategories = Object.entries(foodCategoryHierarchy)
      .filter(([_, parent]) => parent === null)
      .map(([category]) => category);
    
    // Sort parent categories alphabetically by display name
    const sortedCategories = parentCategories.sort((a, b) => {
      const displayA = categoryDisplayNames[a as FoodPrimaryCategory] || a;
      const displayB = categoryDisplayNames[b as FoodPrimaryCategory] || b;
      return displayA.localeCompare(displayB);
    });
    
    setAvailableCategories(sortedCategories);
  }, []);

  // Add a new mapping
  const handleAddMapping = (sourceCategory: string, targetCategory: string) => {
    const newMappings = { ...categoryMappings, [sourceCategory]: targetCategory };
    setCategoryMappings(newMappings);
    onCategoryMappingUpdate(newMappings);
    
    toast({
      title: "Category Mapping Added",
      description: `'${sourceCategory}' will be mapped to '${categoryDisplayNames[targetCategory as FoodPrimaryCategory] || targetCategory}'`,
    });
  };

  // Handle adding a new parent category
  const handleAddCategory = () => {
    if (!newCategoryName || !newCategoryId) {
      toast({
        title: "Error",
        description: "Both category name and ID are required",
        variant: "destructive",
      });
      return;
    }
    
    // Validate that the ID is unique
    if (availableCategories.includes(newCategoryId)) {
      toast({
        title: "Error",
        description: `Category ID '${newCategoryId}' already exists`,
        variant: "destructive",
      });
      return;
    }
    
    // Add the new category to available categories
    setAvailableCategories(prev => [...prev, newCategoryId]);
    
    // Update the display name mapping
    // Note: In a real implementation, you'd need to update the categoryDisplayNames file
    
    toast({
      title: "New Category Added",
      description: `'${newCategoryName}' (${newCategoryId}) has been added as a parent category`,
    });
    
    // Reset the form
    setNewCategoryName("");
    setNewCategoryId("");
    setShowAddCategory(false);
  };

  return (
    <div className="space-y-4 mt-6 pt-4 border-t">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Category Mappings</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAddCategory(!showAddCategory)}
        >
          <Plus className="h-4 w-4 mr-1" />
          {showAddCategory ? "Cancel" : "Add New Parent Category"}
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Map import categories to existing parent categories, or create new ones.
        This helps when importing JSON with unknown category names.
      </p>
      
      {/* Add New Category Form */}
      {showAddCategory && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newCategoryName">Display Name</Label>
                  <Input
                    id="newCategoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Shellfish"
                  />
                  <p className="text-xs text-muted-foreground">
                    Human-readable name shown in the UI
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newCategoryId">Technical ID</Label>
                  <Input
                    id="newCategoryId"
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="e.g. shellfish"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lowercase, no spaces, used in code
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parentCategory">Parent Category (Optional)</Label>
                <Select 
                  value={parentCategory} 
                  onValueChange={setParentCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category (or none)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Top-level category)</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {categoryDisplayNames[category as FoodPrimaryCategory] || category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  If this is a subcategory, select its parent
                </p>
              </div>
              
              <Button onClick={handleAddCategory} className="mt-2">
                <FolderPlus className="h-4 w-4 mr-2" />
                Create New Category
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Mapping section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Example mapping cards */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Source: <span className="font-bold">shellfish</span></Label>
                </div>
                <Select 
                  defaultValue="fish" 
                  onValueChange={(value) => handleAddMapping("shellfish", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Map to parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {categoryDisplayNames[category as FoodPrimaryCategory] || category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Source: <span className="font-bold">seafood</span></Label>
                </div>
                <Select 
                  defaultValue="fish" 
                  onValueChange={(value) => handleAddMapping("seafood", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Map to parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {categoryDisplayNames[category as FoodPrimaryCategory] || category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Source: <span className="font-bold">mollusks</span></Label>
                </div>
                <Select 
                  defaultValue="fish" 
                  onValueChange={(value) => handleAddMapping("mollusks", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Map to parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {categoryDisplayNames[category as FoodPrimaryCategory] || category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

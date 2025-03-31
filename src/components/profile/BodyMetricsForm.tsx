import React, { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UserData } from "@/contexts/UserDataContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface BodyMetricsFormProps {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  clearUserData: () => void;
  recalculateNutrition: () => void;
}

const BodyMetricsForm: React.FC<BodyMetricsFormProps> = ({
  userData,
  updateUserData,
  clearUserData,
  recalculateNutrition,
}) => {
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    age: userData.age?.toString() || "",
    weight: userData.weight?.toString() || "",
    heightFeet: userData.useMetric ? "" : (userData.height as any)?.feet?.toString() || "",
    heightInches: userData.useMetric ? "" : (userData.height as any)?.inches?.toString() || "",
    heightCm: userData.useMetric ? (userData.height as number)?.toString() || "" : "",
    bodyFatPercentage: userData.bodyFatPercentage?.toString() || "",
    activityLevel: userData.activityLevel || "sedentary",
    useMetric: userData.useMetric || false,
    gender: userData.gender || "male",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setForm((prev) => ({ ...prev, activityLevel: value }));
  };

  const handleGenderChange = (value: string) => {
    setForm((prev) => ({ ...prev, gender: value as "male" | "female" }));
  };

  const handleUnitToggle = (checked: boolean) => {
    setForm((prev) => ({ ...prev, useMetric: checked }));
  };

  const handleReset = () => {
    clearUserData();
    toast({
      title: "All data cleared",
      description: "Your profile and progress have been reset",
    });
    
    // Force update localStorage event
    window.dispatchEvent(new Event('storage'));
    
    // Navigate to splash screen instead of home
    navigate("/splash");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.age || !form.weight || !form.activityLevel) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Height validation
    if (form.useMetric && !form.heightCm) {
      toast({
        title: "Missing height",
        description: "Please enter your height in centimeters",
        variant: "destructive",
      });
      return;
    }
    
    if (!form.useMetric && (!form.heightFeet || !form.heightInches)) {
      toast({
        title: "Missing height",
        description: "Please enter your height in feet and inches",
        variant: "destructive",
      });
      return;
    }

    // Process and save data
    const formattedData = {
      age: parseInt(form.age),
      weight: parseFloat(form.weight),
      height: form.useMetric 
        ? parseFloat(form.heightCm) 
        : { feet: parseInt(form.heightFeet), inches: parseInt(form.heightInches) },
      activityLevel: form.activityLevel,
      bodyFatPercentage: form.bodyFatPercentage ? parseFloat(form.bodyFatPercentage) : null,
      useMetric: form.useMetric,
      gender: form.gender as "male" | "female",
    };

    updateUserData(formattedData);
    
    // Recalculate nutrition plan based on updated profile data
    setTimeout(() => {
      recalculateNutrition();
    }, 0);
    
    toast({
      title: "Profile updated",
      description: "Your information and nutrition plan have been updated",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-panel p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <Label className="text-lg font-medium">Body Metrics</Label>
          <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 shadow-sm">
            <span className={cn(
              "text-sm transition-colors", 
              form.useMetric ? "text-muted-foreground" : "text-foreground font-medium"
            )}>
              Imperial
            </span>
            <Switch 
              checked={form.useMetric}
              onCheckedChange={handleUnitToggle}
              id="metric-toggle"
            />
            <span className={cn(
              "text-sm transition-colors", 
              !form.useMetric ? "text-muted-foreground" : "text-foreground font-medium"
            )}>
              Metric
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="age" className="flex items-center gap-1">
              Age
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="age"
              name="age"
              type="number"
              placeholder="Enter your age"
              value={form.age}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="flex items-center gap-1 mb-2">
              Gender
              <span className="text-destructive">*</span>
            </Label>
            <RadioGroup 
              value={form.gender} 
              onValueChange={handleGenderChange}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="gender-male" />
                <Label htmlFor="gender-male" className="font-normal cursor-pointer">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="gender-female" />
                <Label htmlFor="gender-female" className="font-normal cursor-pointer">Female</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="weight" className="flex items-center gap-1">
              Weight
              <span className="text-destructive">*</span>
              <span className="text-muted-foreground text-sm">
                ({form.useMetric ? "kg" : "lbs"})
              </span>
            </Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              placeholder={form.useMetric ? "Enter weight in kg" : "Enter weight in lbs"}
              value={form.weight}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="flex items-center gap-1">
              Height
              <span className="text-destructive">*</span>
            </Label>
            
            {form.useMetric ? (
              <div className="mt-1">
                <Input
                  id="heightCm"
                  name="heightCm"
                  type="number"
                  placeholder="Enter height in cm"
                  value={form.heightCm}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  id="heightFeet"
                  name="heightFeet"
                  type="number"
                  placeholder="Feet"
                  value={form.heightFeet}
                  onChange={handleChange}
                />
                <Input
                  id="heightInches"
                  name="heightInches"
                  type="number"
                  placeholder="Inches"
                  value={form.heightInches}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="bodyFatPercentage" className="flex items-center gap-1">
              Body Fat Percentage
              <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <Input
              id="bodyFatPercentage"
              name="bodyFatPercentage"
              type="number"
              step="0.1"
              placeholder="Enter body fat %"
              value={form.bodyFatPercentage}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>
      </div>
      
      <div className="glass-panel p-4 rounded-lg">
        <Label className="mb-3 block">
          Activity Level <span className="text-destructive">*</span>
        </Label>
        <RadioGroup 
          value={form.activityLevel} 
          onValueChange={handleRadioChange}
          className="space-y-3"
        >
          <ActivityLevelCard
            value="sedentary"
            checked={form.activityLevel === "sedentary"}
            title="Sedentary"
            description="Little or no exercise"
          />
          
          <ActivityLevelCard
            value="light"
            checked={form.activityLevel === "light"}
            title="Light"
            description="Exercise 1-3 times/week"
          />
          
          <ActivityLevelCard
            value="moderate"
            checked={form.activityLevel === "moderate"}
            title="Moderate"
            description="Exercise 3-5 times/week"
          />
          
          <ActivityLevelCard
            value="active"
            checked={form.activityLevel === "active"}
            title="Very Active"
            description="Exercise 6-7 times/week"
          />
          
          <ActivityLevelCard
            value="extreme"
            checked={form.activityLevel === "extreme"}
            title="Extremely Active"
            description="Very intense daily exercise or physical job"
          />
        </RadioGroup>
      </div>
      
      <div className="flex gap-3">
        <Button 
          type="submit" 
          className="flex-1 bg-gradient-purple hover:opacity-90 neo-btn"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              type="button" 
              variant="outline"
              className="glass-panel border-destructive/40 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will erase all your data, including your profile information, goals, and progress.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleReset}
                className="bg-destructive hover:bg-destructive/90"
              >
                Reset All Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </form>
  );
};

// Helper component for activity level cards
interface ActivityLevelCardProps {
  value: string;
  checked: boolean;
  title: string;
  description: string;
}

const ActivityLevelCard: React.FC<ActivityLevelCardProps> = ({ 
  value, 
  checked, 
  title, 
  description 
}) => (
  <Card 
    className={cn(
      "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
      checked && "border-primary/70 bg-primary/5"
    )}
  >
    <CardContent className="flex items-center p-3">
      <RadioGroupItem value={value} id={`profile-${value}`} className="mr-3" />
      <Label htmlFor={`profile-${value}`} className="flex-1 cursor-pointer">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </Label>
    </CardContent>
  </Card>
);

export default BodyMetricsForm;

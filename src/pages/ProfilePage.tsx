import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { useUserData } from "@/contexts/UserDataContext";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData, updateUserData, clearUserData, recalculateNutrition } = useUserData();
  
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
    <div className="container px-4 py-8 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/plan")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gradient-purple">
            Profile Settings
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-end">
            <div className="flex items-center glass-panel rounded-lg px-3 py-2">
              <span className={form.useMetric ? "text-muted-foreground" : "text-foreground"}>Imperial</span>
              <Switch 
                className="mx-2"
                checked={form.useMetric}
                onCheckedChange={handleUnitToggle}
                id="metric-toggle"
              />
              <span className={!form.useMetric ? "text-muted-foreground" : "text-foreground"}>Metric</span>
            </div>
          </div>
          
          <div className="glass-panel p-4 rounded-lg space-y-4">
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
          
          <div className="glass-panel p-4 rounded-lg">
            <Label className="mb-3 block">
              Activity Level <span className="text-destructive">*</span>
            </Label>
            <RadioGroup 
              value={form.activityLevel} 
              onValueChange={handleRadioChange}
              className="space-y-3"
            >
              <Card 
                className={cn(
                  "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
                  form.activityLevel === "sedentary" && "border-primary/70 bg-primary/5"
                )}
              >
                <CardContent className="flex items-center p-3">
                  <RadioGroupItem value="sedentary" id="profile-sedentary" className="mr-3" />
                  <Label htmlFor="profile-sedentary" className="flex-1 cursor-pointer">
                    <div className="font-medium">Sedentary</div>
                    <div className="text-sm text-muted-foreground">Little or no exercise</div>
                  </Label>
                </CardContent>
              </Card>
              
              <Card 
                className={cn(
                  "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
                  form.activityLevel === "light" && "border-primary/70 bg-primary/5"
                )}
              >
                <CardContent className="flex items-center p-3">
                  <RadioGroupItem value="light" id="profile-light" className="mr-3" />
                  <Label htmlFor="profile-light" className="flex-1 cursor-pointer">
                    <div className="font-medium">Light</div>
                    <div className="text-sm text-muted-foreground">Exercise 1-3 times/week</div>
                  </Label>
                </CardContent>
              </Card>
              
              <Card 
                className={cn(
                  "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
                  form.activityLevel === "moderate" && "border-primary/70 bg-primary/5"
                )}
              >
                <CardContent className="flex items-center p-3">
                  <RadioGroupItem value="moderate" id="profile-moderate" className="mr-3" />
                  <Label htmlFor="profile-moderate" className="flex-1 cursor-pointer">
                    <div className="font-medium">Moderate</div>
                    <div className="text-sm text-muted-foreground">Exercise 3-5 times/week</div>
                  </Label>
                </CardContent>
              </Card>
              
              <Card 
                className={cn(
                  "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
                  form.activityLevel === "active" && "border-primary/70 bg-primary/5"
                )}
              >
                <CardContent className="flex items-center p-3">
                  <RadioGroupItem value="active" id="profile-active" className="mr-3" />
                  <Label htmlFor="profile-active" className="flex-1 cursor-pointer">
                    <div className="font-medium">Very Active</div>
                    <div className="text-sm text-muted-foreground">Exercise 6-7 times/week</div>
                  </Label>
                </CardContent>
              </Card>
              
              <Card 
                className={cn(
                  "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
                  form.activityLevel === "extreme" && "border-primary/70 bg-primary/5"
                )}
              >
                <CardContent className="flex items-center p-3">
                  <RadioGroupItem value="extreme" id="profile-extreme" className="mr-3" />
                  <Label htmlFor="profile-extreme" className="flex-1 cursor-pointer">
                    <div className="font-medium">Extremely Active</div>
                    <div className="text-sm text-muted-foreground">Very intense daily exercise or physical job</div>
                  </Label>
                </CardContent>
              </Card>
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
      </motion.div>
    </div>
  );
};

export default ProfilePage;

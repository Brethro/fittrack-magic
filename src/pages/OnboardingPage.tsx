
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserData } from "@/contexts/UserDataContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData, updateUserData } = useUserData();
  
  const [form, setForm] = useState({
    age: userData.age?.toString() || "",
    weight: userData.weight?.toString() || "",
    heightFeet: userData.useMetric ? "" : (userData.height as any)?.feet?.toString() || "",
    heightInches: userData.useMetric ? "" : (userData.height as any)?.inches?.toString() || "",
    heightCm: userData.useMetric ? (userData.height as number)?.toString() || "" : "",
    bodyFatPercentage: userData.bodyFatPercentage?.toString() || "",
    activityLevel: userData.activityLevel || "sedentary",
    useMetric: userData.useMetric || false,
    gender: userData.gender || "male", // Add default gender
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setForm((prev) => ({ ...prev, activityLevel: value }));
  };

  const handleUnitToggle = (checked: boolean) => {
    setForm((prev) => ({ ...prev, useMetric: checked }));
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
      gender: "male" as "male" | "female", // Set default gender value
    };

    console.log("Saving user data:", formattedData);
    
    // Update user data and navigate after the state has been updated
    updateUserData(formattedData);
    
    // Use a short timeout to ensure the data is saved before navigation
    setTimeout(() => {
      console.log("Navigating to goals page...");
      navigate("/goals");
    }, 100);
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
            onClick={() => navigate("/")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gradient-purple">
            Your Information
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
              <div className="flex items-center gap-1">
                <Label htmlFor="bodyFatPercentage">Body Fat Percentage</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px]">
                    <p>Optional but helps with more accurate calculations.</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-muted-foreground text-sm">
                  (optional)
                </span>
              </div>
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
              <div className="relative">
                <Card 
                  className={cn(
                    "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
                    form.activityLevel === "sedentary" && "border-primary/70 bg-primary/5"
                  )}
                >
                  <CardContent className="flex items-center p-3">
                    <RadioGroupItem id="sedentary" value="sedentary" className="mr-3" />
                    <Label htmlFor="sedentary" className="font-normal cursor-pointer flex-1">
                      <span className="font-medium">Sedentary</span>
                      <p className="text-sm text-muted-foreground">Little or no exercise</p>
                    </Label>
                  </CardContent>
                </Card>
              </div>
              
              <div className="relative">
                <Card 
                  className={cn(
                    "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
                    form.activityLevel === "light" && "border-primary/70 bg-primary/5"
                  )}
                >
                  <CardContent className="flex items-center p-3">
                    <RadioGroupItem id="light" value="light" className="mr-3" />
                    <Label htmlFor="light" className="font-normal cursor-pointer flex-1">
                      <span className="font-medium">Light</span>
                      <p className="text-sm text-muted-foreground">Exercise 1-3 times/week</p>
                    </Label>
                  </CardContent>
                </Card>
              </div>
              
              <div className="relative">
                <Card 
                  className={cn(
                    "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
                    form.activityLevel === "moderate" && "border-primary/70 bg-primary/5"
                  )}
                >
                  <CardContent className="flex items-center p-3">
                    <RadioGroupItem id="moderate" value="moderate" className="mr-3" />
                    <Label htmlFor="moderate" className="font-normal cursor-pointer flex-1">
                      <span className="font-medium">Moderate</span>
                      <p className="text-sm text-muted-foreground">Exercise 3-5 times/week</p>
                    </Label>
                  </CardContent>
                </Card>
              </div>
              
              <div className="relative">
                <Card 
                  className={cn(
                    "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
                    form.activityLevel === "active" && "border-primary/70 bg-primary/5"
                  )}
                >
                  <CardContent className="flex items-center p-3">
                    <RadioGroupItem id="active" value="active" className="mr-3" />
                    <Label htmlFor="active" className="font-normal cursor-pointer flex-1">
                      <span className="font-medium">Very Active</span>
                      <p className="text-sm text-muted-foreground">Exercise 6-7 times/week</p>
                    </Label>
                  </CardContent>
                </Card>
              </div>
              
              <div className="relative">
                <Card 
                  className={cn(
                    "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
                    form.activityLevel === "extreme" && "border-primary/70 bg-primary/5"
                  )}
                >
                  <CardContent className="flex items-center p-3">
                    <RadioGroupItem id="extreme" value="extreme" className="mr-3" />
                    <Label htmlFor="extreme" className="font-normal cursor-pointer flex-1">
                      <span className="font-medium">Extremely Active</span>
                      <p className="text-sm text-muted-foreground">Very intense daily exercise or physical job</p>
                    </Label>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-6 bg-gradient-purple hover:opacity-90 neo-btn"
            size="lg"
          >
            Continue to Goals
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;

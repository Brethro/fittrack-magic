
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, addMonths, addWeeks } from "date-fns";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { useUserData } from "@/contexts/UserDataContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const GoalsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData, updateUserData } = useUserData();
  
  const [form, setForm] = useState({
    goalType: userData.goalType || "weight",
    weightGoal: userData.goalType === "weight" ? userData.goalValue?.toString() || "" : "",
    bodyFatGoal: userData.goalType === "bodyFat" ? userData.goalValue?.toString() || "" : "",
    goalDate: userData.goalDate || addMonths(new Date(), 3),
    goalPace: "moderate",
  });

  const defaultEndDate = addMonths(new Date(), 3);
  
  // Check if user has filled out personal info
  useEffect(() => {
    if (!userData.age || !userData.weight || !userData.height) {
      toast({
        title: "Missing information",
        description: "Please complete your personal information first",
        variant: "destructive",
      });
      navigate("/onboarding");
    }
  }, [userData, navigate, toast]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setForm((prev) => ({ ...prev, goalDate: date }));
    }
  };

  const handlePaceChange = (pace: string) => {
    let newDate;
    
    switch (pace) {
      case "aggressive":
        newDate = addWeeks(new Date(), 8);
        break;
      case "moderate":
        newDate = addMonths(new Date(), 3);
        break;
      case "conservative":
        newDate = addMonths(new Date(), 6);
        break;
      default:
        newDate = addMonths(new Date(), 3);
    }
    
    setForm((prev) => ({
      ...prev,
      goalPace: pace,
      goalDate: newDate
    }));
  };

  const calculateTargetGoal = () => {
    if (!userData.weight) return null;
    
    const currentWeight = userData.weight;
    
    let recommendedGoal;
    
    if (form.goalType === "weight") {
      // Recommend 10-15% weight loss for moderate goal
      const reductionFactor = 0.1; // 10%
      recommendedGoal = Math.round(currentWeight * (1 - reductionFactor));
      
      return userData.useMetric 
        ? `${recommendedGoal} kg`
        : `${recommendedGoal} lbs`;
    } else {
      // If body fat goal
      if (!userData.bodyFatPercentage) return "Complete body fat % for recommendations";
      
      const currentBF = userData.bodyFatPercentage;
      // Recommend reducing body fat by about 5-7 percentage points
      recommendedGoal = Math.max(currentBF - 5, 10); // Don't go below 10%
      
      return `${recommendedGoal}%`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (form.goalType === "weight" && !form.weightGoal) {
      toast({
        title: "Missing information",
        description: "Please set your target weight goal",
        variant: "destructive",
      });
      return;
    }
    
    if (form.goalType === "bodyFat" && !form.bodyFatGoal) {
      toast({
        title: "Missing information",
        description: "Please set your target body fat percentage",
        variant: "destructive",
      });
      return;
    }
    
    if (!form.goalDate) {
      toast({
        title: "Missing information",
        description: "Please select a target date",
        variant: "destructive",
      });
      return;
    }
    
    // Process and save data
    const goalValue = form.goalType === "weight" 
      ? parseFloat(form.weightGoal) 
      : parseFloat(form.bodyFatGoal);
    
    // Calculate TDEE and calorie needs based on user data
    const heightInCm = userData.useMetric 
      ? userData.height as number
      : ((userData.height as any).feet * 30.48) + ((userData.height as any).inches * 2.54);
    
    const weightInKg = userData.useMetric
      ? userData.weight as number
      : (userData.weight as number) / 2.20462;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    const age = userData.age as number;
    const bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5; // For men (simplified)
    
    // Apply activity multiplier
    let activityMultiplier;
    switch (userData.activityLevel) {
      case "sedentary": activityMultiplier = 1.2; break;
      case "light": activityMultiplier = 1.375; break;
      case "moderate": activityMultiplier = 1.55; break;
      case "active": activityMultiplier = 1.725; break;
      case "extreme": activityMultiplier = 1.9; break;
      default: activityMultiplier = 1.2;
    }
    
    const tdee = Math.round(bmr * activityMultiplier);
    
    // Calculate daily calorie needs for weight loss (500 calorie deficit for moderate pace)
    let calorieDeficit;
    switch (form.goalPace) {
      case "aggressive": calorieDeficit = 750; break;
      case "moderate": calorieDeficit = 500; break;
      case "conservative": calorieDeficit = 300; break;
      default: calorieDeficit = 500;
    }
    
    const dailyCalories = Math.max(tdee - calorieDeficit, 1200); // Don't go below 1200 calories
    
    // Calculate macros (protein, carbs, fats)
    // Protein: 1.8g per kg of bodyweight
    const proteinGrams = Math.round(weightInKg * 1.8);
    const proteinCalories = proteinGrams * 4;
    
    // Fat: 25% of total calories
    const fatCalories = Math.round(dailyCalories * 0.25);
    const fatGrams = Math.round(fatCalories / 9);
    
    // Carbs: remaining calories
    const carbCalories = dailyCalories - proteinCalories - fatCalories;
    const carbGrams = Math.round(carbCalories / 4);
    
    updateUserData({
      goalType: form.goalType as "weight" | "bodyFat",
      goalValue,
      goalDate: form.goalDate,
      tdee,
      dailyCalories,
      macros: {
        protein: proteinGrams,
        carbs: carbGrams,
        fats: fatGrams,
      },
    });
    
    navigate("/plan");
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
            onClick={() => navigate("/onboarding")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gradient-purple">
            Set Your Goals
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs 
            defaultValue="weight" 
            value={form.goalType}
            onValueChange={(value) => setForm(prev => ({ ...prev, goalType: value }))}
            className="glass-panel rounded-lg p-4"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="weight">Weight Goal</TabsTrigger>
              <TabsTrigger value="bodyFat">Body Fat Goal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="weight" className="mt-0">
              <Label htmlFor="weightGoal" className="flex items-center gap-1">
                Target Weight
                <span className="text-destructive">*</span>
                <span className="text-muted-foreground text-sm">
                  ({userData.useMetric ? "kg" : "lbs"})
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px]">
                    <p>Recommended: {calculateTargetGoal()}</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="weightGoal"
                name="weightGoal"
                type="number"
                step="0.1"
                placeholder="Enter target weight"
                value={form.weightGoal}
                onChange={(e) => setForm(prev => ({ ...prev, weightGoal: e.target.value }))}
                className="mt-1"
              />
            </TabsContent>
            
            <TabsContent value="bodyFat" className="mt-0">
              <Label htmlFor="bodyFatGoal" className="flex items-center gap-1">
                Target Body Fat %
                <span className="text-destructive">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px]">
                    <p>Recommended: {calculateTargetGoal()}</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="bodyFatGoal"
                name="bodyFatGoal"
                type="number"
                step="0.1"
                placeholder="Enter target body fat %"
                value={form.bodyFatGoal}
                onChange={(e) => setForm(prev => ({ ...prev, bodyFatGoal: e.target.value }))}
                className="mt-1"
              />
            </TabsContent>
          </Tabs>
          
          <div className="glass-panel rounded-lg p-4">
            <Label className="mb-3 block">Weight Loss Pace</Label>
            <RadioGroup 
              value={form.goalPace} 
              onValueChange={handlePaceChange}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conservative" id="conservative" />
                <Label htmlFor="conservative" className="font-normal cursor-pointer">
                  <span className="font-medium">Conservative</span>
                  <p className="text-sm text-muted-foreground">0.25-0.5 lbs per week</p>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="moderate" />
                <Label htmlFor="moderate" className="font-normal cursor-pointer">
                  <span className="font-medium">Moderate</span>
                  <p className="text-sm text-muted-foreground">0.5-1 lbs per week</p>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="aggressive" id="aggressive" />
                <Label htmlFor="aggressive" className="font-normal cursor-pointer">
                  <span className="font-medium">Aggressive</span>
                  <p className="text-sm text-muted-foreground">1-2 lbs per week</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="glass-panel rounded-lg p-4">
            <Label className="mb-3 block">Target Achievement Date</Label>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.goalDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.goalDate ? (
                    format(form.goalDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.goalDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date) => date < new Date()}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <p className="text-sm text-muted-foreground mt-2">
              Recommended date based on your pace: {format(form.goalDate, "MMMM d, yyyy")}
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-6 bg-gradient-purple hover:opacity-90 neo-btn"
            size="lg"
          >
            Generate My Plan
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default GoalsPage;

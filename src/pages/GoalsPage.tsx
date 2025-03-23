
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, addMonths, addWeeks } from "date-fns";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { useUserData } from "@/contexts/UserDataContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type GoalPaceType = "conservative" | "moderate" | "aggressive";

const GoalsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData, updateUserData } = useUserData();
  
  const [form, setForm] = useState({
    goalType: userData.goalType || "weight" as "weight" | "bodyFat",
    weightGoal: userData.goalType === "weight" ? userData.goalValue?.toString() || "" : "",
    bodyFatGoal: userData.goalType === "bodyFat" ? userData.goalValue?.toString() || "" : "",
    goalDate: userData.goalDate || addMonths(new Date(), 3),
    goalPace: userData.goalPace || "moderate" as GoalPaceType,
  });

  const defaultEndDate = addMonths(new Date(), 3);
  
  // Calculate if this is a weight gain goal
  const isWeightGain = () => {
    if (form.goalType === "weight" && userData.weight && form.weightGoal) {
      return parseFloat(form.weightGoal) > userData.weight;
    }
    return false;
  };
  
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

  const handlePaceChange = (pace: GoalPaceType) => {
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

  // Calculate if the weight goal is potentially unrealistic
  const calculateWeightGainWarning = () => {
    if (!isWeightGain() || !userData.weight || !form.weightGoal) return null;
    
    const weightDiff = parseFloat(form.weightGoal) - userData.weight;
    const daysUntilGoal = Math.max(
      (form.goalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      1
    );
    
    // Calculate pounds per week (or kg if metric)
    const poundsPerWeek = (weightDiff / daysUntilGoal) * 7;
    
    if (form.goalPace === "aggressive" && poundsPerWeek > 1) {
      return {
        show: true,
        message: `This goal may result in gaining over 1 ${userData.useMetric ? 'kg' : 'lb'} per week, which could lead to more fat gain than muscle. Consider a longer timeframe for a better muscle-to-fat ratio.`
      };
    }
    
    return { show: false, message: "" };
  };

  const weightGainWarning = calculateWeightGainWarning();

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
    
    console.log("Submitting goal form with pace:", form.goalPace);
    console.log("Goal date:", form.goalDate);
    
    // Update user data with new goals
    updateUserData({
      goalType: form.goalType,
      goalValue,
      goalDate: form.goalDate,
      goalPace: form.goalPace,
    });
    
    // Navigate to the plan page
    // The PlanPage will run recalculateNutrition when it loads based on the new goal values
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
            onValueChange={(value: "weight" | "bodyFat") => setForm(prev => ({ ...prev, goalType: value }))}
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
            <Label className="mb-3 block">
              {isWeightGain() ? "Weight Gain Pace" : "Weight Loss Pace"}
            </Label>
            
            <RadioGroup 
              value={form.goalPace} 
              onValueChange={handlePaceChange}
              className="space-y-3"
            >
              <div className="relative">
                <Card 
                  className={cn(
                    "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
                    form.goalPace === "conservative" && "border-primary/70 bg-primary/5"
                  )}
                >
                  <CardContent className="flex items-center p-3">
                    <RadioGroupItem id="conservative" value="conservative" className="mr-3" />
                    <Label htmlFor="conservative" className="flex-1 cursor-pointer">
                      <div className="font-medium">Conservative</div>
                      <div className="text-sm text-muted-foreground">
                        {isWeightGain() ? "0.25-0.5 lbs per week gain" : "0.25-0.5 lbs per week loss"}
                      </div>
                    </Label>
                  </CardContent>
                </Card>
              </div>
              
              <div className="relative">
                <Card 
                  className={cn(
                    "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
                    form.goalPace === "moderate" && "border-primary/70 bg-primary/5"
                  )}
                >
                  <CardContent className="flex items-center p-3">
                    <RadioGroupItem id="moderate" value="moderate" className="mr-3" />
                    <Label htmlFor="moderate" className="flex-1 cursor-pointer">
                      <div className="font-medium">Moderate</div>
                      <div className="text-sm text-muted-foreground">
                        {isWeightGain() ? "0.5-1 lbs per week gain" : "0.5-1 lbs per week loss"}
                      </div>
                    </Label>
                  </CardContent>
                </Card>
              </div>
              
              <div className="relative">
                <Card 
                  className={cn(
                    "cursor-pointer border border-border/50 hover:border-primary/50 transition-colors", 
                    form.goalPace === "aggressive" && "border-primary/70 bg-primary/5"
                  )}
                >
                  <CardContent className="flex items-center p-3">
                    <RadioGroupItem id="aggressive" value="aggressive" className="mr-3" />
                    <Label htmlFor="aggressive" className="flex-1 cursor-pointer">
                      <div className="font-medium">Aggressive</div>
                      <div className="text-sm text-muted-foreground">
                        {isWeightGain() ? "1-2 lbs per week gain" : "1-2 lbs per week loss"}
                      </div>
                    </Label>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>
            
            {isWeightGain() && form.goalPace === "aggressive" && (
              <Alert variant="warning" className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Higher Fat Gain Likely</AlertTitle>
                <AlertDescription>
                  Aggressive bulking may lead to more fat gain alongside muscle. For optimal results, consider a longer timeframe.
                </AlertDescription>
              </Alert>
            )}
            
            {weightGainWarning?.show && (
              <Alert variant="warning" className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {weightGainWarning.message}
                </AlertDescription>
              </Alert>
            )}
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

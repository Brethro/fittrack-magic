
import { useState, useEffect } from "react";
import { format, differenceInCalendarDays, addDays, isAfter, parseISO } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { useUserData } from "@/contexts/UserDataContext";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function WeightChart() {
  const { userData } = useUserData();
  const isWeightGain = userData.isWeightGain || false;
  
  // Calculate target weight from body fat goal if applicable
  const calculateTargetWeightFromBodyFat = () => {
    if (userData.goalType !== 'bodyFat' || !userData.weight || !userData.bodyFatPercentage || !userData.goalValue) {
      return null;
    }
    
    // Calculate lean body mass
    const currentLeanMass = userData.weight * (1 - (userData.bodyFatPercentage / 100));
    
    // Calculate target weight based on the goal body fat percentage
    // Formula: LBM / (1 - target_bf%)
    const targetWeight = currentLeanMass / (1 - (userData.goalValue / 100));
    
    return targetWeight.toFixed(1);
  };

  // Generate chart data
  const generateChartData = () => {
    if (!userData.weight || !userData.goalValue || !userData.goalDate) {
      return { projectionData: [], actualData: [] };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparisons
    
    const goalDate = new Date(userData.goalDate);
    const totalDays = differenceInCalendarDays(goalDate, today);
    
    // Can't generate proper data for past dates
    if (totalDays <= 0) return { projectionData: [], actualData: [] };
    
    const startWeight = userData.weight;
    
    // Use the calculated target weight for body fat goals
    let targetWeight;
    if (userData.goalType === "bodyFat" && userData.bodyFatPercentage) {
      const calculatedTarget = calculateTargetWeightFromBodyFat();
      targetWeight = calculatedTarget ? parseFloat(calculatedTarget) : startWeight * 0.9;
    } else {
      targetWeight = userData.goalType === "weight" ? userData.goalValue : startWeight * 0.9;
    }
    
    console.log("Generating chart data with: ", {
      startWeight,
      targetWeight,
      totalDays,
      isWeightGain,
      goalDate: format(goalDate, "yyyy-MM-dd"),
      goalPace: userData.goalPace
    });
    
    // Sort weight log by date (oldest first) for consistent charting
    const sortedWeightLog = userData.weightLog ? 
      [...userData.weightLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : 
      [];
    
    // Find the earliest weight entry date
    let earliestEntryDate = today;
    if (sortedWeightLog.length > 0) {
      // Find the earliest date among all entries
      const dates = sortedWeightLog.map(entry => new Date(entry.date));
      earliestEntryDate = new Date(Math.min(...dates.map(date => date.getTime())));
      earliestEntryDate.setHours(0, 0, 0, 0);
    }
    
    // Generate projection data
    const projectionData = [];
    
    // Calculate daily weight change needed to reach target
    const weightChange = targetWeight - startWeight; // Positive for gain, negative for loss
    const dailyChange = weightChange / totalDays;
    
    console.log("Projection calculation:", {
      projectionStartWeight: startWeight,
      targetWeight,
      weightChange,
      dailyChange,
      remainingDays: totalDays,
      calculatedDailyChange: dailyChange
    });
    
    // For past dates (before today), create a flat line at starting weight
    if (earliestEntryDate < today) {
      const pastDays = differenceInCalendarDays(today, earliestEntryDate);
      for (let day = pastDays; day > 0; day--) {
        const currentDate = addDays(today, -day);
        projectionData.push({
          date: format(currentDate, "MMM d"),
          projection: startWeight, // Flat line at starting weight for past dates
          tooltipDate: format(currentDate, "MMMM d, yyyy"),
          fullDate: currentDate
        });
      }
    }
    
    // Add today's point
    projectionData.push({
      date: format(today, "MMM d"),
      projection: startWeight,
      tooltipDate: format(today, "MMMM d, yyyy"),
      fullDate: today
    });
    
    // Calculate an adjusted daily change rate based on the goal pace
    // This ensures aggressive goals reach the target weight by the goal date
    let adjustedDailyChange = dailyChange;
    
    // Apply pace-specific adjustments for more accurate projections
    if (userData.goalPace) {
      if (isWeightGain) {
        // For weight gain, adjust based on surplus percentages
        switch (userData.goalPace) {
          case "aggressive": 
            // For aggressive, ensure we reach the full goal by the date (no adjustment needed)
            break;
          case "moderate":
            // For moderate, slightly reduce the daily change (90% of aggressive)
            adjustedDailyChange = dailyChange * 0.9;
            break;
          case "conservative":
            // For conservative, further reduce the daily change (80% of aggressive)
            adjustedDailyChange = dailyChange * 0.8;
            break;
        }
      } else {
        // For weight loss, adjust based on deficit percentages
        switch (userData.goalPace) {
          case "aggressive":
            // For aggressive, ensure we reach the full goal by the date (no adjustment needed)
            break;
          case "moderate":
            // For moderate, slightly reduce the daily change (90% of aggressive)
            adjustedDailyChange = dailyChange * 0.9;
            break;
          case "conservative":
            // For conservative, further reduce the daily change (75% of aggressive)
            adjustedDailyChange = dailyChange * 0.75;
            break;
        }
      }
    }
    
    // Log the adjusted daily change for debugging
    console.log("Adjusted daily change based on pace:", {
      originalDailyChange: dailyChange,
      adjustedDailyChange: adjustedDailyChange,
      pace: userData.goalPace
    });
    
    // Generate future projection points with the adjusted daily change
    for (let day = 1; day <= totalDays; day++) {
      const currentDate = addDays(today, day);
      
      // Calculate weight with precise decimal values for this day using the adjusted rate
      const projectedWeight = startWeight + (adjustedDailyChange * day);
      
      projectionData.push({
        date: format(currentDate, "MMM d"),
        projection: projectedWeight,
        tooltipDate: format(currentDate, "MMMM d, yyyy"),
        fullDate: currentDate
      });
    }
    
    // Generate separate data array for actual weight entries
    const actualData = [];
    
    if (sortedWeightLog.length > 0) {
      sortedWeightLog.forEach(entry => {
        const entryDate = new Date(entry.date);
        actualData.push({
          date: format(entryDate, "MMM d"),
          actual: entry.weight,
          tooltipDate: format(entryDate, "MMMM d, yyyy"),
          fullDate: entryDate
        });
      });
    }
    
    console.log("Generated projection data:", projectionData);
    console.log("Generated actual data:", actualData);
    
    return { projectionData, actualData };
  };

  const { projectionData, actualData } = generateChartData();
  const targetBodyFatWeight = calculateTargetWeightFromBodyFat();

  // Determine Y-axis range based on data
  const getYAxisDomain = () => {
    if (!userData.weight || !projectionData.length) return [0, 100];
    
    // Find min and max values across both projection and actual data
    const allWeights = [
      ...projectionData.map(d => d.projection),
      ...actualData.map(d => d.actual)
    ].filter(Boolean);
    
    if (allWeights.length === 0) return [0, 100];
    
    const minWeight = Math.min(...allWeights);
    const maxWeight = Math.max(...allWeights);
    
    // Add buffer for better visualization
    const buffer = (maxWeight - minWeight) * 0.1;
    const minValue = Math.floor(minWeight - buffer);
    const maxValue = Math.ceil(maxWeight + buffer);
    
    return [minValue, maxValue];
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-2 text-xs">
          <p className="font-medium">{payload[0].payload.tooltipDate}</p>
          {payload.map((entry: any, index: number) => {
            // Only show entries with values
            if (entry.value == null) return null;
            
            return (
              <p key={index} className="flex items-center gap-1">
                {entry.name === "projection" ? "Projected: " : "Actual: "}
                <span className="font-medium" style={{ color: entry.color }}>
                  {entry.value.toFixed(1)} {userData.useMetric ? "kg" : "lbs"}
                </span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium">
          {userData.goalType === "weight" ? "Weight" : "Body Fat"} Progress
        </h2>
        
        <div className="flex gap-2 text-xs">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-violet-500 rounded-full mr-1"></span>
            <span>Projection</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            <span>Actual</span>
          </div>
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              allowDuplicatedCategory={false}
            />
            <YAxis 
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              domain={getYAxisDomain()}
              width={30}
              tickCount={6}
              allowDecimals={false}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            
            {/* Projection line - completely separate dataset */}
            <Line 
              data={projectionData}
              type="monotone" 
              dataKey="projection" 
              name="projection"
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ fill: '#c4b5fd', r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              connectNulls={true}
              isAnimationActive={true}
            />
            
            {/* Actual line - completely separate dataset */}
            <Line 
              data={actualData}
              type="monotone" 
              dataKey="actual" 
              name="actual"
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ fill: '#6ee7b7', r: 6, stroke: '#10b981', strokeWidth: 2 }}
              connectNulls={true}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Start</p>
          <p className="font-medium">
            {userData.weight} {userData.useMetric ? "kg" : "lbs"}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Goal</p>
          <p className="font-medium">
            {userData.goalType === "weight" 
              ? `${userData.goalValue} ${userData.useMetric ? "kg" : "lbs"}`
              : `${userData.goalValue}% body fat`
            }
            {targetBodyFatWeight && userData.goalType === "bodyFat" && (
              <span className="block text-xs text-muted-foreground mt-0.5">
                Est. final weight: {targetBodyFatWeight} {userData.useMetric ? "kg" : "lbs"}
              </span>
            )}
          </p>
          <p className="text-xs text-primary mt-1">
            {isWeightGain ? 'Building muscle mass' : 'Reducing body fat'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default WeightChart;

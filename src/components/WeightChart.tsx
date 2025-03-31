
import { useState, useEffect } from "react";
import { format, differenceInCalendarDays, addDays, isAfter, parseISO, compareAsc } from "date-fns";
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
    
    // Calculate if this is a realistic timeframe
    // For weight loss: safe rate is 1-2 lbs per week (0.5-1 kg)
    // For weight gain: safe rate is 0.5-1 lb per week (0.25-0.5 kg)
    
    const isMetric = userData.useMetric;
    const weightChange = Math.abs(targetWeight - startWeight);
    
    // Set maximum safe rates (in pounds or kg per week)
    let maxWeeklyRate;
    if (isWeightGain) {
      maxWeeklyRate = isMetric ? 0.5 : 1; // 0.5 kg or 1 lb per week for gaining
    } else {
      maxWeeklyRate = isMetric ? 1 : 2; // 1 kg or 2 lbs per week for losing
    }
    
    // Calculate minimum reasonable number of weeks needed
    const minWeeksNeeded = Math.ceil(weightChange / maxWeeklyRate);
    const minDaysNeeded = minWeeksNeeded * 7;
    
    // Determine if we need to extend the timeline
    const isTimelineUnrealistic = totalDays < minDaysNeeded;
    
    // Use either the goal date or a more realistic date based on safe weight change rates
    const projectionEndDate = isTimelineUnrealistic ? addDays(today, minDaysNeeded) : goalDate;
    const projectionDays = isTimelineUnrealistic ? minDaysNeeded : totalDays;
    
    // Sort weight log by date (oldest first) for consistent charting
    const sortedWeightLog = userData.weightLog ? 
      [...userData.weightLog].sort((a, b) => compareAsc(new Date(a.date), new Date(b.date))) : 
      [];
    
    // Calculate daily weight change needed to reach target
    const weightChange2 = targetWeight - startWeight; // Positive for gain, negative for loss
    const dailyChange = weightChange2 / projectionDays;
    
    console.log("Projection calculation:", {
      projectionStartWeight: startWeight,
      targetWeight,
      weightChange: weightChange2,
      dailyChange,
      orginalDays: totalDays,
      adjustedDays: projectionDays,
      isTimelineUnrealistic,
      minDaysNeeded
    });
    
    // Apply pace-specific adjustments for more accurate projections
    let adjustedDailyChange = dailyChange;
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
    
    // Generate a single continuous array of projection points
    const projectionData = [];
    
    // Start with today's point
    const formattedToday = {
      date: format(today, "yyyy-MM-dd"), // Using ISO format for consistent sorting
      displayDate: format(today, "MMM d"),
      projection: startWeight,
      tooltipDate: format(today, "MMMM d, yyyy"),
      fullDate: today,
      timestamp: today.getTime() // Add timestamp for reliable sorting
    };
    projectionData.push(formattedToday);
    
    // Generate future projection points with the adjusted daily change
    for (let day = 1; day <= projectionDays; day++) {
      const currentDate = addDays(today, day);
      
      // Calculate weight with precise decimal values for this day using the adjusted rate
      const projectedWeight = startWeight + (adjustedDailyChange * day);
      
      projectionData.push({
        date: format(currentDate, "yyyy-MM-dd"), // Using ISO format for consistent sorting
        displayDate: format(currentDate, "MMM d"),
        projection: projectedWeight,
        tooltipDate: format(currentDate, "MMMM d, yyyy"),
        fullDate: currentDate,
        timestamp: currentDate.getTime() // Add timestamp for reliable sorting
      });
    }
    
    // Sort projection data chronologically to ensure proper line rendering
    projectionData.sort((a, b) => a.timestamp - b.timestamp);
    
    // Generate separate data array for actual weight entries
    const actualData = [];
    
    if (sortedWeightLog.length > 0) {
      sortedWeightLog.forEach(entry => {
        const entryDate = new Date(entry.date);
        actualData.push({
          date: format(entryDate, "yyyy-MM-dd"), // Using ISO format for consistent sorting
          displayDate: format(entryDate, "MMM d"),
          actual: entry.weight,
          tooltipDate: format(entryDate, "MMMM d, yyyy"),
          fullDate: entryDate,
          timestamp: entryDate.getTime() // Add timestamp for reliable sorting
        });
      });
      
      // Sort actual data chronologically
      actualData.sort((a, b) => a.timestamp - b.timestamp);
    }
    
    console.log("Generated projection data:", projectionData);
    console.log("Generated actual data:", actualData);
    
    return { 
      projectionData, 
      actualData, 
      isTimelineUnrealistic,
      projectionEndDate
    };
  };

  const { 
    projectionData, 
    actualData, 
    isTimelineUnrealistic, 
    projectionEndDate 
  } = generateChartData();
  
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
    
    // Increase buffer for extreme weight changes (loss or gain)
    const weightDifference = Math.abs(maxWeight - minWeight);
    const bufferPercent = weightDifference > 50 ? 0.15 : 0.1; // Use bigger buffer for extreme changes
    
    const buffer = weightDifference * bufferPercent;
    const minValue = Math.max(0, Math.floor(minWeight - buffer)); // Ensure min is never below 0
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
              dataKey="displayDate" 
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
              dot={false} 
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
          
          {isTimelineUnrealistic && (
            <div className="mt-1 text-xs text-amber-400">
              Projected end: {format(projectionEndDate, "MMM d, yyyy")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WeightChart;


import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Feature = {
  title: string;
  description: string;
  coming: string;
};

const UPCOMING_FEATURES: Feature[] = [
  {
    title: "Workout Tracking",
    description: "Log your workouts and track your progress with detailed exercise stats and history.",
    coming: "Coming soon"
  },
  {
    title: "Recipe Database",
    description: "Browse hundreds of healthy recipes tailored to your nutrition plan.",
    coming: "Coming Q3 2023"
  },
  {
    title: "Smart Notifications",
    description: "Get personalized reminders to stay on track with your fitness goals.",
    coming: "In development"
  },
  {
    title: "Social Challenges",
    description: "Compete with friends and join community challenges to stay motivated.",
    coming: "Planned"
  }
];

const UpcomingFeaturesCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="dark-glass border border-white/10 w-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-lg cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-fuchsia-400" />
            <span>Upcoming Features</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full p-0">
            {isExpanded ? (
              <ChevronUp size={18} className="text-white/70" />
            ) : (
              <ChevronDown size={18} className="text-white/70" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="pt-0 pb-3">
            <div className="space-y-3 mt-2">
              {UPCOMING_FEATURES.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="flex gap-3 p-2 rounded-lg bg-white/5 border border-white/5"
                >
                  <div className="p-2 rounded-full bg-fuchsia-500/10 h-fit">
                    <Rocket size={16} className="text-fuchsia-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">{feature.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                        {feature.coming}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-1">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-3 text-xs text-white/50 italic flex justify-center">
            We're constantly working to improve your experience
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default UpcomingFeaturesCard;

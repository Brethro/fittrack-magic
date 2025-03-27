
import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, Rocket, Barcode, Utensils, Dumbbell, Image, Droplet, Bed } from "lucide-react";
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
  icon: React.ElementType;
};

const UPCOMING_FEATURES: Feature[] = [
  {
    title: "Barcode Scanning",
    description: "Quickly scan food barcodes to log your meals with accurate nutritional information.",
    coming: "Coming soon",
    icon: Barcode
  },
  {
    title: "Recipe Database",
    description: "Browse hundreds of healthy recipes tailored to your nutrition plan.",
    coming: "Coming Q2 2025",
    icon: Utensils
  },
  {
    title: "Workout Library",
    description: "Access a comprehensive database of exercises with form instructions and videos.",
    coming: "In development",
    icon: Dumbbell
  },
  {
    title: "Progress Photos",
    description: "Take and store progress photos to visually track your transformation over time.",
    coming: "Planned",
    icon: Image
  },
  {
    title: "Water Intake Tracking",
    description: "Monitor your daily hydration with reminders throughout the day.",
    coming: "Planned",
    icon: Droplet
  },
  {
    title: "Sleep Tracking",
    description: "Connect with sleep data to optimize recovery and improve fitness results.",
    coming: "Coming Q3 2025",
    icon: Bed
  }
];

const UpcomingFeaturesCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="dark-glass border border-white/10 w-full overflow-hidden">
      <CardHeader className="py-3"> {/* Adjusted padding */}
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
                    <feature.icon size={16} className="text-fuchsia-400" />
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

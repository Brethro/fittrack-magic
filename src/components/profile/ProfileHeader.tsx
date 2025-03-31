
import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  title: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center mb-6"
    >
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate("/plan")}
        className="mr-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-bold text-gradient-purple">
        {title}
      </h1>
    </motion.div>
  );
};

export default ProfileHeader;

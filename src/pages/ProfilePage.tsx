
import { useState } from "react";
import { motion } from "framer-motion";
import { useUserData } from "@/contexts/UserDataContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ProfileHeader from "@/components/profile/ProfileHeader";
import BodyMetricsForm from "@/components/profile/BodyMetricsForm";
import AccountSection from "@/components/profile/AccountSection";

const ProfilePage = () => {
  const { userData, updateUserData, clearUserData, recalculateNutrition } = useUserData();
  const [activeTab, setActiveTab] = useState("body");

  return (
    <div className="container px-4 py-8 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ProfileHeader title="Profile Settings" />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="body">Body Metrics</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="body">
            <BodyMetricsForm 
              userData={userData}
              updateUserData={updateUserData}
              clearUserData={clearUserData}
              recalculateNutrition={recalculateNutrition}
            />
          </TabsContent>
          
          <TabsContent value="account">
            <AccountSection />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ProfilePage;


import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./Layout";
import HomePage from "@/pages/HomePage"; 
import OnboardingPage from "@/pages/OnboardingPage";
import GoalsPage from "@/pages/GoalsPage";
import PlanPage from "@/pages/PlanPage";
import DietPage from "@/pages/DietPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/NotFound";
import EnvSetupDialog from "./EnvSetupDialog";
import SplashScreen from "./SplashScreen";
import AuthCallback from "./auth/AuthCallback";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { FoodLogProvider } from "@/contexts/FoodLogContext";
import { useToast } from "@/hooks/use-toast";
import { useGuestStatus } from "@/hooks/useGuestStatus";

export function AppRoutes() {
  const [showEnvSetup, setShowEnvSetup] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem("hasCompletedOnboarding") === "true";
  });
  const { toast } = useToast();
  const isGuest = useGuestStatus();

  // Check for localStorage changes (for example after a reset)
  useEffect(() => {
    const checkOnboardingStatus = () => {
      const onboardingStatus = localStorage.getItem("hasCompletedOnboarding") === "true";
      setHasCompletedOnboarding(onboardingStatus);
    };
    
    // Set up event listener to check localStorage changes
    window.addEventListener('storage', checkOnboardingStatus);
    
    // Also check on mount
    checkOnboardingStatus();
    
    return () => {
      window.removeEventListener('storage', checkOnboardingStatus);
    };
  }, []);

  useEffect(() => {
    // Check if we have stored credentials in localStorage and load them
    const storedUrl = localStorage.getItem("SUPABASE_URL");
    const storedKey = localStorage.getItem("SUPABASE_ANON_KEY");
    
    // Check if we have the admin URL parameter (for development/admin access)
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';
    setIsAdminMode(isAdmin);

    if (storedUrl && storedKey) {
      // Set session storage values for current page load
      window.sessionStorage.setItem("VITE_SUPABASE_URL", storedUrl);
      window.sessionStorage.setItem("VITE_SUPABASE_ANON_KEY", storedKey);
    } else if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      // If neither stored credentials nor environment variables exist
      if (isAdmin) {
        // Show setup dialog only for admin mode
        setShowEnvSetup(true);
        toast({
          title: "Supabase configuration needed",
          description: "Please configure your Supabase project to enable database features.",
          duration: 5000,
        });
      }
      // Note: we removed the else branch that was setting default credentials since client.ts now handles this
    }
  }, [toast]);

  // Mark as onboarded after completing the flow
  const completeOnboarding = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    setHasCompletedOnboarding(true);
  };

  // Handler for when Supabase config is saved
  const handleConfigSaved = () => {
    // We can optionally add logic here after config is saved
    console.log("Supabase configuration has been saved");
  };

  // Determine if we should show splash screen
  // Now we show it for everyone who hasn't completed onboarding AND for guests
  const shouldShowSplash = !hasCompletedOnboarding || isGuest;

  return (
    <>
      <UserDataProvider>
        <BrowserRouter>
          <FoodLogProvider>
            <Toaster />
            <Routes>
              {/* Auth callback route to handle authentication redirects */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Show splash screen first for non-onboarded users */}
              <Route 
                path="/splash" 
                element={<SplashScreen onComplete={completeOnboarding} />} 
              />
              
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="onboarding" element={<OnboardingPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="plan" element={<PlanPage />} />
                <Route path="diet" element={<DietPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              
              {/* Redirect to splash if conditions are met, otherwise to home */}
              <Route 
                path="*" 
                element={shouldShowSplash ? <Navigate to="/splash" replace /> : <Navigate to="/" replace />} 
              />
            </Routes>
          </FoodLogProvider>
        </BrowserRouter>
      </UserDataProvider>
      
      <EnvSetupDialog 
        open={showEnvSetup} 
        onOpenChange={setShowEnvSetup} 
        onConfigSaved={handleConfigSaved}
        isAdminMode={isAdminMode} 
      />
    </>
  );
}

export default AppRoutes;

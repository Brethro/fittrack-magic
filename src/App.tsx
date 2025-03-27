import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import OnboardingPage from "./pages/OnboardingPage";
import GoalsPage from "./pages/GoalsPage";
import PlanPage from "./pages/PlanPage";
import DietPage from "./pages/DietPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import EnvSetupDialog from "./components/EnvSetupDialog";
import SplashScreen from "./components/SplashScreen";

import { UserDataProvider } from "./contexts/UserDataContext";
import { FoodLogProvider } from "./contexts/FoodLogContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import { useToast } from "./hooks/use-toast";

// Initialize React Query client
const queryClient = new QueryClient();

function AppContent() {
  const [showEnvSetup, setShowEnvSetup] = useState(false);
  const [hasVisitedBefore, setHasVisitedBefore] = useState(() => {
    return localStorage.getItem("hasVisitedBefore") === "true";
  });
  const { toast } = useToast();

  // Check for localStorage changes (for example after a reset)
  useEffect(() => {
    const checkVisitStatus = () => {
      const visitStatus = localStorage.getItem("hasVisitedBefore") === "true";
      setHasVisitedBefore(visitStatus);
    };
    
    // Set up event listener to check localStorage changes
    window.addEventListener('storage', checkVisitStatus);
    
    // Also check on mount
    checkVisitStatus();
    
    return () => {
      window.removeEventListener('storage', checkVisitStatus);
    };
  }, []);

  useEffect(() => {
    // Check if we have stored credentials in localStorage and load them
    const storedUrl = localStorage.getItem("SUPABASE_URL");
    const storedKey = localStorage.getItem("SUPABASE_ANON_KEY");

    if (storedUrl && storedKey) {
      // Set session storage values for current page load
      window.sessionStorage.setItem("VITE_SUPABASE_URL", storedUrl);
      window.sessionStorage.setItem("VITE_SUPABASE_ANON_KEY", storedKey);
    } else if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      // If neither stored credentials nor environment variables exist, show setup dialog
      setShowEnvSetup(true);
      toast({
        title: "Supabase configuration needed",
        description: "Please configure your Supabase project to enable database features.",
        duration: 5000,
      });
    }
  }, [toast]);

  // Mark as visited after the first visit
  useEffect(() => {
    if (!hasVisitedBefore) {
      localStorage.setItem("hasVisitedBefore", "true");
    }
  }, [hasVisitedBefore]);

  return (
    <>
      <SupabaseAuthProvider>
        <UserDataProvider>
          <BrowserRouter>
            <FoodLogProvider>
              <Toaster />
              <Routes>
                <Route path="/splash" element={<SplashScreen />} />
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
                {/* Redirect to splash screen for first-time visitors, otherwise to home */}
                <Route 
                  path="*" 
                  element={hasVisitedBefore ? <Navigate to="/" replace /> : <Navigate to="/splash" replace />} 
                />
              </Routes>
            </FoodLogProvider>
          </BrowserRouter>
        </UserDataProvider>
      </SupabaseAuthProvider>
      
      <EnvSetupDialog open={showEnvSetup} onOpenChange={setShowEnvSetup} />
    </>
  );
}

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;

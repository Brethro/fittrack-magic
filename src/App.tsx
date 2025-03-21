
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserDataProvider } from "./contexts/UserDataContext";
import HomePage from "./pages/HomePage";
import OnboardingPage from "./pages/OnboardingPage";
import GoalsPage from "./pages/GoalsPage";
import PlanPage from "./pages/PlanPage";
import DietPage from "./pages/DietPage";
import ProfilePage from "./pages/ProfilePage";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import { useIsMobile } from "./hooks/use-mobile";
import { App as CapacitorApp } from '@capacitor/app';

const queryClient = new QueryClient();

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Listen for hardware back button on Android
  useEffect(() => {
    const handleBackButton = () => {
      window.history.back();
    };

    let listenerCleanup: (() => void) | undefined;

    if (typeof CapacitorApp.addListener === 'function') {
      // Store the promise in a variable
      const listenerPromise = CapacitorApp.addListener('backButton', handleBackButton);
      
      // Set up cleanup function to be called when the component unmounts
      listenerPromise.then(listener => {
        listenerCleanup = () => {
          listener.remove();
        };
      });
    }

    return () => {
      if (listenerCleanup) {
        listenerCleanup();
      }
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-gradient-purple text-3xl font-bold animate-pulse-gentle">
          FitTrack
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UserDataProvider>
          <BrowserRouter>
            <div className={isMobile ? "mobile-container" : ""}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route element={<Layout />}>
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/goals" element={<GoalsPage />} />
                  <Route path="/plan" element={<PlanPage />} />
                  <Route path="/diet" element={<DietPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </UserDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

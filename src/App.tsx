
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
import ProfilePage from "./pages/ProfilePage";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 800);

    return () => clearTimeout(timer);
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
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route element={<Layout />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/plan" element={<PlanPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </UserDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

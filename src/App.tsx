
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

import { UserDataProvider } from "./contexts/UserDataContext";
import { FoodLogProvider } from "./contexts/FoodLogContext";

// Initialize React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserDataProvider>
          <FoodLogProvider>
            <BrowserRouter>
              <Toaster />
              <Routes>
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
              </Routes>
            </BrowserRouter>
          </FoodLogProvider>
        </UserDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

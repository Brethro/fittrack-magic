
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SupabaseAuthProvider } from "./contexts/auth";
import AppRoutes from "./components/AppRoutes";
import { queryClient } from "./lib/queryClient";
import "./App.css";

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SupabaseAuthProvider>
            <AppRoutes />
          </SupabaseAuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;

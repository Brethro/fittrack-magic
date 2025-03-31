
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";

// Function to check if user is a guest or has account
export function useGuestStatus() {
  const [isGuest, setIsGuest] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // If user is logged in, they are not a guest
    setIsGuest(!user);
  }, [user]);

  return isGuest;
}

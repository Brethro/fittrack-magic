
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function EmptyStateMessage() {
  const navigate = useNavigate();
  
  return (
    <div className="container px-4 py-8 flex items-center justify-center h-[80vh]">
      <div className="text-center">
        <p>Please complete your goals and nutrition plan first</p>
        <Button 
          onClick={() => navigate("/plan")}
          className="mt-4"
        >
          Go to Plan
        </Button>
      </div>
    </div>
  );
}

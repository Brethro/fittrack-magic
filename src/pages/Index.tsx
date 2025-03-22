
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-gradient-purple text-3xl font-bold text-center">FitTrack</CardTitle>
          <CardDescription className="text-center">Your personalized fitness companion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Track your nutrition, monitor your progress, and achieve your fitness goals.
          </p>
          <div className="flex justify-center">
            <img 
              src="/placeholder.svg" 
              alt="FitTrack" 
              className="w-40 h-40 opacity-80"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => navigate('/onboarding')}
          >
            Get Started
          </Button>
          <Button 
            className="w-full" 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/diet')}
          >
            Explore Diet Options
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;

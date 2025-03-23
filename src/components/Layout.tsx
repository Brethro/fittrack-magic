
import { Outlet, useLocation, Link } from "react-router-dom";
import { Home, Target, LineChart, User, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/goals", icon: Target, label: "Goals" },
    { path: "/plan", icon: LineChart, label: "Plan" },
    { path: "/admin", icon: Shield, label: "Admin" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className={`flex-1 w-full ${isMobile ? "max-w-full" : "max-w-md"} mx-auto relative pb-20`}>
        <Outlet />
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className={`${isMobile ? "max-w-full" : "max-w-md"} mx-auto glass-panel rounded-t-xl py-3 px-6`}>
          <ul className="flex justify-between items-center">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === "/goals" && location.pathname === "/onboarding");
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex flex-col items-center p-2 transition-colors duration-200 relative ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navigation-pill"
                        className="absolute inset-0 bg-accent/10 rounded-lg"
                        initial={false}
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                    
                    <span className="relative">
                      <item.icon size={20} />
                    </span>
                    <span className="text-xs font-medium mt-1 relative">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Layout;


import { Outlet, useLocation, Link } from "react-router-dom";
import { Home, Target, LineChart, User, Shield, Apple } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef, useState } from "react";

const Layout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  
  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight } = contentRef.current;
        setIsScrollable(scrollHeight > clientHeight);
      }
    };
    
    // Initial check
    checkScrollable();
    
    // Add resize observer to recheck when dimensions change
    const resizeObserver = new ResizeObserver(checkScrollable);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    // Clean up
    return () => {
      if (contentRef.current) {
        resizeObserver.unobserve(contentRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [location.pathname]);
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/goals", icon: Target, label: "Goals" },
    { path: "/plan", icon: LineChart, label: "Plan" },
    { path: "/diet", icon: Apple, label: "Diet" },
    { path: "/admin", icon: Shield, label: "Admin" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main content area - only enable scrolling when needed */}
      <div 
        ref={contentRef}
        className={`flex-1 w-full ${isScrollable ? 'overflow-auto' : 'overflow-hidden'}`} 
        style={{ paddingBottom: "80px" }}
      >
        <main className={`${isMobile ? "max-w-full" : "max-w-md"} mx-auto relative`}>
          <Outlet />
        </main>
      </div>
      
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

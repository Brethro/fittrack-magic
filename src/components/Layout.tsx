
import { Outlet, useLocation, Link } from "react-router-dom";
import { Home, Target, LineChart, User, Shield, Apple } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef, useState } from "react";

const Layout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const contentRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  
  // Check if content needs scrolling - properly accounting for the navigation bar
  useEffect(() => {
    const checkScrollable = () => {
      if (mainRef.current && contentRef.current && navRef.current) {
        // Get the actual content height without min-height influence
        const mainHeight = mainRef.current.scrollHeight;
        const mainClientHeight = mainRef.current.clientHeight;
        
        // Get the viewport height
        const viewportHeight = window.innerHeight;
        
        // Get the nav height
        const navHeight = navRef.current.offsetHeight;
        
        // Calculate available space (viewport minus nav)
        const availableHeight = viewportHeight - navHeight;
        
        // Special check for home page path
        const isHomePage = location.pathname === "/";
        
        // Determine if scrolling is needed - with special handling for home page
        // For home page, we need to check if there's REAL content that overflows
        // We do this by checking if scrollHeight > clientHeight significantly
        let shouldScroll;
        
        if (isHomePage) {
          // For home page, only enable scroll if actual content (not min-height)
          // exceeds available space by more than a small threshold
          const contentExceedsContainer = mainHeight > mainClientHeight + 10;
          shouldScroll = contentExceedsContainer && mainHeight > availableHeight;
        } else {
          // For other pages, use the standard check
          shouldScroll = mainHeight > availableHeight;
        }
        
        setIsScrollable(shouldScroll);
        
        // More detailed debug info
        console.log({
          path: location.pathname,
          mainHeight,
          mainClientHeight,
          viewportHeight,
          navHeight,
          availableHeight,
          isHomePage,
          shouldScroll
        });
      }
    };
    
    // Initial check after content has properly rendered
    const initialCheckTimer = setTimeout(checkScrollable, 100);
    
    // Recheck when content changes
    const contentObserver = new MutationObserver(() => {
      setTimeout(checkScrollable, 50);
    });
    
    if (mainRef.current) {
      contentObserver.observe(mainRef.current, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });
    }
    
    // Add resize observer for dimension changes
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(checkScrollable, 50);
    });
    
    if (mainRef.current) {
      resizeObserver.observe(mainRef.current);
    }
    
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    if (navRef.current) {
      resizeObserver.observe(navRef.current);
    }
    
    // Also check on window resize
    window.addEventListener('resize', checkScrollable);
    
    // Clean up
    return () => {
      clearTimeout(initialCheckTimer);
      contentObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkScrollable);
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
      >
        <main ref={mainRef} className={`${isMobile ? "max-w-full" : "max-w-md"} mx-auto relative pb-[80px]`}>
          <Outlet />
        </main>
      </div>
      
      <nav ref={navRef} className="fixed bottom-0 left-0 right-0 z-50">
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

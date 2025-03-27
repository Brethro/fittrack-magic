
import { Outlet, useLocation, Link } from "react-router-dom";
import { Home, Target, LineChart, User, Shield, Apple } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef, useState } from "react";
import LoginButton from "./auth/LoginButton";

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
        let shouldScroll;
        
        if (isHomePage) {
          // For home page, only enable scroll if actual content exceeds available space
          const contentExceedsContainer = mainHeight > mainClientHeight + 10;
          shouldScroll = contentExceedsContainer && mainHeight > availableHeight;
        } else {
          // For other pages, use the standard check
          shouldScroll = mainHeight > availableHeight;
        }
        
        setIsScrollable(shouldScroll);
        
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
    <div className="flex flex-col min-h-screen bg-gradient-main">
      {/* Login Button */}
      <LoginButton />
      
      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[100px]" />
        <div className="absolute top-[30%] left-[-10%] w-[400px] h-[400px] rounded-full bg-fuchsia-500/10 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[10%] w-[350px] h-[350px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>
      
      {/* Main content area - only enable scrolling when needed */}
      <div 
        ref={contentRef}
        className={`flex-1 w-full relative z-10 ${isScrollable ? 'overflow-auto' : 'overflow-visible'}`} 
      >
        <main ref={mainRef} className={`${isMobile ? "max-w-full" : "max-w-md"} mx-auto relative pb-[80px]`}>
          <Outlet />
        </main>
      </div>
      
      {/* Navigation with enhanced glass effect */}
      <nav ref={navRef} className="fixed bottom-0 left-0 right-0 z-50">
        <div className={`${isMobile ? "max-w-full" : "max-w-md"} mx-auto nav-glass nav-gradient rounded-t-xl py-3 px-6`}>
          <ul className="flex justify-between items-center">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === "/goals" && location.pathname === "/onboarding");
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex flex-col items-center p-2 transition-colors duration-200 relative ${
                      isActive ? "text-fuchsia-400" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navigation-pill"
                        className="absolute inset-0 bg-white/5 rounded-lg purple-glow"
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

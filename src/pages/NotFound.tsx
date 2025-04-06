
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    document.title = "Page Not Found - Finoak AI";
  }, [location.pathname]);

  return (
    <div className={`min-h-screen ${theme}`}>
      <Navbar />
      
      <main className="container flex flex-col items-center justify-center py-16">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! This page doesn't exist in our market portfolio.
        </p>
        
        <Button asChild>
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </main>
    </div>
  );
};

export default NotFound;


import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyber-dark to-cyber-deep px-4">
      <div className="cyber-card p-8 text-center max-w-md w-full animate-float">
        <h1 className="text-6xl font-bold mb-4 neon-text">404</h1>
        <div className="w-16 h-1 bg-gradient-to-r from-neon-blue to-electric-pink mx-auto my-6"></div>
        <p className="text-xl text-white mb-8">This dimension does not exist</p>
        <a 
          href="/" 
          className="inline-block py-3 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-neon-blue to-vibrant-purple hover:from-vibrant-purple hover:to-neon-blue transition-all duration-300"
        >
          Return to Reality
        </a>
      </div>
    </div>
  );
};

export default NotFound;

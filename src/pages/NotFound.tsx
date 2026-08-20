import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSEO } from "@/hooks/useSEO";
import Layout from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useSEO(
    "404 Not Found – Yassine Jdair",
    "The page you're looking for doesn't exist.",
    location.pathname
  );

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center bg-background text-foreground">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
          <a href="/" className="text-primary hover:underline underline">
            Return to Home
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;

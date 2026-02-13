import { Link } from "react-router";
import { Button } from "../ui/button";

export function MarketingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold text-xl text-foreground">Voxa</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/signin" className="text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link to="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

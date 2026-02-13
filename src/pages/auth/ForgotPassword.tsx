import { Link } from "react-router";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardDescription } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await resetPassword({ email, redirectTo: window.location.origin });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
    
  };
  
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-6 pt-8 px-4 sm:px-6">
            <div className="mx-auto mb-4 w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl">Check your email</h2>
            <CardDescription className="text-sm sm:text-base mt-2">
              We've sent a password reset link to <span className="font-medium text-foreground break-all">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-4 sm:px-6">
            <Alert className="mb-6">
              <Mail className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Link to="/signin" className="block w-full">
                <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
                  Back to Sign In
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
              >
                Try a different email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-6 pt-8 px-4 sm:px-6">
          <Link to="/" className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-6 sm:h-6">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold text-xl sm:text-2xl">Voxa</span>
          </Link>
          <h2 className="text-xl sm:text-2xl">Reset your password</h2>
          <CardDescription className="text-sm sm:text-base mt-2 px-2">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 sm:h-11"
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 h-10 sm:h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending reset link...
                </span>
              ) : (
                "Send reset link"
              )}
            </Button>
            
            <div className="pt-2">
              <Link 
                to="/signin" 
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

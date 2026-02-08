import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TrendingUp, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const DEMO_EMAIL = "demo@wealthtrace.test";
  const DEMO_PASSWORD = "Demo1234!";
  const allowDemo = Boolean(import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Dev-only demo shortcut
      if (allowDemo && email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        toast.success("Signed in as demo user");
        navigate("/dashboard");
        return;
      }
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Check your email to verify your account!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemo = async () => {
    if (!allowDemo) return;
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setIsLoading(true);
    // simulate quick login without supabase
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Signed in as demo user");
      navigate("/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-wealth/10 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-bold">
            Wealth<span className="text-primary">Trace</span>
          </span>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? "Sign in to access your financial digital twin"
                : "Start simulating your financial future today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-secondary/50 border-border"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-wealth"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            {allowDemo && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleUseDemo}
                  className="text-sm text-primary underline"
                >
                  Use demo account (demo@wealthtrace.test)
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Features hint */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>🔐 Secure • 📊 Personalized • 🤖 AI-Powered</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

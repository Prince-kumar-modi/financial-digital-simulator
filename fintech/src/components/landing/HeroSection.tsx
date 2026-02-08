import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedPath from "@/components/ui/AnimatedPath";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-wealth/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-risk/10 blur-3xl" />
      
      {/* Animated paths container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[400px] w-full max-w-4xl">
          <AnimatedPath variant="wealth" delay={0.2} />
          <AnimatedPath variant="risk" delay={0.4} />
          
          {/* Center point (present) */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="relative">
              <div className="h-4 w-4 rounded-full bg-foreground" />
              <div className="absolute inset-0 h-4 w-4 rounded-full bg-foreground animate-ping opacity-50" />
            </div>
          </motion.div>
          
          {/* Path labels */}
          <motion.div
            className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-wealth/20 px-4 py-2 border border-wealth/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.8 }}
          >
            <Sparkles className="h-4 w-4 text-wealth" />
            <span className="text-sm font-medium text-wealth">Smart Investing</span>
          </motion.div>
          
          <motion.div
            className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-risk/20 px-4 py-2 border border-risk/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 3 }}
          >
            <span className="text-sm font-medium text-risk">Status Quo</span>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container relative z-20 mx-auto flex min-h-screen flex-col items-center justify-center px-4 pt-16">
        <motion.div
          className="text-center max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Financial Simulation</span>
          </motion.div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Turn Today's Spending</span>
            <span className="block mt-2">
              Into{" "}
              <span className="text-gradient-wealth">Tomorrow's Insight</span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-lg text-muted-foreground max-w-xl mx-auto">
            Your financial digital twin. See how small habit changes today can transform your wealth trajectory over the next decade.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/setup">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 glow-wealth px-8"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Simulate My Future
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-border/50 hover:bg-secondary"
            >
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-20 grid grid-cols-3 gap-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { value: "10,000+", label: "Simulations Run" },
            { value: "₹2.5Cr", label: "Wealth Insights" },
            { value: "94%", label: "Accuracy Rate" },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-2xl font-bold text-primary font-mono">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ 
          opacity: { delay: 1 },
          y: { repeat: Infinity, duration: 2 }
        }}
      >
        <div className="h-10 w-6 rounded-full border-2 border-muted-foreground/30 p-1">
          <div className="h-2 w-1.5 rounded-full bg-primary mx-auto" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
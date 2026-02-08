import { motion } from "framer-motion";
import { TrendingUp, Shield, Zap, Brain, LineChart, Wallet } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "10-Year Projection",
    description: "Visualize your wealth trajectory based on current habits and smart alternatives.",
    color: "wealth",
  },
  {
    icon: Shield,
    title: "Shock Simulator",
    description: "Stress-test your finances against emergencies, market crashes, and life events.",
    color: "risk",
  },
  {
    icon: Brain,
    title: "AI Advisor",
    description: "Context-aware chatbot that explains your charts and suggests improvements.",
    color: "tech",
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    description: "Adjust habits instantly and watch your financial future transform.",
    color: "wealth",
  },
  {
    icon: LineChart,
    title: "Goal Tracking",
    description: "Set milestones for weddings, homes, and retirement with smart planning.",
    color: "tech",
  },
  {
    icon: Wallet,
    title: "Investment Gateway",
    description: "Connect directly to your brokers and act on AI recommendations.",
    color: "wealth",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const FeaturesSection = () => {
  return (
    <section className="relative py-24 bg-card">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      <div className="container relative mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4 sm:text-4xl">
            Your Complete{" "}
            <span className="text-gradient-wealth">Financial Digital Twin</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powered by Monte Carlo simulations and AI, WealthTrace gives young professionals the foresight they need.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`group relative overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 transition-all hover:border-${feature.color}/50`}
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-${feature.color}/5`} />
              
              <div className="relative">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-${feature.color}/10`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                </div>
                
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
import { motion } from "framer-motion";

interface AnimatedPathProps {
  variant: "wealth" | "risk";
  delay?: number;
}

export const AnimatedPath = ({ variant, delay = 0 }: AnimatedPathProps) => {
  const isWealth = variant === "wealth";
  
  // Generate path data for the curved lines
  const wealthPath = "M 0 200 Q 100 180, 200 150 T 400 80 T 600 30";
  const riskPath = "M 0 200 Q 100 220, 200 260 T 400 320 T 600 380";
  
  return (
    <motion.svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 600 400"
      preserveAspectRatio="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {/* Glow filter */}
      <defs>
        <filter id={`glow-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feFlood floodColor={isWealth ? "#34d399" : "#f43f5e"} floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isWealth ? "#34d399" : "#f43f5e"} stopOpacity="0.2" />
          <stop offset="50%" stopColor={isWealth ? "#34d399" : "#f43f5e"} stopOpacity="1" />
          <stop offset="100%" stopColor={isWealth ? "#34d399" : "#f43f5e"} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      
      {/* Animated path */}
      <motion.path
        d={isWealth ? wealthPath : riskPath}
        fill="none"
        stroke={`url(#gradient-${variant})`}
        strokeWidth="3"
        strokeLinecap="round"
        filter={`url(#glow-${variant})`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 2, delay: delay + 0.5, ease: "easeOut" },
          opacity: { duration: 0.5, delay },
        }}
      />
      
      {/* Animated dot at the end */}
      <motion.circle
        cx={isWealth ? 600 : 600}
        cy={isWealth ? 30 : 380}
        r="6"
        fill={isWealth ? "#34d399" : "#f43f5e"}
        filter={`url(#glow-${variant})`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 2.5 }}
      />
    </motion.svg>
  );
};

export default AnimatedPath;
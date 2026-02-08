import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Zap, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ShockSimulatorProps {
  onApplyShock: (amount: number, year: number, type: string) => void;
  onClearShock: () => void;
  activeShock: { amount: number; year: number; type: string } | null;
  maxShockCapacity: number;
}

const presetShocks = [
  { label: "🏥 Medical Emergency", type: "medical", defaultAmount: 500000 },
  { label: "📉 Market Crash", type: "market", defaultAmount: 500000 },
  { label: "🎓 Higher Education", type: "education", defaultAmount: 1000000 },
  { label: "🚗 Vehicle Purchase", type: "vehicle", defaultAmount: 800000 },
];

export const ShockSimulator = ({
  onApplyShock,
  onClearShock,
  activeShock,
  maxShockCapacity,
}: ShockSimulatorProps) => {
  const [customAmount, setCustomAmount] = useState([300000]);
  const [customYear, setCustomYear] = useState([2027]);
  const [showCustom, setShowCustom] = useState(false);

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 10;

  const handlePresetShock = (type: string, amount: number) => {
    onApplyShock(amount, currentYear + 2, type);
  };

  const handleCustomShock = () => {
    onApplyShock(customAmount[0], customYear[0], "custom");
  };

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-risk" />
          Shock Simulator
        </h3>
        <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
          Max capacity: {formatAmount(maxShockCapacity)}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Stress-test your finances against unexpected events
      </p>

      {/* Shock Capacity Indicator */}
      <div className="bg-secondary/50 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Shock Absorption Capacity</span>
          <span className="font-mono font-semibold text-wealth">
            {formatAmount(maxShockCapacity)}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-wealth to-primary"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((maxShockCapacity / 2000000) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Based on emergency fund + liquid investments
        </p>
      </div>

      {/* Preset Shocks */}
      <div className="space-y-2">
        {presetShocks.map((shock) => (
          <Button
            key={shock.type}
            variant="outline"
            size="sm"
            className={`w-full justify-between ${
              activeShock?.type === shock.type ? "border-risk text-risk bg-risk/10" : ""
            }`}
            onClick={() => handlePresetShock(shock.type, shock.defaultAmount)}
          >
            <span>{shock.label}</span>
            <span className="font-mono text-xs">{formatAmount(shock.defaultAmount)}</span>
          </Button>
        ))}
      </div>

      {/* Custom Shock Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => setShowCustom(!showCustom)}
      >
        <Calculator className="h-4 w-4 mr-2" />
        {showCustom ? "Hide Custom Shock" : "Create Custom Shock"}
      </Button>

      {/* Custom Shock Panel */}
      {showCustom && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 pt-2 border-t border-border"
        >
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">Shock Amount</Label>
                <span className="text-sm font-mono text-primary">
                  {formatAmount(customAmount[0])}
                </span>
              </div>
              <Slider
                value={customAmount}
                onValueChange={setCustomAmount}
                min={50000}
                max={2000000}
                step={50000}
                className="[&_[role=slider]]:bg-risk"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>₹50K</span>
                <span>₹20L</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">Year of Impact</Label>
                <span className="text-sm font-mono text-primary">{customYear[0]}</span>
              </div>
              <Slider
                value={customYear}
                onValueChange={setCustomYear}
                min={currentYear + 1}
                max={maxYear}
                step={1}
                className="[&_[role=slider]]:bg-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{currentYear + 1}</span>
                <span>{maxYear}</span>
              </div>
            </div>
          </div>

          <Button
            variant="default"
            size="sm"
            className="w-full bg-risk hover:bg-risk/90"
            onClick={handleCustomShock}
          >
            <Zap className="h-4 w-4 mr-2" />
            Apply Custom Shock
          </Button>
        </motion.div>
      )}

      {/* Clear Shock */}
      {activeShock && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={onClearShock}
        >
          Clear Active Shock
        </Button>
      )}
    </div>
  );
};

export default ShockSimulator;

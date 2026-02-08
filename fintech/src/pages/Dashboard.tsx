import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, Activity, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { callFunction } from "@/integrations/supabase/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import ShockSimulator from "@/components/dashboard/ShockSimulator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ShockData {
  amount: number;
  year: number;
  type: string;
}

// Generate projection data
interface Milestone {
  year: number;
  amount: number; // in ₹
  label: string;
}

const generateProjectionData = (
  startWealth: number,
  shock: ShockData | null,
  eatingOutReduction: number,
  milestones: Milestone[] = []
) => {
  const currentYear = 2025;
  const horizon = 10; // years after currentYear
  const years = horizon + 1; // inclusive of currentYear

  // Monte Carlo parameters
  const sims = 1000; // number of Monte Carlo paths
  const statusMean = 0.05;
  const statusVol = 0.12; // yearly vol
  const optMean = 0.12;
  const optVol = 0.18;

  // helper: Gaussian RNG (Box-Muller)
  const randNormal = (mu = 0, sigma = 1) => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * sigma + mu;
  };

  // Run sims
  const statusTrajectories: number[][] = Array.from({ length: sims }, () => Array(years).fill(0));
  const optTrajectories: number[][] = Array.from({ length: sims }, () => Array(years).fill(0));

  for (let s = 0; s < sims; s++) {
    let status = startWealth;
    let opt = startWealth;
    for (let t = 0; t < years; t++) {
      const year = currentYear + t;

      // Apply milestone drawdowns at this year
      const yearMilestones = milestones.filter((m) => m.year === year);
      for (const m of yearMilestones) {
        status -= m.amount;
        opt -= m.amount;
      }

      // Apply shock (deterministic timing but stochastic magnitude could be modeled)
      if (shock && year === shock.year) {
        status -= shock.amount;
        opt -= shock.amount;
      }

      // Record before growth for t=0 (starting point)
      statusTrajectories[s][t] = Math.max(status, 0);
      optTrajectories[s][t] = Math.max(opt, 0);

      // advance to next year using a random return
      const statusReturn = randNormal(statusMean, statusVol);
      const optReturn = randNormal(optMean, optVol);

      // apply savings for optimized path
      const monthlySavings = eatingOutReduction * 1000; // ₹1000 per slider point
      opt = (opt + monthlySavings * 12) * (1 + optReturn);
      status = status * (1 + statusReturn);
    }
  }

  // Compute median across sims for each year
  const median = (arr: number[]) => {
    const sorted = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const data = [];
  for (let t = 0; t < years; t++) {
    const year = currentYear + t;
    const statusVals = statusTrajectories.map((row) => row[t]);
    const optVals = optTrajectories.map((row) => row[t]);
    const statusMedian = median(statusVals);
    const optMedian = median(optVals);

    data.push({
      year,
      statusQuo: Math.max(0, Math.round(statusMedian / 100000)), // In lakhs
      optimized: Math.max(0, Math.round(optMedian / 100000)),
      label: year.toString(),
    });
  }

  // Optional: log some Monte Carlo diagnostics for engineering / reasoning
  try {
    const finalOpt = optTrajectories.map((r) => r[years - 1]);
    const probNegativeOpt = finalOpt.filter((v) => v <= 0).length / sims;
    console.debug(`MonteCarlo: sims=${sims}, prob optimized <=0 at horizon=${(probNegativeOpt * 100).toFixed(1)}%`);
  } catch (e) {
    // ignore
  }

  return data;
};

// Calculate health score (depends on net worth and habit adjustments)
const calculateHealthScore = (
  netWorthRupees: number,
  eatingOutReduction: number,
  anonymousSpendingK: number,
  shockApplied: boolean,
  cityTier: string
) => {
  // netWorthRupees is in ₹, convert to lakhs for scaling
  const netWorthLakhs = netWorthRupees / 100000;
  let score = 60; // base - tuned for realism

  // Net worth contribution (scaled, capped)
  score += Math.min(25, netWorthLakhs * 1.5);

  // Savings habits contribution
  score += eatingOutReduction * 3;

  // Anonymous/discretionary spending is a drag on health score; scaled by city cost factor
  // anonymousSpendingK is in thousands (e.g., 12 means ₹12k/month)
  const tierMultiplier = cityTier === "tier1" ? 0.6 : cityTier === "tier2" ? 0.4 : 0.25;
  const anonPenalty = anonymousSpendingK * tierMultiplier; // approx points
  score -= anonPenalty;

  // Tier cost effect: tier1 is most expensive (bigger penalty), tier3 least
  const tierPenalty = cityTier === "tier1" ? 10 : cityTier === "tier2" ? 5 : 0;
  score -= tierPenalty;

  if (shockApplied) score -= 15;

  return Math.min(100, Math.max(0, Math.round(score)));
};

// Calculate max shock capacity (simplified - based on savings trajectory)
const calculateMaxShockCapacity = (eatingOutReduction: number) => {
  const baseLiquidity = 300000; // ₹3L base emergency fund
  const additionalSavings = eatingOutReduction * 12000 * 2; // 2 years of savings
  return baseLiquidity + additionalSavings;
};

const Dashboard = () => {
  const [activeShock, setActiveShock] = useState<ShockData | null>(null);
  const [eatingOutReduction, setEatingOutReduction] = useState([0]);
  const [currentNetWorthInput, setCurrentNetWorthInput] = useState<number>(() => {
    // default 5 lakhs
    return 5;
  });
  const [cityTier, setCityTier] = useState<string>(() => {
    // default to tier1 if user hasn't entered
    return "tier1";
  });
  const [anonymousSpending, setAnonymousSpending] = useState<number[]>(() => {
    // default per tier in ₹K/month
    const def = 12; // tier1 default 12K
    return [def];
  });
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const { user } = useAuth();
  
  const startWealthRupees = currentNetWorthInput * 100000;
  const projectionData = useMemo(
    () => generateProjectionData(startWealthRupees, activeShock, eatingOutReduction[0], milestones),
    [activeShock, eatingOutReduction, startWealthRupees, milestones]
  );
  
  // keep anonymous spending aligned with tier defaults when tier changes
  useEffect(() => {
    const defaults: Record<string, number> = { tier1: 12, tier2: 8, tier3: 5 };
    setAnonymousSpending([defaults[cityTier] ?? 8]);
  }, [cityTier]);

  // Load milestone goals (wedding, house) saved from Setup
  useEffect(() => {
    try {
      const raw = localStorage.getItem("wealthTraceData");
      if (!raw) return;
      const parsed = JSON.parse(raw || "{}");
      const ms: Milestone[] = [];
      if (parsed.weddingYear && parsed.weddingCost) {
        const y = Number(parsed.weddingYear);
        const amt = Number(parsed.weddingCost);
        if (!Number.isNaN(y) && !Number.isNaN(amt) && y > 1900) {
          ms.push({ year: y, amount: amt, label: "Wedding" });
        }
      }
      if (parsed.houseYear && parsed.houseCost) {
        const y = Number(parsed.houseYear);
        const amt = Number(parsed.houseCost);
        if (!Number.isNaN(y) && !Number.isNaN(amt) && y > 1900) {
          ms.push({ year: y, amount: amt, label: "House Downpayment" });
        }
      }
      setMilestones(ms);
    } catch (e) {
      console.warn("Failed to parse wealthTraceData for milestones", e);
    }
  }, []);

  // If logged in, load profile and user metadata from Supabase
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        // Load profile (if any)
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profileErr) {
          console.warn("Error loading profile:", profileErr.message);
        } else if (profile) {
          const ms: Milestone[] = [];
          if (profile.wedding_year && profile.wedding_cost) {
            ms.push({ year: Number(profile.wedding_year), amount: Number(profile.wedding_cost), label: "Wedding" });
          }
          if (profile.house_year && profile.house_cost) {
            ms.push({ year: Number(profile.house_year), amount: Number(profile.house_cost), label: "House Downpayment" });
          }
          if (ms.length) setMilestones(ms);
        }

        // Load user metadata
        const { data: userData } = await supabase.auth.getUser();
        const meta = userData?.user?.user_metadata as any | undefined;
        if (meta) {
          if (meta.net_worth) setCurrentNetWorthInput(Number(meta.net_worth));
          if (meta.anonymous_spending) setAnonymousSpending([Number(meta.anonymous_spending)]);
          if (meta.city_tier) setCityTier(meta.city_tier);
        }
      } catch (err) {
        console.error("Failed to load profile/metadata:", err);
      }
    })();
  }, [user]);

  const saveSettings = async () => {
    if (!user) {
      // store locally for anonymous users
      const raw = localStorage.getItem("wealthTraceData") || "{}";
      const parsed = JSON.parse(raw);
      parsed.netWorth = currentNetWorthInput;
      parsed.anonymousSpending = anonymousSpending[0];
      parsed.cityTier = cityTier;
      localStorage.setItem("wealthTraceData", JSON.stringify(parsed));
      toast.success("Saved settings locally");
      return;
    }

    try {
      // Update auth user metadata
      const meta: any = {
        net_worth: currentNetWorthInput,
        anonymous_spending: anonymousSpending[0],
        city_tier: cityTier,
      };
      const { error: updErr } = await supabase.auth.updateUser({ data: meta });
      if (updErr) {
        toast.error("Failed to update profile metadata: " + updErr.message);
        return;
      }
      toast.success("Settings saved to your account");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    }
  };

  const healthScore = calculateHealthScore(
    startWealthRupees,
    eatingOutReduction[0],
    anonymousSpending[0],
    activeShock !== null,
    cityTier
  );
  const maxShockCapacity = calculateMaxShockCapacity(eatingOutReduction[0]);
  
  const currentWealth = projectionData[0]?.optimized || Math.round(startWealthRupees / 100000);
  const futureWealth = projectionData[projectionData.length - 1]?.optimized || 0;
  const growthPercent = Math.round(((futureWealth - currentWealth) / currentWealth) * 100);

  const tierDisplay = cityTier === "tier1" ? "Tier 1 (default)" : cityTier === "tier2" ? "Tier 2" : "Tier 3";

  const handleApplyShock = (amount: number, year: number, type: string) => {
    setActiveShock({ amount, year, type });
  };

  const handleClearShock = () => {
    setActiveShock(null);
  };

  const [aiTips, setAiTips] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAiTips = async () => {
    setAiLoading(true);
    setAiTips("");
    try {
      const systemPrompt = `You are the WealthTrace Financial Assistant. Provide concise, research-backed, prioritized investment and savings recommendations tailored to a young professional in India. Analyze trends in equities (company growth), gold, silver, and mutual funds; recommend allocations, time-horizon strategies, rebalancing cadence, and practical steps to increase returns while managing risk. Return the answer as a short list of bullet points (6-8), each 1-2 sentences.`;

      const userPrompt = `User context:\n- Current net worth: ₹${startWealthRupees}\n- Monthly savings: ₹${25 + eatingOutReduction[0]}K\n- Health score: ${healthScore}/100\n- Active shock: ${activeShock?.type || "none"}\n\nProvide prioritized actionable tips.`;

      const payload = {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        context: chatContext,
      };

      const res = await callFunction("chat", payload);
      if (!res.ok) {
        const text = await res.text();
        toast.error("AI service error: " + (text || res.statusText));
        setAiLoading(false);
        return;
      }

      // Stream parsing (SSE-style) to accumulate content
      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let collected = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          let newlineIndex;
          while ((newlineIndex = buf.indexOf("\n")) !== -1) {
            let line = buf.slice(0, newlineIndex);
            buf = buf.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                collected += content;
                setAiTips(collected);
              }
            } catch {
              // ignore partial parse
            }
          }
        }
      } else {
        const text = await res.text();
        setAiTips(text);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch AI tips");
    } finally {
      setAiLoading(false);
    }
  };

  // Context for AI chatbot
  const chatContext = {
    netWorth: currentWealth,
    monthlySavings: 25 + eatingOutReduction[0],
    anonymousSpending: anonymousSpending[0],
    healthScore,
    shockApplied: activeShock?.type,
    eatingOutReduction: eatingOutReduction[0],
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20" />

      <main className="container relative mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Your Financial <span className="text-gradient-wealth">Digital Twin</span>
                </h1>
                <p className="text-muted-foreground">
                  10-year wealth projection based on your habits and goals
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">Current Net Worth (in lakhs)</div>
                <div className="w-36">
                  <Label htmlFor="networth" className="sr-only">Current Net Worth</Label>
                  <Input
                    id="networth"
                    type="number"
                    min={0}
                    step={0.1}
                    value={currentNetWorthInput}
                    onChange={(e) => setCurrentNetWorthInput(Number(e.target.value))}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">City Tier</div>
                  <div className="w-40">
                    <Select value={cityTier} onValueChange={(v) => setCityTier(v)}>
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Select city tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tier1">Tier 1 (Mumbai, Delhi, Bangalore)</SelectItem>
                        <SelectItem value="tier2">Tier 2 (Pune, Hyderabad, Chennai)</SelectItem>
                        <SelectItem value="tier3">Tier 3 (Other cities)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                    <div>
                      <button
                        onClick={saveSettings}
                        className="ml-2 rounded-md px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Save Settings
                      </button>
                    </div>
                </div>
              </div>
            </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[
            {
              label: "Current Net Worth",
              value: `₹${currentWealth}L`,
              change: "+5%",
              icon: Wallet,
              positive: true,
            },
            {
              label: "Projected (2035)",
              value: `₹${futureWealth}L`,
              change: `+${growthPercent}%`,
              icon: TrendingUp,
              positive: true,
            },
            {
              label: `Health Score (${tierDisplay})`,
              value: healthScore,
              change: healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs Work",
              icon: Activity,
              positive: healthScore >= 70,
            },
            {
              label: "Monthly Savings",
              value: `₹${25 + eatingOutReduction[0]}K`,
              change: eatingOutReduction[0] > 0 ? `+₹${eatingOutReduction[0]}K` : "Base",
              icon: ArrowUpRight,
              positive: true,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className={`h-5 w-5 ${stat.positive ? "text-wealth" : "text-risk"}`} />
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold font-mono">{stat.value}</span>
                <span className={`text-sm ${stat.positive ? "text-wealth" : "text-risk"} flex items-center gap-1`}>
                  {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">10-Year Net Worth Projection</h2>
                <p className="text-sm text-muted-foreground">Comparing current path vs optimized investing</p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-wealth" />
                  Smart Investing
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-risk" />
                  Status Quo
                </span>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                  <XAxis 
                    dataKey="label" 
                    stroke="hsl(215 20% 55%)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(215 20% 55%)"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222 47% 8%)",
                      border: "1px solid hsl(217 33% 17%)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(210 40% 98%)" }}
                    formatter={(value: number, name: string) => [
                      `₹${value}L`,
                      name === "optimized" ? "Smart Investing" : "Status Quo",
                    ]}
                  />
                  {activeShock && (
                    <ReferenceLine
                      x={activeShock.year.toString()}
                      stroke="#f43f5e"
                      strokeDasharray="5 5"
                      label={{ 
                        value: `${activeShock.type} (₹${(activeShock.amount / 100000).toFixed(1)}L)`, 
                        fill: "#f43f5e", 
                        fontSize: 12 
                      }}
                    />
                  )}
                  {milestones.map((m, i) => (
                    <ReferenceLine
                      key={`m-${i}`}
                      x={m.year.toString()}
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                      label={{
                        value: `${m.label} (₹${(m.amount / 100000).toFixed(1)}L)`,
                        fill: "#f59e0b",
                        fontSize: 11,
                      }}
                    />
                  ))}
                  <Area
                    type="monotone"
                    dataKey="optimized"
                    stroke="#34d399"
                    strokeWidth={2}
                    fill="url(#wealthGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="statusQuo"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fill="url(#riskGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* AI Recommendations Panel */}
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-semibold">Smart Investing Tips</h3>
                <button
                  onClick={fetchAiTips}
                  disabled={aiLoading}
                  className={`rounded-md px-3 py-1 text-sm ${aiLoading ? "bg-secondary/40" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                >
                  {aiLoading ? "Generating..." : "Get AI Tips"}
                </button>
              </div>

              <div className="prose prose-sm max-w-none text-sm text-muted-foreground">
                {aiTips ? (
                  <ReactMarkdown>{aiTips}</ReactMarkdown>
                ) : (
                  <p>Click "Get AI Tips" to fetch prioritized investment & savings recommendations based on your projection and habits.</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Controls Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Health Score Gauge */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Financial Health Score</h3>
              <div className="relative flex items-center justify-center">
                <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="hsl(217 33% 17%)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={healthScore >= 70 ? "#34d399" : healthScore >= 50 ? "#fbbf24" : "#f43f5e"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(healthScore / 100) * 251.2} 251.2`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-bold font-mono">{healthScore}</span>
                  <span className="block text-xs text-muted-foreground">out of 100</span>
                </div>
              </div>
            </div>

            {/* Enhanced Shock Simulator */}
            <ShockSimulator
              onApplyShock={handleApplyShock}
              onClearShock={handleClearShock}
              activeShock={activeShock}
              maxShockCapacity={maxShockCapacity}
            />

            {/* Habit Delta Slider */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Habit Adjustment</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Reduce monthly eating out spend to see impact
              </p>
              <div className="space-y-4">
                <Slider
                  value={eatingOutReduction}
                  onValueChange={setEatingOutReduction}
                  max={8}
                  step={1}
                  className="[&_[role=slider]]:bg-primary"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current: ₹8K</span>
                  <span className="text-wealth font-medium">
                    Save: ₹{eatingOutReduction[0]}K/month
                  </span>
                </div>
                {/* Anonymous spending slider - depends on city tier and affects health score */}
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Anonymous Spending</h4>
                  <p className="text-xs text-muted-foreground mb-2">Monthly discretionary spending (₹K). Higher values reduce your health score.</p>
                  <Slider
                    value={anonymousSpending}
                    onValueChange={setAnonymousSpending}
                    max={20}
                    step={1}
                    className="[&_[role=slider]]:bg-primary"
                  />
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Current: ₹{anonymousSpending[0]}K</span>
                    <span className="text-muted-foreground">Tier: {cityTier}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <ChatWidget context={chatContext} />
    </div>
  );
};

export default Dashboard;

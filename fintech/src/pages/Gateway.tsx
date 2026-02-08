import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Check, Lock, Wallet, TrendingUp, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import { supabase } from "@/integrations/supabase/client";

interface Broker {
  id: string;
  name: string;
  logo: string;
  description: string;
  features: string[];
  connected: boolean;
}

const brokers: Broker[] = [
  {
    id: "groww",
    name: "Groww",
    logo: "🌱",
    description: "India's most loved investment app",
    features: ["Zero brokerage", "Direct MFs", "US Stocks"],
    connected: false,
  },
  {
    id: "upstox",
    name: "Upstox",
    logo: "📈",
    description: "Trade at flat ₹20/order",
    features: ["Pro charts", "Fast execution", "Low costs"],
    connected: false,
  },
  {
    id: "zerodha",
    name: "Zerodha",
    logo: "⚡",
    description: "India's largest broker by volume",
    features: ["Kite platform", "Coin for MFs", "Console"],
    connected: false,
  },
  {
    id: "indmoney",
    name: "INDmoney",
    logo: "💎",
    description: "All-in-one wealth management",
    features: ["Track net worth", "US investing", "Tax filing"],
    connected: false,
  },
];

interface ActionItem {
  id: string;
  title: string;
  description: string;
  amount: string;
  completed: boolean;
  linkedBroker: string | null;
}

const initialActions: ActionItem[] = [
  {
    id: "1",
    title: "Start SIP in Index Fund",
    description: "Based on your goals, a ₹5,000/month SIP could help you reach your house down payment target",
    amount: "₹5,000/month",
    completed: false,
    linkedBroker: null,
  },
  {
    id: "2",
    title: "Open Emergency Fund",
    description: "Your current emergency fund covers only 2 months. Aim for 6 months of expenses",
    amount: "₹50,000",
    completed: false,
    linkedBroker: null,
  },
  {
    id: "3",
    title: "Invest in Tax-Saving ELSS",
    description: "Maximize your 80C deductions while building long-term wealth",
    amount: "₹12,500/month",
    completed: false,
    linkedBroker: null,
  },
];

const Gateway = () => {
  const [connectedBrokers, setConnectedBrokers] = useState<string[]>([]);
  const [actions, setActions] = useState(initialActions);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [pendingBroker, setPendingBroker] = useState<Broker | null>(null);

  const handleConnect = (brokerId: string) => {
    const broker = brokers.find((b) => b.id === brokerId) || null;
    setPendingBroker(broker);
    setShowConnectModal(true);
  };

  const finalizeConnect = async (brokerId: string) => {
    setShowConnectModal(false);
    try {
      // Try to persist connection in Supabase (graceful if table doesn't exist)
      if (supabase) {
        const payload = { broker_id: brokerId, connected_at: new Date().toISOString() } as any;
        const { error } = await supabase.from("broker_connections").insert(payload).select();
        if (error) {
          console.warn("Supabase insert failed (table may not exist):", error.message);
        }
      }
    } catch (err) {
      console.error("Failed to persist broker connection:", err);
    }

    // Always update UI state locally
    setConnectedBrokers((prev) => (prev.includes(brokerId) ? prev : [...prev, brokerId]));

    // If an action was selected, mark it as completed/linked
    if (selectedAction) {
      setActions((prev) =>
        prev.map((action) =>
          action.id === selectedAction ? { ...action, linkedBroker: brokerId, completed: true } : action
        )
      );
      setSelectedAction(null);
    }
  };

  const handleActionClick = (actionId: string) => {
    setSelectedAction(actionId === selectedAction ? null : actionId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20" />
      <div className="fixed top-1/4 right-1/4 h-96 w-96 rounded-full bg-tech/5 blur-3xl" />

      <main className="container relative mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Investment <span className="text-gradient-tech">Gateway</span>
          </h1>
          <p className="text-muted-foreground">
            Connect your brokers and take action on AI recommendations
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Action Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tech/20">
                <TrendingUp className="h-5 w-5 text-tech" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI-Recommended Actions</h2>
                <p className="text-sm text-muted-foreground">Click to select, then connect a broker</p>
              </div>
            </div>

            <div className="space-y-3">
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  onClick={() => handleActionClick(action.id)}
                  className={`w-full text-left rounded-lg border p-4 transition-all ${
                    action.completed
                      ? "border-wealth/50 bg-wealth/5"
                      : selectedAction === action.id
                      ? "border-tech bg-tech/10"
                      : "border-border bg-secondary/30 hover:border-border/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        action.completed
                          ? "border-wealth bg-wealth text-wealth-foreground"
                          : selectedAction === action.id
                          ? "border-tech"
                          : "border-muted-foreground"
                      }`}
                    >
                      {action.completed && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{action.title}</h3>
                        <Badge variant="outline" className="font-mono">
                          {action.amount}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                      {action.completed && action.linkedBroker && (
                        <p className="text-xs text-wealth mt-2">
                          ✓ Pending via {action.linkedBroker}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {selectedAction && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t border-border"
              >
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-tech" />
                  Now select a broker below to complete this action
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Broker Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-wealth/20">
                <Wallet className="h-5 w-5 text-wealth" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Connect Your Broker</h2>
                <p className="text-sm text-muted-foreground">Secure OAuth connections</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {brokers.map((broker, index) => {
                const isConnected = connectedBrokers.includes(broker.id);
                return (
                  <motion.div
                    key={broker.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`relative rounded-xl border p-4 transition-all ${
                      isConnected
                        ? "border-wealth/50 bg-wealth/5"
                        : selectedAction
                        ? "border-tech/50 hover:border-tech cursor-pointer"
                        : "border-border bg-secondary/30 hover:border-border/80"
                    }`}
                  >
                    {/* Browser-like header */}
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-risk/50" />
                        <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                        <div className="h-2 w-2 rounded-full bg-wealth/50" />
                      </div>
                      <div className="flex-1 text-center">
                        <span className="text-xs text-muted-foreground font-mono">
                          {broker.id}.in
                        </span>
                      </div>
                      <Lock className="h-3 w-3 text-wealth" />
                    </div>

                    <div className="text-center">
                      <span className="text-4xl mb-2 block">{broker.logo}</span>
                      <h3 className="font-semibold">{broker.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{broker.description}</p>
                      
                      <div className="flex flex-wrap gap-1 justify-center mt-3">
                        {broker.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className={`w-full mt-4 ${
                        isConnected
                          ? "bg-wealth/20 text-wealth hover:bg-wealth/30"
                          : selectedAction
                          ? "bg-tech text-tech-foreground hover:bg-tech/90"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      onClick={() => !isConnected && handleConnect(broker.id)}
                      disabled={isConnected}
                    >
                      {isConnected ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Connected
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {/* Security note */}
            <div className="mt-6 flex items-start gap-3 rounded-lg bg-secondary/50 p-4">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Secure Connections</p>
                <p className="text-muted-foreground">
                  We use OAuth 2.0 for secure broker authentication. We never store your broker passwords.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
        <ChatWidget />

        {/* Connect Modal - appears when user attempts to connect a broker */}
        {showConnectModal && pendingBroker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-lg bg-card p-6">
              <h3 className="text-lg font-semibold mb-2">Connect {pendingBroker.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will open the broker's authorization flow in a new tab. After you complete authorization, click "Authorize" here to finish connecting.
              </p>

              <div className="flex gap-2 mb-4">
                <a
                  href={`https://${pendingBroker.id}.in`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2"
                >
                  Open {pendingBroker.name}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="rounded-md px-3 py-2 bg-secondary/50"
                  onClick={() => {
                    setShowConnectModal(false);
                    setPendingBroker(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="rounded-md px-3 py-2 bg-tech text-tech-foreground"
                  onClick={() => finalizeConnect(pendingBroker.id)}
                >
                  Authorize
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Gateway;
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, ShoppingBag, Target, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  // Profile
  income: string;
  cityTier: string;
  age: string;
  // Habits
  rent: string;
  foodDelivery: string;
  leisure: string;
  // Goals
  weddingYear: string;
  weddingCost: string;
  houseYear: string;
  houseCost: string;
}

const steps = [
  { id: 1, label: "Profile", icon: User },
  { id: 2, label: "Habits", icon: ShoppingBag },
  { id: 3, label: "Goals", icon: Target },
];

const Setup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    income: "",
    cityTier: "",
    age: "",
    rent: "",
    foodDelivery: "",
    leisure: "",
    weddingYear: "",
    weddingCost: "",
    houseYear: "",
    houseCost: "",
  });

  const updateFormData = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Store form data locally
      localStorage.setItem("wealthTraceData", JSON.stringify(formData));

      // If logged in, persist to Supabase `profiles` table (upsert)
      if (user) {
        const profileInsert = {
          user_id: user.id,
          income: formData.income ? Number(formData.income) : null,
          city_tier: formData.cityTier || null,
          age: formData.age ? Number(formData.age) : null,
          rent: formData.rent ? Number(formData.rent) : null,
          food_spend: formData.foodDelivery ? Number(formData.foodDelivery) : null,
          leisure_spend: formData.leisure ? Number(formData.leisure) : null,
          wedding_year: formData.weddingYear ? Number(formData.weddingYear) : null,
          wedding_cost: formData.weddingCost ? Number(formData.weddingCost) : null,
          house_year: formData.houseYear ? Number(formData.houseYear) : null,
          house_cost: formData.houseCost ? Number(formData.houseCost) : null,
          user_id: user.id,
        };

        supabase
          .from("profiles")
          .upsert(profileInsert)
          .then(({ error }) => {
            if (error) console.warn("Failed to persist profile:", error.message);
          });
      }

      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20" />
      <div className="fixed top-1/4 left-1/4 h-96 w-96 rounded-full bg-wealth/5 blur-3xl" />
      <div className="fixed bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-tech/5 blur-3xl" />

      <main className="container relative mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-bold mb-4">
              Let's Build Your <span className="text-gradient-wealth">Financial Twin</span>
            </h1>
            <p className="text-muted-foreground">
              Tell us about yourself so we can simulate your financial future.
            </p>
          </motion.div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  className={`flex items-center justify-center h-12 w-12 rounded-full border-2 transition-colors ${
                    currentStep >= step.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground"
                  }`}
                  animate={{
                    scale: currentStep === step.id ? 1.1 : 1,
                  }}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-24 h-0.5 mx-2 transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-xl"
          >
            <AnimatePresence mode="wait" custom={currentStep}>
              {/* Step 1: Profile */}
              {currentStep === 1 && (
                <motion.div
                  key="profile"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-semibold">Your Profile</h2>
                    <p className="text-sm text-muted-foreground">Basic information about your financial situation</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="income">Monthly Income (₹)</Label>
                      <Input
                        id="income"
                        type="number"
                        placeholder="e.g., 80000"
                        value={formData.income}
                        onChange={(e) => updateFormData("income", e.target.value)}
                        className="mt-2 bg-secondary border-0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cityTier">City Tier</Label>
                      <Select
                        value={formData.cityTier}
                        onValueChange={(value) => updateFormData("cityTier", value)}
                      >
                        <SelectTrigger className="mt-2 bg-secondary border-0">
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
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="e.g., 25"
                        value={formData.age}
                        onChange={(e) => updateFormData("age", e.target.value)}
                        className="mt-2 bg-secondary border-0"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Habits */}
              {currentStep === 2 && (
                <motion.div
                  key="habits"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-semibold">Your Spending Habits</h2>
                    <p className="text-sm text-muted-foreground">Monthly expenses that shape your financial future</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rent">Monthly Rent (₹)</Label>
                      <Input
                        id="rent"
                        type="number"
                        placeholder="e.g., 25000"
                        value={formData.rent}
                        onChange={(e) => updateFormData("rent", e.target.value)}
                        className="mt-2 bg-secondary border-0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="foodDelivery">Swiggy/Zomato Monthly Spend (₹)</Label>
                      <Input
                        id="foodDelivery"
                        type="number"
                        placeholder="e.g., 8000"
                        value={formData.foodDelivery}
                        onChange={(e) => updateFormData("foodDelivery", e.target.value)}
                        className="mt-2 bg-secondary border-0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="leisure">Weekend Leisure Costs (₹)</Label>
                      <Input
                        id="leisure"
                        type="number"
                        placeholder="e.g., 5000"
                        value={formData.leisure}
                        onChange={(e) => updateFormData("leisure", e.target.value)}
                        className="mt-2 bg-secondary border-0"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Goals */}
              {currentStep === 3 && (
                <motion.div
                  key="goals"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-semibold">Your Financial Goals</h2>
                    <p className="text-sm text-muted-foreground">Major life milestones you're planning for</p>
                  </div>

                  <div className="space-y-6">
                    {/* Wedding Goal */}
                    <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-tech" />
                        Wedding
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="weddingYear">Target Year</Label>
                          <Input
                            id="weddingYear"
                            type="number"
                            placeholder="e.g., 2028"
                            value={formData.weddingYear}
                            onChange={(e) => updateFormData("weddingYear", e.target.value)}
                            className="mt-2 bg-secondary border-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="weddingCost">Estimated Cost (₹)</Label>
                          <Input
                            id="weddingCost"
                            type="number"
                            placeholder="e.g., 2000000"
                            value={formData.weddingCost}
                            onChange={(e) => updateFormData("weddingCost", e.target.value)}
                            className="mt-2 bg-secondary border-0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* House Goal */}
                    <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-wealth" />
                        House Down Payment
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="houseYear">Target Year</Label>
                          <Input
                            id="houseYear"
                            type="number"
                            placeholder="e.g., 2030"
                            value={formData.houseYear}
                            onChange={(e) => updateFormData("houseYear", e.target.value)}
                            className="mt-2 bg-secondary border-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="houseCost">Down Payment (₹)</Label>
                          <Input
                            id="houseCost"
                            type="number"
                            placeholder="e.g., 5000000"
                            value={formData.houseCost}
                            onChange={(e) => updateFormData("houseCost", e.target.value)}
                            className="mt-2 bg-secondary border-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {currentStep === 3 ? "Simulate Future" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <ChatWidget />
    </div>
  );
};

export default Setup;
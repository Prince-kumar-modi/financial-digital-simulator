import Header from "@/components/layout/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ChatWidget from "@/components/chat/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ChatWidget />
    </div>
  );
};

export default Index;
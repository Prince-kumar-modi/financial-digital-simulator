import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";

const News = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container relative mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Market News</h1>
          <p className="text-muted-foreground">Latest market headlines and commentary tailored to your portfolio.</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-medium">Markets open higher amid positive data</h3>
            <p className="text-sm text-muted-foreground mt-1">Livescore: Stocks in IT and FMCG lead gains.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-medium">RBI signals steady policy</h3>
            <p className="text-sm text-muted-foreground mt-1">Interest rate guidance unchanged for now.</p>
          </div>
        </div>
      </main>

      <ChatWidget />
    </div>
  );
};

export default News;

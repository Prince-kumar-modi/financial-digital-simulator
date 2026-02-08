import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";

const Investments = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container relative mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Investments</h1>
          <p className="text-muted-foreground">Track and manage your investments across brokers.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-2">Portfolio Summary</h2>
            <p className="text-sm text-muted-foreground">Overview of holdings, allocation and performance.</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">Orders, deposits and withdrawals will appear here.</p>
          </div>
        </div>
      </main>

      <ChatWidget />
    </div>
  );
};

export default Investments;

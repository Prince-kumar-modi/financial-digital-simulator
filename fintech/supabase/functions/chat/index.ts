import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  context?: {
    netWorth?: number;
    monthlySavings?: number;
    healthScore?: number;
    shockApplied?: string;
    eatingOutReduction?: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context }: ChatRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    let systemPrompt = `You are the WealthTrace Financial Assistant, an AI expert in personal finance for young Indian professionals.

Your role:
- Help users understand their financial projections and chart insights
- Explain the impact of their habits on long-term wealth
- Guide users to take action on the Investment Gateway
- Provide clear, actionable financial advice

Communication style:
- Use ₹ (Indian Rupees) for all currency
- Use "lakhs" (L) and "crores" (Cr) for large amounts
- Be empathetic but data-driven
- Keep responses concise but helpful`;

    if (context) {
      systemPrompt += `\n\nCurrent User Financial Context:
- Current Net Worth: ₹${context.netWorth || 5}L
- Monthly Savings: ₹${context.monthlySavings || 25}K
- Financial Health Score: ${context.healthScore || 72}/100
${context.shockApplied ? `- Active Shock Scenario: ${context.shockApplied}` : ""}
${context.eatingOutReduction ? `- User is considering reducing eating out by ₹${context.eatingOutReduction}K/month` : ""}

Use this context to provide personalized advice. If you see issues in their data, proactively suggest solutions.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

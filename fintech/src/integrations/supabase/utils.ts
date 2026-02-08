const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function callFunction(name: string, body: any, init?: RequestInit) {
  if (!SUPABASE_URL) {
    throw new Error("VITE_SUPABASE_URL is not configured");
  }

  const url = `${SUPABASE_URL.replace(/\/+$/, "")}/functions/v1/${name}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (SUPABASE_ANON_KEY) {
    headers["Authorization"] = `Bearer ${SUPABASE_ANON_KEY}`;
    headers["apikey"] = SUPABASE_ANON_KEY;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers, ...(init?.headers as any) },
    body: JSON.stringify(body),
    ...init,
  });

  return res;
}

export default callFunction;

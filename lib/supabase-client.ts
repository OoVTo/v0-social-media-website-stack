import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("❌ Missing Supabase environment variables:")
    console.error("  - NEXT_PUBLIC_SUPABASE_URL:", url ? "✅" : "❌ missing")
    console.error("  - NEXT_PUBLIC_SUPABASE_ANON_KEY:", key ? "✅" : "❌ missing")
    throw new Error("Supabase environment variables not configured")
  }

  console.log("✅ Supabase URL:", url?.split(".")[0] + "...")
  return createBrowserClient(url, key)
}

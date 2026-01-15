import bcrypt from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

let supabaseInstance: any = null

function getSupabase() {
  if (!supabaseInstance) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Supabase environment variables are not configured")
    }
    supabaseInstance = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }
  return supabaseInstance
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function registerUser(
  email: string,
  username: string,
  password: string,
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const supabase = getSupabase()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return { success: false, error: "Email already registered" }
    }

    // Check if username is taken
    const { data: existingUsername } = await supabase.from("users").select("id").eq("username", username).single()

    if (existingUsername) {
      return { success: false, error: "Username already taken" }
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          username,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, userId: data.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    const supabase = getSupabase()

    const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error || !user) {
      return { success: false, error: "Invalid email or password" }
    }

    const passwordMatch = await verifyPassword(password, user.password_hash)

    if (!passwordMatch) {
      return { success: false, error: "Invalid email or password" }
    }

    return { success: true, user: { id: user.id, email: user.email, username: user.username } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

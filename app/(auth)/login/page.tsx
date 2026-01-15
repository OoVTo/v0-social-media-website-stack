"use client"

export const dynamic = "force-dynamic"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { loginUser } from "@/lib/auth-utils"
import { Suspense } from "react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const successMessage = searchParams.get("success")
    if (successMessage) {
      setSuccess(successMessage)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)

    const result = await loginUser(formData.email, formData.password)

    if (result.success) {
      // Store user data in session
      sessionStorage.setItem("user", JSON.stringify(result.user))
      router.push("/home")
    } else {
      setError(result.error || "Login failed")
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">Stack.com</h1>
        <p className="text-muted-foreground">Welcome back</p>
      </div>

      {success && <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••"
            className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/register" className="text-primary hover:underline font-semibold">
          Sign up
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

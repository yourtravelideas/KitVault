"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Shield } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ displayName: "", email: "", password: "", confirmPassword: "" })

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return }
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { display_name: form.displayName },
      },
    })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <Shield className="h-12 w-12 text-slate-900 dark:text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.
            </p>
            <Button asChild variant="outline">
              <Link href="/login">Back to Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-900 dark:text-white font-bold text-2xl">
            <Shield className="h-7 w-7" />
            KitVault
          </Link>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Build, track and showcase your shirt collection</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Start building your digital vault</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Your Name</Label>
                <Input id="displayName" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} placeholder="John Collector" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" required autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="••••••••" required autoComplete="new-password" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-sm text-center">
            <p className="text-slate-500 dark:text-slate-400 w-full">
              Already have an account?{" "}
              <Link href="/login" className="text-slate-900 dark:text-white font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

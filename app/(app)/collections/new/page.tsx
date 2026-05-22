"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewCollectionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", description: "", is_public: false })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("Not authenticated"); setLoading(false); return }

    const { data, error: err } = await supabase
      .from("collections")
      .insert({ ...form, user_id: user.id })
      .select()
      .single()

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/collections/${data.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/collections"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Collection</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Create a new shirt collection</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collection Details</CardTitle>
          <CardDescription>Give your collection a name and description</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premier League Icons" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What's special about this collection?" rows={3} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">Public Collection</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Allow others to view this collection</p>
              </div>
              <Switch checked={form.is_public} onCheckedChange={v => setForm(f => ({ ...f, is_public: v }))} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/collections">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Collection"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

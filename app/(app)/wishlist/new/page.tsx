"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const SHIRT_TYPES = ["Home", "Away", "Third", "Goalkeeper", "Training", "Special"]
const PRIORITIES = ["Low", "Medium", "High", "Grail"]
const STATUSES = ["Searching", "Found", "Paused"]

export default function NewWishlistItemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    club: "", season: "", shirt_type: "", size: "", player_name: "",
    priority: "Medium", notes: "", status: "Searching",
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("Not authenticated"); setLoading(false); return }

    const { error: err } = await supabase.from("wishlist_items").insert({
      ...form,
      user_id: user.id,
      season: form.season || null,
      shirt_type: form.shirt_type || null,
      size: form.size || null,
      player_name: form.player_name || null,
      notes: form.notes || null,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push("/wishlist")
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/wishlist"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add to Wishlist</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track a shirt you're searching for</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Shirt Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Club *</Label>
                <Input value={form.club} onChange={e => set("club", e.target.value)} placeholder="e.g. Barcelona" required />
              </div>
              <div className="space-y-2">
                <Label>Season</Label>
                <Input value={form.season} onChange={e => set("season", e.target.value)} placeholder="e.g. 2004/05" />
              </div>
              <div className="space-y-2">
                <Label>Shirt Type</Label>
                <Select value={form.shirt_type} onValueChange={v => set("shirt_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Any type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any type</SelectItem>
                    {SHIRT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Size</Label>
                <Input value={form.size} onChange={e => set("size", e.target.value)} placeholder="e.g. L" />
              </div>
              <div className="space-y-2">
                <Label>Player Name</Label>
                <Input value={form.player_name} onChange={e => set("player_name", e.target.value)} placeholder="e.g. Ronaldinho" />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => set("priority", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any specific details about what you're looking for..." rows={3} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" asChild className="flex-1"><Link href="/wishlist">Cancel</Link></Button>
              <Button type="submit" disabled={loading} className="flex-1">{loading ? "Adding..." : "Add to Wishlist"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

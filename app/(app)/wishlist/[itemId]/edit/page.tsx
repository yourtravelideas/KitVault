"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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

export default function EditWishlistItemPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.itemId as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    club: "", season: "", shirt_type: "any", size: "", player_name: "",
    priority: "Medium", notes: "", status: "Searching",
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from("wishlist_items").select("*").eq("id", itemId).single()
      if (data) setForm({
        club: data.club || "",
        season: data.season || "",
        shirt_type: data.shirt_type || "any",
        size: data.size || "",
        player_name: data.player_name || "",
        priority: data.priority || "Medium",
        notes: data.notes || "",
        status: data.status || "Searching",
      })
      setLoading(false)
    }
    load()
  }, [itemId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { error: err } = await supabase.from("wishlist_items").update({
      ...form,
      season: form.season || null,
      shirt_type: form.shirt_type === "any" ? null : form.shirt_type,
      size: form.size || null,
      player_name: form.player_name || null,
      notes: form.notes || null,
      updated_at: new Date().toISOString(),
    }).eq("id", itemId)
    if (err) { setError(err.message); setSaving(false); return }
    router.push("/wishlist")
    router.refresh()
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/wishlist"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Wishlist Item</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Shirt Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Club *</Label><Input value={form.club} onChange={e => set("club", e.target.value)} required /></div>
              <div className="space-y-2"><Label>Season</Label><Input value={form.season} onChange={e => set("season", e.target.value)} /></div>
              <div className="space-y-2"><Label>Shirt Type</Label>
                <Select value={form.shirt_type} onValueChange={v => set("shirt_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Any type" /></SelectTrigger>
                  <SelectContent><SelectItem value="any">Any type</SelectItem>{SHIRT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Size</Label><Input value={form.size} onChange={e => set("size", e.target.value)} /></div>
              <div className="space-y-2"><Label>Player Name</Label><Input value={form.player_name} onChange={e => set("player_name", e.target.value)} /></div>
              <div className="space-y-2"><Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => set("priority", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} /></div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" asChild className="flex-1"><Link href="/wishlist">Cancel</Link></Button>
              <Button type="submit" disabled={saving} className="flex-1">{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

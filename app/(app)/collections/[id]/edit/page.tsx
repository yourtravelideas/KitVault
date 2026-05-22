"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditCollectionPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", description: "", is_public: false })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase.from("collections").select("*").eq("id", id).single()
      if (data) setForm({ name: data.name, description: data.description || "", is_public: data.is_public })
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    const supabase = createClient()
    const { error: err } = await supabase.from("collections").update({ ...form, updated_at: new Date().toISOString() }).eq("id", id)
    if (err) { setError(err.message); setSaving(false); return }
    router.push(`/collections/${id}`)
    router.refresh()
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="text-slate-500">Loading...</div></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/collections/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Collection</h1>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Collection Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
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
                <Link href={`/collections/${id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

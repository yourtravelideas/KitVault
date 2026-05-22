# KitVault — Online Staging Deployment Guide

Deploy KitVault to Supabase + GitHub + Vercel in about 20 minutes.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose an organisation, name the project (e.g. `kitvault-staging`), and set a strong database password. Save the password — you'll need it if you ever connect directly.
3. Wait for the project to finish provisioning (~2 minutes).

---

## 2. Run the schema

1. In the Supabase dashboard, open **SQL Editor** → **New query**
2. Paste the entire contents of `supabase/schema.sql` and click **Run**
3. Confirm no errors appear in the output panel.

> **Important:** Run `schema.sql` once on a fresh project. Never run it again on a project that already has data — use the migration files in `supabase/migrations/` for incremental changes.

---

## 3. Find your project URL and anon key

1. In the Supabase dashboard go to **Project Settings → API**
2. Copy:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **anon / public** key — the long JWT under "Project API keys"

Keep these handy for step 6.

---

## 4. Push the code to GitHub

```bash
# Create the repo on github.com first (no README), then:
git remote set-url origin https://github.com/<your-org>/KitVault.git
git push -u origin claude/clever-ptolemy-y9Lix
```

Or push `main` if you prefer to merge the branch first.

---

## 5. Import the repo into Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Connect your GitHub account if not already connected
3. Select the `KitVault` repository and click **Import**
4. Choose the correct branch (`claude/clever-ptolemy-y9Lix` or `main`)

---

## 6. Add environment variables in Vercel

In the Vercel project settings, go to **Settings → Environment Variables** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | your Project URL from step 3 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key from step 3 |

Set both variables for **Production**, **Preview**, and **Development** environments.

---

## 7. Set the build command

In **Settings → General → Build & Development Settings**, override the build command:

```
npm run typecheck && npm run build
```

Leave the output directory as `.next` (Vercel detects this automatically).

---

## 8. Configure Supabase Auth

Once Vercel has completed the first deployment, copy your deployment URL (e.g. `https://kitvault-abc123.vercel.app`).

In the Supabase dashboard go to **Authentication → URL Configuration**:

| Field | Value |
|-------|-------|
| **Site URL** | `https://kitvault-abc123.vercel.app` |
| **Redirect URLs** | `https://kitvault-abc123.vercel.app/auth/callback` |

Save changes. Without this, email confirmation links and OAuth redirects will fail.

---

## 9. Deploy

Trigger a deployment in Vercel (or push a commit). Watch the build log — typecheck runs first, then the Next.js build. 18 routes should compile successfully.

---

## 10. Online test checklist

Work through these in order after the first successful deploy:

- [ ] **Landing page** loads at the root URL with no errors
- [ ] **Sign up** — create a new account; confirm the success message or email arrives
- [ ] **Email confirmation** — click the link in the email; you should land on `/dashboard`
- [ ] **Log in** — sign in with the new account
- [ ] **Create a collection** — fill in name, save, verify it appears on `/collections`
- [ ] **Add a shirt** — fill all fields including currency (DKK default), save
- [ ] **Upload an image** — attach a photo to the shirt; confirm it displays
- [ ] **Edit the shirt** — change a field, save, verify the update persists
- [ ] **Delete an image** — remove an image; confirm it disappears and storage is cleaned up
- [ ] **Delete a shirt** — delete the shirt; confirm its images are also removed from storage
- [ ] **Delete a collection** — delete the collection; confirm shirts and images are gone
- [ ] **Wishlist** — add a wishlist item, edit it, delete it
- [ ] **Settings** — update display name and/or username
- [ ] **Log out** — confirm redirect to `/login`
- [ ] **Auth guard** — visit `/dashboard` while logged out; confirm redirect to `/login`

---

## Known risks before staging

| Ref | Description | Impact |
|-----|-------------|--------|
| M1 | `shirt-images` storage bucket is public — anyone with a direct URL can view an image | Low for staging; tighten before production if privacy is required |
| M3 | No password-update page — users cannot change their password from within the app | Workaround: Supabase dashboard or "forgot password" flow |
| M4/M5 | Storage upload/delete errors are partially swallowed — failures may not surface clearly to the user | Cosmetic for staging; add proper error UI before production |
| M6 | Dashboard totals mix currencies — estimated value is summed regardless of currency | Cosmetic for staging; add per-currency breakdown or conversion later |
| L4 | `lib/types.ts` and `lib/database.types.ts` overlap — some domain types are defined twice | Tech debt; no runtime impact |

# EnglishForge — Pre-Deployment Setup Checklist

> **How to use this doc**
> Every service below must be set up *before* you push to Vercel.
> ✅ = already exists from a previous project (reused)
> 🆕 = needs to be created fresh for this project
> ⚙️ = exists but needs extra config for this project

---

## 1. GitHub — Source Code Hosting 🆕

**Why:** Vercel deploys automatically every time you push to `main`.

### Steps
1. Go to https://github.com/new
2. Create repo: `EnglishOS` (or `englishforge`) — **Private**
3. Do **not** initialise with README (we already have code)
4. Run in terminal:
   ```
   git remote add origin https://github.com/rohinisd/EnglishOS.git
   git branch -M main
   git push -u origin main
   ```

### Env vars needed
None — just the GitHub URL when connecting to Vercel.

---

## 2. Supabase — Database + File Storage ✅ (reusing project `fbtzkroqqvufykinrklc`)

**Why:** PostgreSQL database (via Prisma) + file storage for student uploads.
**Dashboard:** https://supabase.com/dashboard/project/fbtzkroqqvufykinrklc

### ✅ Already done
- Database exists at `aws-1-ap-northeast-2.pooler.supabase.com`
- EnglishForge tables live in a **separate schema** (`englishforge`) — no conflict with GarageManage

### 🆕 Steps for this project

#### A. Get your API keys
1. Go to https://supabase.com/dashboard/project/fbtzkroqqvufykinrklc/settings/api
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ keep this secret)

#### B. Create Storage Buckets
1. Go to https://supabase.com/dashboard/project/fbtzkroqqvufykinrklc/storage/buckets
2. Click **New Bucket** → Name: `cursive-submissions` → **Private** ✓
3. Click **New Bucket** → Name: `speaking-submissions` → **Private** ✓

> Private buckets require a signed URL to access — the app generates these server-side.

### Env vars needed
```env
DATABASE_URL="postgresql://postgres.fbtzkroqqvufykinrklc:Dwdgarage123%24@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=englishforge"
DIRECT_URL="postgresql://postgres.fbtzkroqqvufykinrklc:Dwdgarage123%24@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?schema=englishforge"
NEXT_PUBLIC_SUPABASE_URL=https://fbtzkroqqvufykinrklc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste from dashboard>
SUPABASE_SERVICE_ROLE_KEY=<paste from dashboard>
SUPABASE_BUCKET_CURSIVE=cursive-submissions
SUPABASE_BUCKET_SPEAKING=speaking-submissions
```

---

## 3. Mux — Video Hosting 🆕

**Why:** All class videos are stored and streamed via Mux. Teachers upload directly to Mux, students get signed URLs.
**Dashboard:** https://dashboard.mux.com

### Steps
1. Create a free Mux account at https://dashboard.mux.com
2. Go to **Settings → API Access Tokens → Generate new token**
   - Permissions: **Mux Video (Full Access)** + **Mux Data (Read)**
   - Copy **Token ID** → `MUX_TOKEN_ID`
   - Copy **Token Secret** → `MUX_TOKEN_SECRET`
3. Go to **Settings → Signing Keys → Generate new key**
   - Copy **Key ID** → `MUX_SIGNING_KEY_ID`
   - Copy **Private Key** (the long base64 block) → `MUX_SIGNING_KEY_PRIVATE`
4. Go to **Settings → Webhooks → Add webhook**
   - URL: `https://your-domain.com/api/webhooks/mux`
   - Events: `video.asset.ready`, `video.asset.errored`
   - Copy **Signing Secret** → `MUX_WEBHOOK_SECRET`

### Env vars needed
```env
MUX_TOKEN_ID=<from step 2>
MUX_TOKEN_SECRET=<from step 2>
MUX_SIGNING_KEY_ID=<from step 3>
MUX_SIGNING_KEY_PRIVATE=<from step 3 — the full -----BEGIN RSA PRIVATE KEY----- block>
MUX_WEBHOOK_SECRET=<from step 4>
```

---

## 4. Razorpay — Payments ✅ (reusing live keys)

**Why:** Subscriptions and course fee payments.
**Dashboard:** https://dashboard.razorpay.com

### ✅ Already have
- Key ID: `rzp_live_SOO96XAcLt3Ick`
- Key Secret: `n0FiQ1csqVz51td1ZNwIHL5c`

### ⚙️ Still need to configure

#### Webhook URL
1. Go to https://dashboard.razorpay.com/app/webhooks
2. Click **Add new webhook**
3. URL: `https://your-domain.com/api/webhooks/razorpay`
4. Events: `payment.failed`, `payment.captured`, `subscription.activated`
5. Copy the **Webhook Secret** → `RAZORPAY_WEBHOOK_SECRET`

### Env vars needed
```env
RAZORPAY_KEY_ID=rzp_live_SOO96XAcLt3Ick
RAZORPAY_KEY_SECRET=n0FiQ1csqVz51td1ZNwIHL5c
RAZORPAY_WEBHOOK_SECRET=<from webhook setup>
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_SOO96XAcLt3Ick
```

---

## 5. Resend — Transactional Email ✅ (reusing key)

**Why:** Sends progress reports, payment receipts, and welcome emails.
**Dashboard:** https://resend.com/domains

### ✅ Already have
- API Key: `re_VDDyzaev_CFZawux6ji7vmTc29iP6dZGj`

### ⚙️ Still need to configure

#### Verify sending domain
1. Go to https://resend.com/domains → **Add domain**
2. Add `intelliforge.tech` (or `englishforge.intelliforge.tech`)
3. Add the DNS TXT/MX records Resend gives you in your domain registrar
4. Wait for verification ✓
5. Update `FROM_EMAIL` to match: `noreply@englishforge.intelliforge.tech`

> If you skip this, emails will not send from your domain. You can use Resend's sandbox (`onboarding@resend.dev`) for testing only.

### Env vars needed
```env
RESEND_API_KEY=re_VDDyzaev_CFZawux6ji7vmTc29iP6dZGj
FROM_EMAIL=noreply@englishforge.intelliforge.tech
```

---

## 6. Twilio — OTP via WhatsApp (Optional) ✅

**Why:** Sends the 4-digit OTP to students when they sign in. If not configured, OTP is printed to server console (fine for dev/small cohort).
**Dashboard:** https://console.twilio.com

### Steps (only if you want real WhatsApp OTP)
1. Log in to Twilio console
2. Get **Account SID** and **Auth Token** from dashboard home
3. Use the WhatsApp sandbox number or get a dedicated WhatsApp number
4. Update `TWILIO_WHATSAPP_FROM` with your sending number

### Env vars needed
```env
TWILIO_ACCOUNT_SID=<your SID>
TWILIO_AUTH_TOKEN=<your token>
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

> Leave all three **empty** to run in console-log OTP mode (no Twilio needed for testing).

---

## 7. Custom Domain — `englishforge.intelliforge.tech` ⚙️

**Why:** The app needs a real URL for production webhooks and email links.

### Steps
1. Deploy to Vercel first (step 9) — you'll get a `.vercel.app` URL
2. Go to your domain registrar (wherever `intelliforge.tech` is registered)
3. Add a CNAME record:
   - **Name:** `englishforge`
   - **Value:** `cname.vercel-dns.com`
4. In Vercel → Project Settings → Domains → Add `englishforge.intelliforge.tech`
5. Wait for DNS propagation (5 min – 24 hrs)
6. Update `NEXT_PUBLIC_APP_URL` to `https://englishforge.intelliforge.tech`

---

## 8. Vercel — Deployment 🆕

**Why:** Hosts the Next.js app, auto-deploys on git push.
**Dashboard:** https://vercel.com/dashboard

### Steps
1. Go to https://vercel.com/new
2. Click **Import Git Repository** → connect your GitHub → select `EnglishOS`
3. Framework: **Next.js** (auto-detected)
4. **Do not** change build settings
5. Click **Environment Variables** and paste every key from the "Complete env block" section below
6. Click **Deploy**

> First deploy will take ~3 minutes. After that, every `git push main` auto-deploys in ~60 seconds.

---

## 9. Post-Deploy Steps (after first successful deploy)

Do these **in order** after the Vercel URL is live:

### A. Run Prisma migrations on production
The schema was already pushed during development (`prisma db push`). Nothing to do here unless the schema changed — in that case run:
```
npx prisma db push
```
from your local machine (it connects to Supabase directly via `DIRECT_URL`).

### B. Seed the curriculum (once)
```
npm run seed
```
This populates the 20 sessions, quizzes, badges, and rubrics.

### C. Create your admin account (once)
Send this HTTP request to your live URL:
```
POST https://englishforge.intelliforge.tech/api/admin/seed-admin
Header: x-seed-secret: ef-seed-2026
Body (JSON):
{
  "phone": "9620010983",
  "name": "Rohini Devan",
  "role": "ADMIN"
}
```
You can do this with any REST client (Postman, curl, or even your browser's dev tools).

After this, sign in at `/sign-in` with your phone number to get an OTP.

### D. Update Mux + Razorpay webhook URLs
Replace `your-domain.com` with the real URL in:
- Mux dashboard → Webhooks
- Razorpay dashboard → Webhooks

---

## Complete Env Block for Vercel

Paste all of these into Vercel → Settings → Environment Variables.
**Never commit this file to git** (`.env.local` is already in `.gitignore`).

```env
# App
NEXT_PUBLIC_APP_URL=https://englishforge.intelliforge.tech
NEXT_PUBLIC_APP_NAME=EnglishForge
NODE_ENV=production

# Database (Supabase — englishforge schema)
DATABASE_URL=postgresql://postgres.fbtzkroqqvufykinrklc:Dwdgarage123%24@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=englishforge
DIRECT_URL=postgresql://postgres.fbtzkroqqvufykinrklc:Dwdgarage123%24@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?schema=englishforge

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://fbtzkroqqvufykinrklc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<PASTE>
SUPABASE_SERVICE_ROLE_KEY=<PASTE>
SUPABASE_BUCKET_CURSIVE=cursive-submissions
SUPABASE_BUCKET_SPEAKING=speaking-submissions

# Mux (Video)
MUX_TOKEN_ID=<PASTE>
MUX_TOKEN_SECRET=<PASTE>
MUX_SIGNING_KEY_ID=<PASTE>
MUX_SIGNING_KEY_PRIVATE=<PASTE — full RSA private key>
MUX_WEBHOOK_SECRET=<PASTE>

# Payments (Razorpay)
RAZORPAY_KEY_ID=rzp_live_SOO96XAcLt3Ick
RAZORPAY_KEY_SECRET=n0FiQ1csqVz51td1ZNwIHL5c
RAZORPAY_WEBHOOK_SECRET=<PASTE>
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_SOO96XAcLt3Ick

# Email (Resend)
RESEND_API_KEY=re_VDDyzaev_CFZawux6ji7vmTc29iP6dZGj
FROM_EMAIL=noreply@englishforge.intelliforge.tech

# WhatsApp OTP (Twilio — optional, leave empty to use console OTP)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# WhatsApp Notifications (AiSensy — optional)
AISENSY_API_KEY=

# Teacher / Support Info
NEXT_PUBLIC_TEACHER_NAME=Rohini Devan
NEXT_PUBLIC_TEACHER_PHONE=+919620010983
NEXT_PUBLIC_SUPPORT_EMAIL=support@englishforge.intelliforge.tech

# Course Config
COURSE_FEE_MONTHLY_PAISE=100000
COURSE_FEE_FULL_PAISE=180000
COURSE_TRIAL_DAYS=7
COURSE_GRACE_PERIOD_DAYS=3

# Feature Flags
FEATURE_AI_GRADING=false
FEATURE_LEADERBOARD=true
FEATURE_PARENT_PORTAL=true

# Admin seeder protection
SEED_SECRET=ef-seed-2026
```

---

## Summary: What to do RIGHT NOW

| # | Task | Where | Status |
|---|------|--------|--------|
| 1 | Create GitHub repo `EnglishOS` | github.com/new | 🆕 |
| 2 | Push code to GitHub | Terminal | 🆕 |
| 3 | Get Supabase ANON + SERVICE_ROLE keys | supabase dashboard | 🆕 |
| 4 | Create 2 Supabase storage buckets | supabase dashboard | 🆕 |
| 5 | Create Mux account + API token + signing key | dashboard.mux.com | 🆕 |
| 6 | Set up Razorpay webhook URL (after deploy) | razorpay dashboard | ⚙️ |
| 7 | Verify Resend domain `intelliforge.tech` | resend.com/domains | ⚙️ |
| 8 | Create Vercel project, connect GitHub, paste env vars | vercel.com/new | 🆕 |
| 9 | Add custom domain CNAME in domain registrar | your registrar | ⚙️ |
| 10 | Run `npm run seed` (curriculum) | Terminal after deploy | 🆕 |
| 11 | Seed admin account via POST request | curl / Postman | 🆕 |

---

## Reuse Template: Services Every Project Might Need

> Copy this section into any new project's `DEPLOY.md`

| Service | Purpose | Free Tier | URL |
|---------|---------|-----------|-----|
| **GitHub** | Source code + Vercel trigger | ✅ unlimited private repos | github.com |
| **Vercel** | Next.js hosting, auto-deploy | ✅ hobby plan | vercel.com |
| **Supabase** | PostgreSQL + Storage + Auth | ✅ 2 free projects, 500MB | supabase.com |
| **Neon** | Serverless PostgreSQL (alt to Supabase) | ✅ 512MB | neon.tech |
| **Clerk** | Auth with Google/social login | ✅ 10k MAU free | clerk.com |
| **Resend** | Transactional email | ✅ 3k emails/month free | resend.com |
| **Mux** | Video hosting + streaming | ❌ pay per use (~$0.015/min) | mux.com |
| **Twilio** | SMS / WhatsApp OTP | ❌ pay per message | twilio.com |
| **Razorpay** | Payments (India) | ✅ no setup fee | razorpay.com |
| **Stripe** | Payments (international) | ✅ no monthly fee | stripe.com |
| **AiSensy** | WhatsApp bulk / marketing | ❌ paid plans | aisensy.com |
| **Render** | Docker / background jobs | ✅ free tier (sleeps) | render.com |
| **Upstash** | Serverless Redis (queues) | ✅ 10k req/day free | upstash.com |
| **PlanetScale** | MySQL (branching, no Prisma migrations) | deprecated free tier | planetscale.com |

# 🚀 MedScopeGlobal Pre-Deployment Checklist

**Status**: Nearly ready for production  
**Current Issues**: Translation API keys missing  
**Last Validated**: May 26, 2026

---

## ✅ What's Already Configured

| Item | Status | Details |
|------|--------|---------|
| Supabase Connection | ✅ | xcydgqnivxfhprbmdyym project linked |
| Database Schema | ✅ | All tables created, including `article_translations` |
| Locale Configuration | ✅ | Default Czech (cs), auto-detection working |
| Stripe Keys | ✅ | Live keys set (payments enabled) |
| CRON Secret | ✅ | Random 64-char token for scheduled ingestion |
| Build Configuration | ✅ | Next.js 15.1.0, production optimizations enabled |
| Vercel Config | ✅ | Cron jobs, headers, environment setup |
| Admin Email | ✅ | dawe.zegzul@seznam.cz for notifications |

---

## 🔴 CRITICAL - Must Be Done Before Going Live

### 1. Add OpenAI API Key (Primary Translation Engine)

**What it does**: Translates medical articles to other languages using GPT-4o-mini (excellent medical terminology)

**How to get it**:
1. Go to https://platform.openai.com/account/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-...`)
4. Add to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
5. Or set in Vercel project settings: **Settings → Environment Variables**

**Cost**: ~$0.01-0.10 per medical article translation (pay-as-you-go)

**Alternative**: If OpenAI is unavailable, Google Translate will be used automatically

---

### 2. Add Google Translate API Key (Fallback Translation)

**What it does**: Automatic fallback if OpenAI API is unavailable or quota exceeded

**How to get it**:
1. Go to https://cloud.google.com/console
2. Create a new project (or use existing)
3. Enable **Cloud Translation API**
4. Create a **Service Account** and download JSON key
5. Extract `GOOGLE_TRANSLATE_KEY` from the JSON (the API key value)
6. Add to `.env.local`:
   ```env
   GOOGLE_TRANSLATE_KEY=AIzaSy...
   ```

**Cost**: Free tier includes 500,000 characters/month; ~$1 per 1M characters after that

**Why it's important**: Ensures articles are always translated even if primary service fails

---

## 📋 Production Deployment Steps

### Step 1: Fill Missing Environment Variables

```bash
# Check current status
npm run env:validate
```

Add the two translation keys to `.env.local`:
- `OPENAI_API_KEY=sk-...`
- `GOOGLE_TRANSLATE_KEY=AIzaSy...`

### Step 2: Verify Everything Works

```bash
# Full production validation
npm run production:validate
```

Should output: ✅ Production environment is ready!

### Step 3: Test Build

```bash
# On Windows:
npm run build:win

# On Linux/Mac:
npm run build
```

Should complete with ✓ Compiled successfully

### Step 4: Test Locally

```bash
npm start
```

Visit http://localhost:3000 and verify:
- [ ] Home page loads
- [ ] Locale switcher visible (top-right on desktop)
- [ ] Articles display correctly
- [ ] Can switch languages

### Step 5: Deploy to Vercel

Option A: **Git push** (if connected)
```bash
git push origin main
```

Option B: **Manual deployment**
```bash
vercel --prod
```

### Step 6: Post-Deployment Verification

Visit https://medscopeglobal.com and check:
- [ ] Home page loads (Czech by default)
- [ ] Locale switcher works
- [ ] Can change languages
- [ ] Articles visible
- [ ] Translation badge appears on translated articles
- [ ] Health check: https://medscopeglobal.com/api/health

---

## 🔧 Environment Variables Reference

### Supabase (Already Configured ✅)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xcydgqnivxfhprbmdyym.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_PROJECT_REF=xcydgqnivxfhprbmdyym
```

### Locale (Already Configured ✅)
```env
INGESTION_LOCALE=cs              # New articles ingested in Czech
DEFAULT_SITE_LOCALE=cs           # Homepage in Czech
NEXT_PUBLIC_SITE_URL=https://medscopeglobal.vercel.app
```

### Translation (🔴 NEEDS ACTION)
```env
OPENAI_API_KEY=sk-...            # Get from https://platform.openai.com
OPENAI_MODEL=gpt-4o-mini
GOOGLE_TRANSLATE_KEY=AIzaSy...   # Get from https://cloud.google.com
```

### Admin (Already Configured ✅)
```env
ADMIN_NOTIFY_EMAIL=dawe.zegzul@seznam.cz
CRON_SECRET=<your-cron-secret>
```

### Stripe (Already Configured ✅)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

---

## 📊 Production System Overview

```
┌─────────────────────────────────────────────┐
│        Browser (User's Device)              │
│  ┌─────────────────────────────────────┐    │
│  │ Accept-Language: de-DE              │    │
│  └─────────────────────────────────────┘    │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│   Next.js Server (medscopeglobal.com)       │
│  ┌─────────────────────────────────────┐    │
│  │ middleware.ts                       │    │
│  │ └─ Detect: de-DE → German (de)     │    │
│  │ └─ Set: medscope_locale=de          │    │
│  └─────────────────────────────────────┘    │
└──────────────┬──────────────────────────────┘
               │
               ▼
         ┌──────────────┐
         │   Supabase   │
         │  PostgreSQL  │
         │              │
         │ articles     │ (source locale: cs)
         │ article_     │ (cached translations)
         │ translations │
         └──────┬───────┘
                │
    ┌───────────┴──────────────┐
    ▼                          ▼
┌──────────────┐        ┌──────────────────┐
│ OpenAI API   │        │ Google Translate │
│ GPT-4o-mini  │        │ (fallback)       │
│ (medical AI) │        │                  │
└──────┬───────┘        └────────┬─────────┘
       │ Translate               │
       │ CS → DE                 │
       │                         │
       └────────────┬────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │ Translated Text  │
         │ + Provider Name  │
         │ (OpenAI/Google)  │
         └────────┬─────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │  Browser (German Version)   │
    │  ✓ Title in German          │
    │  ✓ Content in German        │
    │  ✓ Badge: "OpenAI"          │
    │  ✓ "Auto" to revert         │
    └─────────────────────────────┘
```

---

## 🆘 Troubleshooting

### Articles Not Translating?
1. Check OPENAI_API_KEY: `npm run env:validate`
2. Verify OpenAI billing: https://platform.openai.com/account/billing/overview
3. Check Supabase logs for translation errors
4. Fall back to Google Translate by setting `GOOGLE_TRANSLATE_KEY`

### Locale Not Persisting?
1. Check browser cookies: DevTools → Application → Cookies
2. Verify `medscope_locale` cookie is set
3. Check if HTTPS enabled (required for SameSite cookie)
4. Test with incognito window to bypass cache

### Build Fails on Windows?
1. Use workaround: `npm run build:win`
2. Or move project to `C:` drive (not synced folder)
3. Or enable Developer Mode in Windows Settings

---

## ✨ What Users Will Experience

### First-Time Visitor (German browser)
1. Page loads in German automatically
2. If articles in German exist, shows them
3. If articles only in Czech, shows translated version
4. Blue badge says "OpenAI" or "Google Translate"
5. Can click "Auto" to change or pick language manually

### Returning Visitor
1. Remembers language choice for 1 year
2. Sees language in top-right switcher
3. Can change anytime

### Admin
1. Can manage articles, categories, users in Czech
2. Interface also respects user's locale
3. Ingestion happens daily at 6 AM UTC

---

## 🎯 Success Criteria

After deployment, verify:
- ✅ Homepage loads instantly
- ✅ Locale detection works (test with browser language)
- ✅ Translation badge appears on non-Czech articles
- ✅ Language switcher works
- ✅ Articles display with medical terminology intact
- ✅ No 500 errors in server logs
- ✅ Response time < 2 seconds for homepage

---

## 📞 Support

If you need to add the API keys later:

**On Vercel**:
1. Go to vercel.com → medscopeglobal project
2. Settings → Environment Variables
3. Add `OPENAI_API_KEY` and `GOOGLE_TRANSLATE_KEY`
4. Redeploy

**Locally**:
1. Edit `.env.local`
2. Add the keys
3. Restart: `npm run dev`

---

**Next Action**: Get the two API keys and run `npm run production:validate` to confirm ✅

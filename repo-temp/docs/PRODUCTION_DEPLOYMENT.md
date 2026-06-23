# MedScopeGlobal Production Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Variables (`.env.production` or Vercel Settings)

**Required for locale/translation functionality:**
```env
# Translation Engines (both recommended for failover)
OPENAI_API_KEY=sk-...          # Primary: GPT-4o-mini
GOOGLE_TRANSLATE_KEY=AIzaSy... # Fallback: Google Translate API

# Locale Configuration
INGESTION_LOCALE=cs            # Default: Czech
DEFAULT_SITE_LOCALE=cs         # Default: Czech
```

**Must be set in production:**
```env
# Supabase (for data/auth)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Site URL (for canonical URLs and redirects)
NEXT_PUBLIC_SITE_URL=https://medscopeglobal.com

# Stripe (if using paid subscriptions)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Cron security
CRON_SECRET=...  # Generate with: openssl rand -hex 32

# Admin notifications
ADMIN_NOTIFY_EMAIL=your@email.com
```

### 2. Database Schema Verification

Run locally to verify Supabase is ready:
```bash
npm run db:verify
```

**Expected output:**
- ✓ All required tables exist
- ✓ `article_translations` table (for caching translations)
- Optional: Apply `supabase/MISSING_PRODUCTION_TABLES.sql` for ingestion tables

### 3. Build & Start

**On Windows (development machine):**
```bash
npm run build:win    # Uses workaround for EISDIR issue
npm start            # Test locally on http://localhost:3000
```

**On Linux/Mac/Production:**
```bash
npm run build
npm start
```

**With Vercel:**
- Set build command: `npm run build`
- Set start command: `npm start`
- Or use Vercel's default (auto-detected)

### 4. Deployment Platforms

#### Vercel (Recommended)
```bash
vercel --prod
```
- Automatically uses Next.js optimizations
- Sets `NEXT_PUBLIC_SITE_URL` automatically
- Supports automatic deployments from Git

#### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Traditional VPS/Node.js Server
```bash
# SSH to server
cd /var/www/medscopeglobal

# Clone repo
git clone https://github.com/your-org/medscopeglobal.git .

# Install & build
npm ci
npm run build

# Use process manager (PM2)
npm install -g pm2
pm2 start npm --name "medscopeglobal" -- start
pm2 save
pm2 startup
```

---

## 🌐 Locale & Translation System

### How It Works

1. **User lands on site (no cookies)**
   - Browser sends `Accept-Language` header (device OS language)
   - Middleware detects language and sets `medscope_locale` cookie
   - Page renders in user's device language

2. **Article translation**
   - If article isn't in user's language, it's automatically translated
   - Primary engine: OpenAI GPT-4o-mini (medical terminology)
   - Fallback: Google Translate API
   - Results cached in `article_translations` table

3. **Manual language selection**
   - User clicks locale switcher in top-right header
   - Sets language + region (for pricing)
   - Selection persists for 1 year

4. **Professional UI**
   - Translation badge shows provider (OpenAI or Google)
   - Blue info box indicates translated content
   - "Auto" button to revert to device language

### Translation Quality

**For best results:**
- Ensure `OPENAI_API_KEY` is set (higher quality)
- Have `GOOGLE_TRANSLATE_KEY` as fallback
- Medical terminology is preserved in both engines
- Cached translations improve over time as users view articles

### Supported Languages

- Czech (cs) - **Primary**
- English (en, en-US, en-UK)
- German (de)
- French (fr)
- Spanish (es)
- Italian (it)
- Portuguese (pt, pt-BR)
- Dutch (nl)
- Polish (pl)
- Hungarian (hu)
- Slovak (sk)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Hindi (hi)
- Arabic (ar)

---

## 🔍 Verification Steps

### 1. Locale Detection Works
```bash
# Test with different Accept-Language headers
curl -H "Accept-Language: de-DE" http://localhost:3000/
# Should see German content

curl -H "Accept-Language: cs-CZ" http://localhost:3000/
# Should see Czech content
```

### 2. Translation API Available
```bash
# Check if translation is working
curl http://localhost:3000/api/locale/detect
# Response: { "locale": "en", ... }
```

### 3. Database Connected
```bash
npm run db:verify
# All tables should show ✓
```

### 4. Build Size Check
After build, check `.next` size (should be < 200MB):
```bash
du -sh .next
```

---

## 📊 Monitoring

### Health Check Endpoint
```bash
curl https://medscopeglobal.com/api/health
```

### Key Metrics to Monitor
- **Locale detection errors** - Check server logs for locale parsing failures
- **Translation failures** - Monitor OpenAI & Google Translate API usage
- **Database schema** - Run `npm run db:verify` weekly
- **Build time** - Monitor for slow builds (should be < 120s)

### Example Monitoring Setup (PM2)
```bash
pm2 monit
pm2 logs medscopeglobal
```

---

## 🚀 Go-Live Checklist

- [ ] All env vars configured in production (see section 1)
- [ ] Database schema verified: `npm run db:verify`
- [ ] Local build tested: `npm run build:win && npm start`
- [ ] OPENAI_API_KEY or GOOGLE_TRANSLATE_KEY set (at least one)
- [ ] `NEXT_PUBLIC_SITE_URL` points to actual domain
- [ ] Stripe keys set to LIVE (not test/development)
- [ ] Supabase project is production (not dev)
- [ ] SSL certificate configured (HTTPS enabled)
- [ ] CDN/caching configured for static assets
- [ ] Monitoring/alerts configured
- [ ] Automated backups enabled (Supabase)
- [ ] Rate limiting configured for API endpoints
- [ ] CRON_SECRET is random and secure

---

## 🔧 Common Issues & Fixes

### "Could not find production build"
**Problem:** `.next` directory missing or corrupted
**Solution:**
```bash
npm run build:win  # On Windows
npm run build      # On Linux/Mac
```

### "Translation API not responding"
**Problem:** OpenAI or Google API key invalid
**Solution:**
```bash
# Check if key is set
echo $OPENAI_API_KEY
echo $GOOGLE_TRANSLATE_KEY

# Verify in Supabase logs
```

### "Locale cookie not persisting"
**Problem:** SameSite cookie issues or HTTPS not configured
**Solution:**
- Ensure HTTPS is enabled
- Check browser privacy settings
- Verify cookie domain matches NEXT_PUBLIC_SITE_URL

### "Articles showing original language instead of translation"
**Problem:** article_translations table missing or API quota exceeded
**Solution:**
```bash
npm run db:verify  # Verify schema
# Check OpenAI billing: https://platform.openai.com/account/billing/overview
```

---

## 📚 Additional Resources

- **Vercel Deployment**: https://vercel.com/docs/frameworks/nextjs
- **Supabase Production**: https://supabase.com/docs/guides/resources/best-practices
- **OpenAI API**: https://platform.openai.com/docs/guides/production-best-practices
- **Google Translate API**: https://cloud.google.com/translate/docs

---

## 🎯 Default Behavior (Meeting Requirements)

✅ **Primarily Czech**
- Default locale: Czech (cs)
- New users see Czech content first

✅ **Auto-translates for device language**
- Middleware detects `Accept-Language` header
- Articles auto-translated if not in user's language

✅ **Professional medical magazine**
- Medical terminology preserved in translations
- OpenAI (medical AI) as primary translation engine
- Translation provider badge shows quality source

✅ **Production-ready**
- Build works with Windows workaround
- Database schema verified
- Translation caching implemented
- Locale persistence working

---

**Last Updated:** May 26, 2026  
**Version:** 1.0 (Production Ready)

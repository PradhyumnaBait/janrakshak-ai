# Deployment Guide for JanRakshak AI

## Step 1: Push Code to GitHub

### First time pushing to GitHub?

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it: `janrakshak-ai`
   - Choose "Private" (recommended for security)
   - Click "Create repository"

2. **Connect your local repo to GitHub:**
   ```bash
   cd "c:\Users\Pradhyumna\Downloads\janrakshak ai\janrakshak ai"
   
   git remote add origin https://github.com/PradhyumnaBait/janrakshak-ai.git
   git branch -M main
   git push -u origin main
   ```
   
   Replace `YOUR_USERNAME` with your GitHub username.

3. **Verify on GitHub:**
   - Go to https://github.com/PradhyumnaBait/janrakshak-ai
   - You should see all your code there
   - `.env` file should NOT be visible (.gitignore protects it)

---

## Step 2: Deploy Frontend to Vercel

### ✅ Correct Setup for Vercel

**IMPORTANT: Root Directory must be set to `janrakshak-frontend`**

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign up with GitHub account
   - Click "New Project"

2. **Import GitHub Repository:**
   - Select "Continue with GitHub"
   - Find and select `janrakshak-ai`
   - Click "Import"

3. **Critical: Set Root Directory:**
   - **Root Directory:** Change to `janrakshak-frontend` ⚠️ (Default is `.`, change it!)
   - **Framework:** Next.js (auto-detected)
   - **Build Command:** Leave empty (uses default)
   - **Output Directory:** Leave empty (uses default)

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: (Leave empty for now, update after backend is deployed)
   - Add for both Production and Preview

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - You'll get a URL like: https://janrakshak-ai.vercel.app

### ❌ Common Errors & Fixes

**Error: "Command failed: `npm run build`"**
- Solution: Make sure Root Directory is set to `janrakshak-frontend`
- Go to Settings > General > Root Directory
- Change from `.` to `janrakshak-frontend`
- Redeploy

**Error: "No Production Deployment"**
- Solution: Make sure you set the root directory BEFORE deploying
- If already deployed, go to Redeploy in Deployments page after fixing root directory

---

## Step 3: Deploy Backend to Render.com (Free - Recommended)

### ✅ Render.com Step-by-Step

1. **Create Render Account:**
   - Visit https://render.com
   - Click "Sign up"
   - Click "Continue with GitHub"
   - Authorize GitHub access
   - Choose plan (Free tier is fine)

2. **Deploy Backend:**
   - In Render dashboard, click "New +"
   - Click "Web Service"
   - Click "Connect GitHub account" (if not already connected)
   - Find `janrakshak-ai` repo and click "Connect"

3. **Fill Service Details:**
   - **Name:** `janrakshak-ai-backend` 
   - **Environment:** `Python 3`
   - **Region:** Choose closest to you
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables:**
   - Scroll down to "Environment"
   - Click "Add Environment Variable"
   - Add each one (Click "+" to add more):
     ```
     DATABASE_URL = sqlite:///./civic_ai_shield.db
     JWT_SECRET_KEY = your-secret-key-here
     GEMINI_API_KEY = your-gemini-key-here
     CORS_ALLOW_ORIGINS = https://janrakshak-ai.vercel.app
     ```

5. **Deploy:**
   - Click "Create Web Service"
   - Go get coffee ☕ (5-10 min deploy time)
   - When done, you'll see a URL like: `https://janrakshak-ai-backend.onrender.com`
   - Copy this URL

6. **Update Frontend:**
   - Go to Vercel dashboard
   - Project > Settings > Environment Variables
   - Find `NEXT_PUBLIC_API_URL` and update value to your Render URL
   - Click "Save"
   - Deployments > Redeploy on main (or wait for auto-redeploy)

### ❌ Common Render Errors & Fixes

**Error: "Build failed"**
- Make sure `requirements.txt` exists in root directory
- Check Render logs (Logs tab) for exact error

**Error: "Service failed to start"**
- Check Start Command is: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Check all environment variables are set
- View logs to see exact error message

**Error: "Port binding error"**
- Make sure Start Command uses `$PORT` variable (Render assigns dynamic port)

---

### Option 2: Railway.app (Alternative)

1. **Go to Railway:**
   - Visit https://railway.app
   - Sign up with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Select & Deploy:**
   - Choose `janrakshak-ai` repository
   - Click "Deploy Now"

3. **Configure:**
   - Add environment variables (same as Render above)
   - Railway auto-detects Python

4. **Get URL & Update:**
   - Click on your service > Domain
   - Copy domain URL (e.g., https://janrakshak-ai-prod.up.railway.app)
   - Go to Vercel > Update `NEXT_PUBLIC_API_URL`

---

## Final Verification

After deployment, test these URLs:

✅ **Frontend:** https://janrakshak-ai.vercel.app
✅ **Backend API Docs:** https://your-backend-url/docs
✅ **Health Check:** https://your-backend-url/

Try these features:
1. Sign up and login
2. Test claim verification
3. Test misinformation shield
4. Test deepfake detection (if images work)

---

## Security Checklist

Before deploying to production:

- ✅ `.env` file is LOCAL ONLY (not on GitHub)
- ✅ Private/Sensitive values are in platform environment variables
- ✅ `CORS_ALLOW_ORIGINS` points to your Vercel domain
- ✅ API keys are stored securely (never in code)
- ✅ Use `https://` for all deployment URLs
- ✅ Database backups enabled (if using PostgreSQL)

---

## Troubleshooting

### Backend won't start?
- Check `Start Command` is correct
- Verify all environment variables are set
- Check logs in Render/Railway dashboard

### CORS errors on frontend?
- Update `CORS_ALLOW_ORIGINS` in backend environment
- Redeploy backend after changing

### Environment variables not working?
- Make sure you saved them in the platform dashboard
- Redeploy the service after adding variables
- Check spelling (case-sensitive)

---

## Cost Summary

| Service | Cost | Purpose |
|---------|------|---------|
| Vercel Frontend | Free | Host Next.js app |
| Render Backend | Free | Host FastAPI server |
| GitHub | Free | Version control |
| Gemini API | Free | AI responses (free tier) |
| **Total** | **$0/month** | Production deployment |

---

## Next Steps

1. ✅ Code is ready to push
2. 🔄 Create GitHub repo and push code
3. 🚀 Deploy frontend to Vercel
4. 🚀 Deploy backend to Render/Railway
5. ✨ Your app is live!

**Questions? Check the README.md or Vercel/Render.com documentation.**

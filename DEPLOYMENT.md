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

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign up with GitHub account
   - Click "New Project"

2. **Import GitHub Repository:**
   - Select "Continue with GitHub"
   - Find and select `janrakshak-ai`
   - Click "Import"

3. **Configure Build Settings:**
   - Framework: Next.js
   - Root Directory: `janrakshak-frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url`
   - (You'll update this after deploying backend)

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! (vercel gives you a URL like https://janrakshak-ai.vercel.app)

---

## Step 3: Deploy Backend to Render.com (Free)

### Option 1: Render.com (Easiest - $0/month)

1. **Go to Render:**
   - Visit https://render.com
   - Sign up with GitHub
   - Click "New +"
   - Select "Web Service"

2. **Connect GitHub:**
   - Select "Connect GitHub account"
   - Find `janrakshak-ai` repository
   - Click "Connect"

3. **Configure Service:**
   - **Name:** `janrakshak-ai-backend`
   - **Environment:** Python 3
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Build Command:** `pip install -r requirements.txt`

4. **Add Environment Variables:**
   ```
   DATABASE_URL = sqlite:///./civic_ai_shield.db
   JWT_SECRET_KEY = [generate-random-secret-key]
   GEMINI_API_KEY = [your-gemini-api-key]
   CORS_ALLOW_ORIGINS = https://janrakshak-ai.vercel.app
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - You'll get a URL like: https://janrakshak-ai-backend.onrender.com

6. **Update Vercel Environment:**
   - Go back to Vercel
   - Go to Settings > Environment Variables
   - Update: `NEXT_PUBLIC_API_URL` = `https://janrakshak-ai-backend.onrender.com`
   - Redeploy (Vercel > Deployments > Redeploy)

---

### Option 2: Railway.app (Also Free)

1. **Go to Railway:**
   - Visit https://railway.app
   - Sign up with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Select Repository:**
   - Choose `janrakshak-ai`
   - Click "Deploy Now"

3. **Configure:**
   - Add environment variables (same as above)
   - Railway will auto-detect Python and install requirements

4. **Get URL:**
   - Click on your service
   - Copy the domain URL
   - Update Vercel's `NEXT_PUBLIC_API_URL`

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

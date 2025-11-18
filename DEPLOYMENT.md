# Asset Manager V1 - Deployment Guide

## Deploying to Vercel

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy from project root**
```bash
cd /Users/dallas/AssetManager_V1
vercel
```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name: **asset-manager-v1**
   - Directory: **.**
   - Override settings? **N**

5. **Deploy to production**
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit - Asset Manager V1"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Import on Vercel**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Vercel will auto-detect the configuration

3. **Configure Build Settings** (should auto-detect from vercel.json):
   - Framework Preset: **Create React App**
   - Build Command: `npm run vercel-build`
   - Output Directory: `frontend/build`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Important Notes

#### Backend API Consideration

The current setup uses a Node.js/Express backend that runs on localhost:3001. For Vercel deployment, you have two options:

**Option A: Deploy Backend Separately (Recommended)**
1. Deploy backend to a serverless platform:
   - Vercel Serverless Functions
   - Railway.app
   - Render.com
   - Heroku

2. Update frontend API URL:
   - Edit `frontend/src/utils/api.js`
   - Change `API_BASE_URL` from `http://localhost:3001/api` to your deployed backend URL
   - Use environment variables: `process.env.REACT_APP_API_URL || 'http://localhost:3001/api'`

**Option B: Mock Data Only (Quick Demo)**
- Frontend-only deployment
- Uses mock/static data (no backend needed)
- Perfect for demos and prototypes
- Current setup with localStorage watchlist works perfectly

### Environment Variables

If using Option A, create a `.env.production` file:

```env
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
```

Add to Vercel dashboard:
- Settings → Environment Variables
- Add: `REACT_APP_API_URL` = `your-backend-url`

### Backend Deployment (Vercel Serverless)

To deploy the backend as serverless functions:

1. Create `api/` directory at project root
2. Move backend routes to serverless functions
3. Update `vercel.json` routes

Or use the simpler approach:

**Deploy Backend to Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
cd backend
railway init

# Deploy
railway up
```

### Post-Deployment Checklist

✅ Frontend deployed and accessible
✅ API endpoints configured (if using backend)
✅ Environment variables set
✅ Custom domain configured (optional)
✅ SSL certificate active (automatic with Vercel)
✅ Test all features:
   - Dashboard loads
   - Assets display
   - Scenarios work
   - Watchlist persists
   - Charts render

### Performance Optimization

Vercel automatically provides:
- Global CDN
- Automatic compression
- Image optimization
- Edge caching
- Automatic HTTPS

### Monitoring

Access analytics at:
- https://vercel.com/[your-username]/asset-manager-v1/analytics

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for propagation (5-10 minutes)

### Rollback

If needed, rollback to previous deployment:
```bash
vercel rollback
```

Or via dashboard:
- Deployments → Select previous deployment → Promote to Production

## Local Development

Always test locally before deploying:

```bash
# Backend
cd backend
npm install
npm start

# Frontend  
cd frontend
npm install
npm start
```

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions

## Current Status

✅ Application ready for deployment
✅ Build configuration complete
✅ Frontend optimized for production
✅ All features tested locally

**Next Step:** Run `vercel` from project root to deploy!


# Deploying Backend to Railway

## Quick Deploy Steps

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Deploy Backend
```bash
cd backend
railway init
railway up
```

### 4. Get Your Backend URL
```bash
railway domain
```

This will give you a URL like: `https://your-app.railway.app`

### 5. Update Frontend API URL

After backend is deployed, update the frontend to use the Railway URL:

**Option A: Environment Variable (Recommended)**
```bash
# In Vercel dashboard, add environment variable:
REACT_APP_API_URL=https://your-backend.railway.app/api
```

**Option B: Direct Update**
Edit `frontend/src/utils/api.js` and change:
```javascript
const API_BASE_URL = 'https://your-backend.railway.app/api';
```

### 6. Update CORS in Backend

Edit `backend/server.js` line 11 to include your Vercel frontend URL:
```javascript
? ['https://your-frontend.vercel.app', 'https://asset-manager-v1.vercel.app']
```

### 7. Deploy Frontend to Vercel
```bash
cd /Users/dallas/AssetManager_V1
vercel --prod
```

## Railway Configuration

The backend is configured with:
- **Start Command**: `node server.js`
- **Auto-restart**: On failure
- **Port**: Uses Railway's `PORT` environment variable
- **CSV Data**: Boyd Jones data included in deployment

## Environment Variables on Railway

If needed, set via CLI or dashboard:
```bash
railway variables set NODE_ENV=production
railway variables set CORS_ORIGINS=https://your-app.vercel.app
```

## Monitoring

View logs:
```bash
railway logs
```

Check status:
```bash
railway status
```

## Complete Deployment Flow

1. **Deploy Backend to Railway**
   ```bash
   cd backend
   railway up
   ```

2. **Get Railway URL**
   ```bash
   railway domain
   # Copy the URL (e.g., https://asset-manager-backend.railway.app)
   ```

3. **Deploy Frontend to Vercel**
   ```bash
   cd /Users/dallas/AssetManager_V1
   vercel
   ```

4. **Set Environment Variable in Vercel**
   - Go to Vercel dashboard → Your Project → Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://your-backend.railway.app/api`
   - Redeploy: `vercel --prod`

5. **Update Backend CORS**
   - Get your Vercel frontend URL
   - Update `backend/server.js` CORS origins
   - Redeploy backend: `railway up`

## Cost

- **Railway**: Free tier includes:
  - 500 hours/month
  - $5 credit
  - Perfect for this backend

- **Vercel**: Free tier includes:
  - Unlimited deployments
  - 100 GB bandwidth
  - Perfect for frontend

## Testing Deployed App

After deployment:
1. Visit your Vercel URL
2. Check browser console for API connection
3. Test all features (Dashboard, Assets, Scenarios)
4. Verify watchlist persistence
5. Test scenario calculations

## Troubleshooting

**CORS errors?**
- Make sure frontend URL is in backend CORS whitelist
- Check Railway logs: `railway logs`

**API not connecting?**
- Verify REACT_APP_API_URL is set in Vercel
- Check Railway backend is running: `railway status`
- Test API directly: `curl https://your-backend.railway.app/health`

**Build failures?**
- Check Railway build logs
- Verify package.json has correct dependencies
- Ensure Node version >=18

## Ready to Deploy!

Both platforms are free for this use case and take ~5 minutes total to deploy.


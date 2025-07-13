# 🚀 ThreatGuard Pro - Vercel Deployment Guide

## 📋 Prerequisites

Before deploying to Vercel, ensure you have:

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas Account** - For cloud database (free tier available)

## 🗄️ Step 1: Set Up MongoDB Atlas (Cloud Database)

Since Vercel is serverless, you need a cloud database:

1. **Create MongoDB Atlas Account**:
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Sign up for free account
   - Create a new cluster (free M0 tier)

2. **Configure Database**:
   - Create a database user with username/password
   - Add your IP address to whitelist (or use 0.0.0.0/0 for all IPs)
   - Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/threat_monitoring`)

## 📁 Step 2: Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Verify Files**:
   - ✅ `vercel.json` (updated with buildCommand)
   - ✅ `.npmrc` (created with legacy-peer-deps)
   - ✅ `.env` (created with environment variables)
   - ✅ `next.config.js` (updated with transpilePackages)
   - ✅ `package.json` (verified)

## 🛠️ Step 3: Important Configuration Changes

### Dependency Conflict Resolution

The project uses React 18.2.0 but react-leaflet 5.0.0 requires React 19.0.0. We've made the following changes to fix this:

1. **Added `.npmrc` file**:
   ```
   legacy-peer-deps=true
   strict-peer-dependencies=false
   engine-strict=false
   ```

2. **Updated `vercel.json` with custom build command**:
   ```json
   "buildCommand": "npm install --legacy-peer-deps && npm run build"
   ```

3. **Updated `next.config.js` to transpile problematic packages**:
   ```javascript
   transpilePackages: ['react-leaflet', '@react-leaflet/core']
   ```

4. **Modified API rewrites for production**:
   ```javascript
   async rewrites() {
     const isProd = process.env.NODE_ENV === 'production';
     return [
       {
         source: '/api/backend/:path*',
         destination: isProd ? '/api/:path*' : 'http://localhost:5000/api/:path*',
       },
     ];
   }
   ```

## 🌐 Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select "ThreatGuard Pro" repository

2. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: Will use the custom command from vercel.json
   - **Output Directory**: `.next` (auto-detected)

3. **Environment Variables**:
   Click "Environment Variables" and add:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/threat_monitoring
   JWT_SECRET=your_super_secure_jwt_secret_here
   JWT_REFRESH_SECRET=your_super_secure_refresh_secret_here
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=/api
   NEXT_PUBLIC_SOCKET_URL=
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (2-5 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Set environment variables when prompted

## ⚙️ Step 5: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | `random-secure-string` | JWT signing secret (generate strong) |
| `JWT_REFRESH_SECRET` | `another-random-string` | JWT refresh token secret |
| `NODE_ENV` | `production` | Environment mode |
| `NEXT_PUBLIC_API_URL` | `/api` | API base URL (relative path) |
| `NEXT_PUBLIC_SOCKET_URL` | `` | WebSocket URL (empty for same domain) |

## 🔐 Step 6: Generate Secure Secrets

Generate strong JWT secrets:

```bash
# Generate JWT secrets (run these commands)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use the output for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

## 🌍 Step 7: Custom Domain (Optional)

1. **Add Domain**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **Update Environment Variables**:
   - No need to update API_URL as we're using relative paths
   - Update `NEXT_PUBLIC_SOCKET_URL` if using WebSockets

## 🔄 Step 8: Automatic Deployments

Vercel automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update application"
git push origin main
```

## 📊 Step 9: Monitor Deployment

1. **Check Deployment Status**:
   - Vercel Dashboard → Your Project → Deployments
   - View build logs for any errors

2. **Test Your Application**:
   - Visit your Vercel URL
   - Test login/registration
   - Verify all features work

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails with Dependency Conflicts**:
   - Check if the `.npmrc` file is properly created
   - Verify `vercel.json` has the correct buildCommand
   - Try updating the package versions in package.json

2. **React Leaflet Issues**:
   - Ensure `next.config.js` has the transpilePackages configuration
   - Check browser console for any React version mismatch errors

3. **Database Connection Issues**:
   - Verify MongoDB Atlas connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

4. **Environment Variables**:
   - Verify all required env vars are set
   - Check for typos in variable names
   - Redeploy after adding new variables

5. **API Routes Not Working**:
   - Check Vercel function logs
   - Verify API routes are in `app/api/` directory
   - Check for serverless function timeouts

## 📱 Step 10: Test Your Deployed App

Visit your Vercel URL and test:

- ✅ Landing page loads correctly
- ✅ Registration/login works
- ✅ Dashboard is accessible
- ✅ API endpoints respond
- ✅ Maps with React Leaflet render properly
- ✅ Real-time features work

## 🎉 Congratulations!

Your ThreatGuard Pro application is now live on Vercel! 

**Your app URL**: `https://your-app-name.vercel.app`

## 📞 Support

If you encounter issues:
1. Check Vercel documentation
2. Review build logs in Vercel dashboard
3. Verify environment variables
4. Test locally first with `npm run build && npm start`

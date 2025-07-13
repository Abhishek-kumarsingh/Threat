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
   - ✅ `vercel.json` (created)
   - ✅ `.env.example` (created)
   - ✅ `package.json` (updated)

## 🌐 Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select "ThreatGuard Pro" repository

2. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

3. **Environment Variables**:
   Click "Environment Variables" and add:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/threat_monitoring
   JWT_SECRET=your_super_secure_jwt_secret_here
   JWT_REFRESH_SECRET=your_super_secure_refresh_secret_here
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app/api
   NEXT_PUBLIC_SOCKET_URL=https://your-app-name.vercel.app
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

## ⚙️ Step 4: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | `random-secure-string` | JWT signing secret (generate strong) |
| `JWT_REFRESH_SECRET` | `another-random-string` | JWT refresh token secret |
| `NODE_ENV` | `production` | Environment mode |
| `NEXT_PUBLIC_API_URL` | `https://your-app.vercel.app/api` | API base URL |
| `NEXT_PUBLIC_SOCKET_URL` | `https://your-app.vercel.app` | WebSocket URL |

## 🔐 Step 5: Generate Secure Secrets

Generate strong JWT secrets:

```bash
# Generate JWT secrets (run these commands)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use the output for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

## 🌍 Step 6: Custom Domain (Optional)

1. **Add Domain**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **Update Environment Variables**:
   - Update `NEXT_PUBLIC_API_URL` to use your domain
   - Update `NEXT_PUBLIC_SOCKET_URL` to use your domain

## 🔄 Step 7: Automatic Deployments

Vercel automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update application"
git push origin main
```

## 📊 Step 8: Monitor Deployment

1. **Check Deployment Status**:
   - Vercel Dashboard → Your Project → Deployments
   - View build logs for any errors

2. **Test Your Application**:
   - Visit your Vercel URL
   - Test login/registration
   - Verify all features work

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript errors are fixed

2. **Database Connection Issues**:
   - Verify MongoDB Atlas connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

3. **Environment Variables**:
   - Verify all required env vars are set
   - Check for typos in variable names
   - Redeploy after adding new variables

4. **API Routes Not Working**:
   - Check Vercel function logs
   - Verify API routes are in `app/api/` directory
   - Check for serverless function timeouts

## 📱 Step 9: Test Your Deployed App

Visit your Vercel URL and test:

- ✅ Landing page loads correctly
- ✅ Registration/login works
- ✅ Dashboard is accessible
- ✅ API endpoints respond
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

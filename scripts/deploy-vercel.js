#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ThreatGuard Pro - Vercel Deployment Helper\n');

// Check if we're in a git repository
try {
  execSync('git status', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Error: Not in a git repository. Please initialize git first:');
  console.log('   git init');
  console.log('   git add .');
  console.log('   git commit -m "Initial commit"');
  process.exit(1);
}

// Check if .env.local exists and warn about environment variables
if (fs.existsSync('.env.local')) {
  console.log('⚠️  Warning: .env.local found. Remember to set environment variables in Vercel dashboard!');
  console.log('   Required variables:');
  console.log('   - MONGODB_URI');
  console.log('   - JWT_SECRET');
  console.log('   - JWT_REFRESH_SECRET');
  console.log('   - NODE_ENV=production');
  console.log('   - NEXT_PUBLIC_API_URL');
  console.log('   - NEXT_PUBLIC_SOCKET_URL\n');
}

// Check if vercel.json exists
if (!fs.existsSync('vercel.json')) {
  console.error('❌ Error: vercel.json not found. Please run this script from the project root.');
  process.exit(1);
}

console.log('✅ Pre-deployment checks passed!\n');

// Build the project locally to check for errors
console.log('🔨 Building project locally...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Local build successful!\n');
} catch (error) {
  console.error('❌ Build failed. Please fix errors before deploying.');
  process.exit(1);
}

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.log('📦 Installing Vercel CLI...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
  } catch (installError) {
    console.error('❌ Failed to install Vercel CLI. Please install manually:');
    console.log('   npm install -g vercel');
    process.exit(1);
  }
}

console.log('🌐 Ready to deploy to Vercel!');
console.log('\nNext steps:');
console.log('1. Run: vercel login');
console.log('2. Run: vercel');
console.log('3. Follow the prompts');
console.log('4. Set environment variables in Vercel dashboard');
console.log('\nOr deploy via GitHub:');
console.log('1. Push to GitHub: git push origin main');
console.log('2. Connect repository in Vercel dashboard');
console.log('3. Configure environment variables');
console.log('4. Deploy!');

console.log('\n📖 See VERCEL-DEPLOYMENT.md for detailed instructions.');

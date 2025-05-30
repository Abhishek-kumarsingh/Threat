#!/usr/bin/env node

/**
 * Setup script for Threat Monitoring System Frontend
 * This script helps set up the development environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkNodeVersion() {
  log('🔍 Checking Node.js version...', 'blue');
  
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    log('❌ Node.js version 18 or higher is required', 'red');
    log(`Current version: ${nodeVersion}`, 'yellow');
    process.exit(1);
  }
  
  log(`✅ Node.js version ${nodeVersion} is compatible`, 'green');
}

function checkPackageManager() {
  log('🔍 Checking package manager...', 'blue');
  
  try {
    execSync('npm --version', { stdio: 'ignore' });
    log('✅ npm is available', 'green');
    return 'npm';
  } catch (error) {
    log('❌ npm is not available', 'red');
    process.exit(1);
  }
}

function installDependencies(packageManager) {
  log('📦 Installing dependencies...', 'blue');
  
  try {
    if (packageManager === 'npm') {
      execSync('npm install', { stdio: 'inherit' });
    } else {
      execSync('yarn install', { stdio: 'inherit' });
    }
    log('✅ Dependencies installed successfully', 'green');
  } catch (error) {
    log('❌ Failed to install dependencies', 'red');
    process.exit(1);
  }
}

function setupEnvironment() {
  log('⚙️ Setting up environment...', 'blue');
  
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.local.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log('✅ Created .env.local from example', 'green');
    } else {
      // Create basic .env.local
      const envContent = `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
`;
      fs.writeFileSync(envPath, envContent);
      log('✅ Created basic .env.local file', 'green');
    }
  } else {
    log('✅ .env.local already exists', 'green');
  }
}

function createDirectories() {
  log('📁 Creating necessary directories...', 'blue');
  
  const directories = [
    'public/icons',
    'public/images',
    'src/types',
    'src/lib',
    'docs',
    'tests',
  ];
  
  directories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`✅ Created directory: ${dir}`, 'green');
    }
  });
}

function generateSecrets() {
  log('🔐 Generating secrets...', 'blue');
  
  const crypto = require('crypto');
  const secret = crypto.randomBytes(32).toString('hex');
  
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('your-secret-key-here')) {
    envContent = envContent.replace('your-secret-key-here', secret);
    fs.writeFileSync(envPath, envContent);
    log('✅ Generated NEXTAUTH_SECRET', 'green');
  }
}

function checkPorts() {
  log('🔌 Checking port availability...', 'blue');
  
  const net = require('net');
  
  function checkPort(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      server.on('error', () => resolve(false));
    });
  }
  
  Promise.all([
    checkPort(3000),
    checkPort(3001)
  ]).then(([frontendAvailable, backendAvailable]) => {
    if (frontendAvailable) {
      log('✅ Port 3000 is available for frontend', 'green');
    } else {
      log('⚠️ Port 3000 is in use', 'yellow');
    }
    
    if (backendAvailable) {
      log('✅ Port 3001 is available for backend', 'green');
    } else {
      log('⚠️ Port 3001 is in use (backend may be running)', 'yellow');
    }
  });
}

function displayNextSteps() {
  log('\n🎉 Setup completed successfully!', 'green');
  log('\n📋 Next steps:', 'bright');
  log('1. Start the development server:', 'cyan');
  log('   npm run dev', 'yellow');
  log('\n2. Open your browser and navigate to:', 'cyan');
  log('   http://localhost:3000', 'yellow');
  log('\n3. Make sure your backend API is running on:', 'cyan');
  log('   http://localhost:3001', 'yellow');
  log('\n4. Use these demo credentials to login:', 'cyan');
  log('   Admin: admin@example.com / admin123', 'yellow');
  log('   User: user@example.com / user123', 'yellow');
  log('\n5. Check the README.md for more information', 'cyan');
  log('\n📚 Documentation:', 'bright');
  log('- API Design: api-design.md', 'cyan');
  log('- Frontend-API Mapping: frontend-api-mapping.md', 'cyan');
  log('- README: README.md', 'cyan');
}

function main() {
  log('🚀 Setting up Threat Monitoring System Frontend...', 'bright');
  log('================================================\n', 'bright');
  
  try {
    checkNodeVersion();
    const packageManager = checkPackageManager();
    installDependencies(packageManager);
    setupEnvironment();
    createDirectories();
    generateSecrets();
    checkPorts();
    displayNextSteps();
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  checkNodeVersion,
  checkPackageManager,
  installDependencies,
  setupEnvironment,
  createDirectories,
  generateSecrets,
  checkPorts,
  displayNextSteps,
};

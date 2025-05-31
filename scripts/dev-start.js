#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Threat Zone Monitoring System Development Environment...\n');

// Check if backend directory exists
const backendPath = path.join(__dirname, '..', 'backend');
if (!fs.existsSync(backendPath)) {
  console.error('❌ Backend directory not found!');
  console.log('Please ensure the backend folder is in the project root.');
  process.exit(1);
}

// Check if backend dependencies are installed
const backendNodeModules = path.join(backendPath, 'node_modules');
if (!fs.existsSync(backendNodeModules)) {
  console.log('📦 Installing backend dependencies...');
  const backendInstall = spawn('npm', ['install'], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true
  });

  backendInstall.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Failed to install backend dependencies');
      process.exit(1);
    }
    startServices();
  });
} else {
  startServices();
}

function startServices() {
  console.log('🔧 Starting services...\n');

  // Start backend server
  console.log('🖥️  Starting Backend Server (Port 5000)...');
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: backendPath,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });

  backend.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  backend.stderr.on('data', (data) => {
    console.error(`[Backend Error] ${data.toString().trim()}`);
  });

  // Wait a bit for backend to start, then start frontend
  setTimeout(() => {
    console.log('🌐 Starting Frontend Server (Port 3000)...');
    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });

    frontend.stdout.on('data', (data) => {
      console.log(`[Frontend] ${data.toString().trim()}`);
    });

    frontend.stderr.on('data', (data) => {
      console.error(`[Frontend Error] ${data.toString().trim()}`);
    });

    frontend.on('close', (code) => {
      console.log(`Frontend process exited with code ${code}`);
      backend.kill();
    });
  }, 3000);

  backend.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    process.exit(code);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down services...');
    backend.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down services...');
    backend.kill();
    process.exit(0);
  });

  console.log('\n✅ Development environment started!');
  console.log('📱 Frontend: http://localhost:3000');
  console.log('🔧 Backend API: http://localhost:5000/api');
  console.log('📊 WebSocket: http://localhost:5000');
  console.log('\nPress Ctrl+C to stop all services\n');
}

#!/usr/bin/env node

/**
 * Startup script for the complete Threat Monitoring System with ML Model
 * This script starts all services in the correct order
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Threat Monitoring System with ML Model...\n');

// Configuration
const config = {
    mongodb: {
        port: 27017,
        name: 'MongoDB'
    },
    mlModel: {
        port: 5001,
        name: 'ML Model Service',
        path: './model',
        script: 'app.py'
    },
    backend: {
        port: 5000,
        name: 'Backend API',
        path: './backend',
        script: 'server.js'
    },
    frontend: {
        port: 3000,
        name: 'Frontend (Next.js)',
        path: './',
        script: 'npm run dev'
    }
};

// Track running processes
const processes = new Map();

// Utility functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function checkPort(port) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        
        server.listen(port, () => {
            server.once('close', () => resolve(false));
            server.close();
        });
        
        server.on('error', () => resolve(true));
    });
}

async function waitForPort(port, serviceName, maxWait = 60000) {
    console.log(`⏳ Waiting for ${serviceName} on port ${port}...`);
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
        const isPortInUse = await checkPort(port);
        if (isPortInUse) {
            console.log(`✅ ${serviceName} is ready on port ${port}`);
            return true;
        }
        await sleep(2000);
    }
    
    console.log(`❌ ${serviceName} failed to start within ${maxWait/1000} seconds`);
    return false;
}

function startService(serviceName, command, args, cwd) {
    return new Promise((resolve, reject) => {
        console.log(`🔄 Starting ${serviceName}...`);
        
        const process = spawn(command, args, {
            cwd: cwd,
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });
        
        processes.set(serviceName, process);
        
        process.stdout.on('data', (data) => {
            console.log(`[${serviceName}] ${data.toString().trim()}`);
        });
        
        process.stderr.on('data', (data) => {
            console.error(`[${serviceName}] ${data.toString().trim()}`);
        });
        
        process.on('close', (code) => {
            if (code !== 0) {
                console.error(`❌ ${serviceName} exited with code ${code}`);
                reject(new Error(`${serviceName} failed to start`));
            } else {
                console.log(`✅ ${serviceName} started successfully`);
                resolve();
            }
        });
        
        // Give the process a moment to start
        setTimeout(() => resolve(), 2000);
    });
}

async function checkMongoDB() {
    console.log('🔍 Checking MongoDB...');
    try {
        const isRunning = await checkPort(config.mongodb.port);
        if (!isRunning) {
            console.log('❌ MongoDB is not running. Please start MongoDB first.');
            console.log('   Run: mongod --dbpath /path/to/your/db');
            process.exit(1);
        }
        console.log('✅ MongoDB is running');
    } catch (error) {
        console.error('❌ Error checking MongoDB:', error.message);
        process.exit(1);
    }
}

async function startMLModel() {
    console.log('\n📊 Starting ML Model Service...');
    
    // Check if Python is available
    try {
        await new Promise((resolve, reject) => {
            exec('python --version', (error, stdout, stderr) => {
                if (error) {
                    reject(new Error('Python not found. Please install Python 3.8+'));
                } else {
                    console.log(`✅ Python found: ${stdout.trim()}`);
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error('❌', error.message);
        process.exit(1);
    }
    
    // Install Python dependencies if needed
    const requirementsPath = path.join(config.mlModel.path, 'requirements.txt');
    if (fs.existsSync(requirementsPath)) {
        console.log('📦 Installing Python dependencies...');
        await new Promise((resolve) => {
            exec('pip install -r requirements.txt', { cwd: config.mlModel.path }, (error, stdout, stderr) => {
                if (error) {
                    console.log('⚠️  Warning: Could not install some dependencies. Service may still work.');
                }
                resolve();
            });
        });
    }
    
    // Start ML model service
    await startService(
        config.mlModel.name,
        'python',
        [config.mlModel.script],
        config.mlModel.path
    );
    
    // Wait for ML model to be ready
    await waitForPort(config.mlModel.port, config.mlModel.name);
}

async function startBackend() {
    console.log('\n🔧 Starting Backend API...');
    
    // Install Node.js dependencies if needed
    const packageJsonPath = path.join(config.backend.path, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const nodeModulesPath = path.join(config.backend.path, 'node_modules');
        if (!fs.existsSync(nodeModulesPath)) {
            console.log('📦 Installing Node.js dependencies...');
            await new Promise((resolve) => {
                exec('npm install', { cwd: config.backend.path }, (error, stdout, stderr) => {
                    if (error) {
                        console.log('⚠️  Warning: Could not install some dependencies.');
                    }
                    resolve();
                });
            });
        }
    }
    
    // Start backend service
    await startService(
        config.backend.name,
        'node',
        [config.backend.script],
        config.backend.path
    );
    
    // Wait for backend to be ready
    await waitForPort(config.backend.port, config.backend.name);
}

async function startFrontend() {
    console.log('\n🎨 Starting Frontend...');
    
    // Install Node.js dependencies if needed
    const nodeModulesPath = path.join(config.frontend.path, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        console.log('📦 Installing Node.js dependencies...');
        await new Promise((resolve) => {
            exec('npm install', { cwd: config.frontend.path }, (error, stdout, stderr) => {
                if (error) {
                    console.log('⚠️  Warning: Could not install some dependencies.');
                }
                resolve();
            });
        });
    }
    
    // Start frontend service
    await startService(
        config.frontend.name,
        'npm',
        ['run', 'dev'],
        config.frontend.path
    );
    
    // Wait for frontend to be ready
    await waitForPort(config.frontend.port, config.frontend.name);
}

// Cleanup function
function cleanup() {
    console.log('\n🛑 Shutting down services...');
    
    processes.forEach((process, name) => {
        console.log(`   Stopping ${name}...`);
        process.kill('SIGTERM');
    });
    
    setTimeout(() => {
        processes.forEach((process, name) => {
            if (!process.killed) {
                console.log(`   Force killing ${name}...`);
                process.kill('SIGKILL');
            }
        });
        process.exit(0);
    }, 5000);
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Main execution
async function main() {
    try {
        // Check prerequisites
        await checkMongoDB();
        
        // Start services in order
        await startMLModel();
        await startBackend();
        await startFrontend();
        
        console.log('\n🎉 All services started successfully!');
        console.log('\n📋 Service URLs:');
        console.log(`   Frontend:  http://localhost:${config.frontend.port}`);
        console.log(`   Backend:   http://localhost:${config.backend.port}`);
        console.log(`   ML Model:  http://localhost:${config.mlModel.port}`);
        console.log(`   MongoDB:   mongodb://localhost:${config.mongodb.port}`);
        console.log('\n🔗 Quick Links:');
        console.log(`   Dashboard: http://localhost:${config.frontend.port}/dashboard`);
        console.log(`   Test Page: http://localhost:${config.frontend.port}/test`);
        console.log(`   API Docs:  http://localhost:${config.backend.port}/api`);
        console.log('\n✨ System is ready for use!');
        
    } catch (error) {
        console.error('\n❌ Failed to start system:', error.message);
        cleanup();
        process.exit(1);
    }
}

// Start the system
main();

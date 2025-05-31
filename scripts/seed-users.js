const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/threat_monitor';

const seedUsers = [
  {
    email: 'admin@threatguard.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin'],
    isActive: true
  },
  {
    email: 'operator@threatguard.com',
    password: 'operator123',
    name: 'Operator User',
    role: 'operator',
    permissions: ['read', 'write'],
    isActive: true
  },
  {
    email: 'user@threatguard.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user',
    permissions: ['read'],
    isActive: true
  }
];

async function seedDatabase() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('threat_monitor');
    const usersCollection = db.collection('users');
    
    console.log('🗑️  Clearing existing users...');
    await usersCollection.deleteMany({});
    
    console.log('🔐 Hashing passwords and creating users...');
    
    for (const userData of seedUsers) {
      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user document
      const user = {
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await usersCollection.insertOne(user);
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }
    
    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@threatguard.com / admin123');
    console.log('Operator: operator@threatguard.com / operator123');
    console.log('User: user@threatguard.com / user123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the seed function
seedDatabase();

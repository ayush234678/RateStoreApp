/**
 * Database Seeder
 * Run: node seed.js
 * Make sure MySQL is running and .env is configured.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const users = [
  {
    name: 'System Administrator User',
    email: 'admin@storerating.com',
    password: 'Admin@1234',
    address: '123 Admin Boulevard, Admin City, AC 00001',
    role: 'admin',
  },
  {
    name: 'John Michael Thompson',
    email: 'john.thompson@example.com',
    password: 'User@12345',
    address: '456 Oak Street, Springfield, IL 62701',
    role: 'user',
  },
  {
    name: 'Sarah Elizabeth Johnson',
    email: 'sarah.johnson@example.com',
    password: 'User@12345',
    address: '789 Maple Avenue, Chicago, IL 60601',
    role: 'user',
  },
  {
    name: 'Robert James Wilson Owner',
    email: 'owner1@storerating.com',
    password: 'Owner@1234',
    address: '321 Commerce Drive, Business Park, BP 10001',
    role: 'store_owner',
  },
  {
    name: 'Emily Catherine Davis Store',
    email: 'owner2@storerating.com',
    password: 'Owner@1234',
    address: '654 Market Street, Downtown, DT 20002',
    role: 'store_owner',
  },
];

const stores = [
  {
    name: 'Fresh Harvest Organic Market',
    email: 'fresh.harvest@stores.com',
    address: '100 Green Way, Organic District, OD 30001',
    ownerEmail: 'owner1@storerating.com',
  },
  {
    name: 'TechZone Electronics Megastore',
    email: 'techzone.electronics@stores.com',
    address: '200 Silicon Blvd, Tech Hub, TH 40002',
    ownerEmail: 'owner2@storerating.com',
  },
  {
    name: 'Classic Books and Coffee Corner',
    email: 'classic.books@stores.com',
    address: '300 Literary Lane, Culture Quarter, CQ 50003',
    ownerEmail: null,
  },
];

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'store_rating_db',
  });

  console.log('✅ Connected to database\n');

  try {
    // Clear existing data
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE ratings');
    await connection.execute('TRUNCATE TABLE stores');
    await connection.execute('TRUNCATE TABLE users');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🧹 Cleared existing data\n');

    // Insert users
    const userIds = {};
    for (const user of users) {
      const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [user.name, user.email, hash, user.address, user.role],
      );
      userIds[user.email] = result.insertId;
      console.log(`👤 Created ${user.role}: ${user.name} <${user.email}>`);
    }

    // Insert stores
    const storeIds = [];
    for (const store of stores) {
      const ownerId = store.ownerEmail ? userIds[store.ownerEmail] : null;
      const [result] = await connection.execute(
        'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
        [store.name, store.email, store.address, ownerId],
      );
      storeIds.push(result.insertId);
      console.log(`🏪 Created store: ${store.name}`);
    }

    // Insert sample ratings
    const ratingUsers = [
      { email: 'john.thompson@example.com', ratings: [4, 5, 3] },
      { email: 'sarah.johnson@example.com', ratings: [5, 3, 4] },
    ];

    for (const ratingUser of ratingUsers) {
      for (let i = 0; i < storeIds.length; i++) {
        await connection.execute(
          'INSERT INTO ratings (store_id, user_id, rating) VALUES (?, ?, ?)',
          [storeIds[i], userIds[ratingUser.email], ratingUser.ratings[i]],
        );
      }
      console.log(`⭐ Added ratings from: ${ratingUser.email}`);
    }

    console.log('\n✅ Seeding complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ADMIN:       admin@storerating.com  /  Admin@1234');
    console.log('USER 1:      john.thompson@example.com  /  User@12345');
    console.log('USER 2:      sarah.johnson@example.com  /  User@12345');
    console.log('OWNER 1:     owner1@storerating.com  /  Owner@1234');
    console.log('OWNER 2:     owner2@storerating.com  /  Owner@1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();

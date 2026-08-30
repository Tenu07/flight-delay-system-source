/**
 * seed-admin.js
 * Run once to create the administrator account in MongoDB Atlas.
 * Usage: node seed-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Admin credentials
const ADMIN_EMAIL = 'admin@flightsignal.ai';
const ADMIN_PASSWORD = 'FlightAdmin@2026';
const ADMIN_NAME = 'System Administrator';

function customLookup(hostname, options, cb) {
  if (typeof options === 'function') { cb = options; options = {}; }
  dns.resolve4(hostname, (err, addrs) => {
    if (err || !addrs || !addrs.length) dns.lookup(hostname, options, cb);
    else cb(null, addrs[0], 4);
  });
}

async function seed() {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  await mongoose.connect(process.env.MONGODB_URI, {
    lookup: customLookup,
    family: 4,
    serverSelectionTimeoutMS: 10000,
  });
  console.log('✅ Connected to MongoDB Atlas');

  // Dynamically load the User model (it uses bcrypt hashing in a pre-save hook)
  const User = require('./src/models/User');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`⚠️  Admin account already exists: ${ADMIN_EMAIL}`);
    console.log(`   Role: ${existing.role}`);
  } else {
    await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
    console.log('🎉 Admin account created successfully!');
  }

  console.log('\n─────────────────────────────────────');
  console.log('  Admin Login URL : http://localhost:3000/admin-login');
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Password : ${ADMIN_PASSWORD}`);
  console.log('─────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});

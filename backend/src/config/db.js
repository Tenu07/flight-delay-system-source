const mongoose = require('mongoose');
const dns = require('dns');

function customLookup(hostname, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  dns.resolve4(hostname, (err, addrs) => {
    if (err || !addrs || addrs.length === 0) {
      dns.lookup(hostname, options, cb);
    } else {
      cb(null, addrs[0], 4);
    }
  });
}

async function connectDatabase() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    } catch (e) {}
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGODB_URI, {
    lookup: customLookup,
    family: 4,
    serverSelectionTimeoutMS: 10000,
  });
  console.log('MongoDB connected successfully');
}

module.exports = connectDatabase;



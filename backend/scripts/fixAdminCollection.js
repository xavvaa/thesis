const mongoose = require('mongoose');
require('dotenv').config();

async function fixAdminCollection() {
  try {
    // Connect to MongoDB using the same connection string as the server
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://janyrin:janyrin123@cluster0.q8cca3z.mongodb.net/test');
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Drop the entire admins collection to remove problematic indexes
    try {
      await db.collection('admins').drop();
      console.log('✅ Dropped admins collection with problematic indexes');
    } catch (error) {
      console.log('ℹ️ Admins collection not found or already dropped');
    }
    
    // The collection will be recreated automatically when we save a new admin
    console.log('✅ Ready for fresh admin creation');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixAdminCollection();

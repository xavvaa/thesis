const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function cleanupDatabase() {
  try {
    console.log('Starting database cleanup...');
    
    // Wait for connection to be ready
    await mongoose.connection.asPromise();
    
    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Find all documents with firebaseUID: null
    const nullFirebaseUIDDocs = await usersCollection.find({ firebaseUID: null }).toArray();
    console.log(`Found ${nullFirebaseUIDDocs.length} documents with firebaseUID: null`);
    
    if (nullFirebaseUIDDocs.length > 0) {
      // Delete documents with firebaseUID: null
      const deleteResult = await usersCollection.deleteMany({ firebaseUID: null });
      console.log(`Deleted ${deleteResult.deletedCount} documents with firebaseUID: null`);
    }
    
    // Check for any documents with firebaseUID field (old schema)
    const firebaseUIDDocs = await usersCollection.find({ firebaseUID: { $exists: true } }).toArray();
    console.log(`Found ${firebaseUIDDocs.length} documents with firebaseUID field`);
    
    if (firebaseUIDDocs.length > 0) {
      // Migrate firebaseUID to uid for valid documents
      for (const doc of firebaseUIDDocs) {
        if (doc.firebaseUID && doc.firebaseUID !== null) {
          await usersCollection.updateOne(
            { _id: doc._id },
            { 
              $set: { uid: doc.firebaseUID },
              $unset: { firebaseUID: "" }
            }
          );
          console.log(`Migrated document ${doc._id}: firebaseUID -> uid`);
        }
      }
    }
    
    // Drop the old firebaseUID index if it exists
    try {
      await usersCollection.dropIndex('firebaseUID_1');
      console.log('Dropped old firebaseUID_1 index');
    } catch (error) {
      console.log('firebaseUID_1 index does not exist or already dropped');
    }
    
    // Ensure the correct uid index exists
    try {
      await usersCollection.createIndex({ uid: 1 }, { unique: true });
      console.log('Created uid_1 unique index');
    } catch (error) {
      console.log('uid_1 index already exists');
    }
    
    // Also clean up jobseekers and employers collections
    const jobseekersCollection = db.collection('jobseekers');
    const employersCollection = db.collection('employers');
    
    // Remove any jobseeker/employer records with null or missing uid
    const jsDeleteResult = await jobseekersCollection.deleteMany({ 
      $or: [{ uid: null }, { uid: { $exists: false } }] 
    });
    console.log(`Deleted ${jsDeleteResult.deletedCount} invalid jobseeker records`);
    
    const empDeleteResult = await employersCollection.deleteMany({ 
      $or: [{ uid: null }, { uid: { $exists: false } }] 
    });
    console.log(`Deleted ${empDeleteResult.deletedCount} invalid employer records`);
    
    console.log('Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('Database cleanup error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the cleanup
cleanupDatabase();

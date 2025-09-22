const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Temporary route to fix admin collection indexes
router.post('/fix-admin-indexes', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    // Drop the entire admins collection to remove problematic indexes
    try {
      await db.collection('admins').drop();
      console.log('✅ Dropped admins collection with problematic indexes');
    } catch (error) {
      console.log('ℹ️ Admins collection not found or already dropped');
    }
    
    res.json({
      success: true,
      message: 'Admin collection indexes fixed. Ready for fresh admin creation.'
    });
    
  } catch (error) {
    console.error('❌ Error fixing admin indexes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing admin indexes: ' + error.message
    });
  }
});

module.exports = router;

const admin = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'No valid authorization header provided' 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Extracted token length:', token?.length);
    
    if (!token || token.trim() === '') {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token.trim());
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    console.error('Token verification failed with:', error.message);
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid token',
      details: error.message
    });
  }
};

module.exports = { verifyToken };
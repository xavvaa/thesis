const User = require('../models/User');
const Admin = require('../models/Admin');

const adminMiddleware = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    console.log('🔍 Admin middleware checking user:', req.user.uid);

    // First check Admin collection
    let adminUser = await Admin.findOne({ 
      uid: req.user.uid,
      isActive: true,
      registrationStatus: 'verified'
    });

    // If not found in Admin collection, check User collection for backward compatibility
    if (!adminUser) {
      console.log('🔍 Not found in Admin collection, checking User collection...');
      adminUser = await User.findOne({ 
        uid: req.user.uid,
        role: { $in: ['admin', 'superadmin'] },
        isActive: true,
        registrationStatus: 'verified'
      });
    }

    if (!adminUser) {
      console.log('❌ Admin access denied for:', req.user.uid);
      return res.status(403).json({
        success: false,
        message: 'Admin access required or account not verified'
      });
    }

    console.log('✅ Admin access granted for:', adminUser.email);

    // Attach admin user data to request for use in routes
    req.adminUser = adminUser;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in admin authorization'
    });
  }
};

const superAdminMiddleware = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    console.log('🔍 Super admin middleware checking user:', req.user.uid);

    // First check Admin collection
    let superAdminUser = await Admin.findOne({ 
      uid: req.user.uid,
      role: 'superadmin',
      isActive: true,
      registrationStatus: 'verified'
    });

    // If not found in Admin collection, check User collection for backward compatibility
    if (!superAdminUser) {
      console.log('🔍 Not found in Admin collection, checking User collection...');
      superAdminUser = await User.findOne({ 
        uid: req.user.uid,
        role: 'superadmin',
        isActive: true,
        registrationStatus: 'verified'
      });
    }

    if (!superAdminUser) {
      console.log('❌ Super admin access denied for:', req.user.uid);
      return res.status(403).json({
        success: false,
        message: 'Super admin access required or account not verified'
      });
    }

    console.log('✅ Super admin access granted for:', superAdminUser.email);

    // Attach super admin user data to request for use in routes
    req.adminUser = superAdminUser;
    next();
  } catch (error) {
    console.error('Super admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in super admin authorization'
    });
  }
};

module.exports = {
  adminMiddleware,
  superAdminMiddleware
};

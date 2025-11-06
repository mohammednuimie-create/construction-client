const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware للتحقق من JWT Token
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication failed', message: error.message });
  }
};

// Middleware اختياري - يضيف المستخدم إذا كان موجوداً
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user) {
          req.user = user;
          req.userId = user._id.toString(); // تحويل إلى String للتأكد من التوافق
          req.userRole = user.role;
          console.log(`✅ [Auth] User authenticated: ${user.name} (${user.role}) - ID: ${req.userId} (type: ${typeof req.userId})`);
        } else {
          console.log(`⚠️ [Auth] Token valid but user not found: ${decoded.userId}`);
        }
      } catch (tokenError) {
        if (tokenError.name === 'JsonWebTokenError') {
          console.log(`⚠️ [Auth] Invalid token format`);
        } else if (tokenError.name === 'TokenExpiredError') {
          console.log(`⚠️ [Auth] Token expired`);
        } else {
          console.log(`⚠️ [Auth] Token verification error:`, tokenError.message);
        }
      }
    } else {
      console.log(`⚠️ [Auth] No token provided for ${req.method} ${req.path}`);
    }
    next();
  } catch (error) {
    // في حالة الخطأ، نستمر بدون authentication
    console.error(`❌ [Auth] Unexpected error:`, error.message);
    next();
  }
};

module.exports = { authenticate, optionalAuth };


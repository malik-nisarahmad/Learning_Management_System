// This file is kept for backward compatibility but authentication is now handled in app.js
// using Firebase Admin SDK verifyToken middleware

module.exports = {
  authenticate: async (req, res, next) => {
    try {
      const admin = require('./lib/firebaseAdmin');
      const token = req.headers.authorization?.split('Bearer ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  },
  verifyrole: (role) => {
    return async (req, res, next) => {
      try {
        const admin = require('./lib/firebaseAdmin');
        const user = await admin.auth().getUser(req.user.uid);
        const userRole = user.customClaims?.role || 'student';
        
        if (!role.includes(userRole)) {
          return res.status(403).json({ message: "Access denied" });
        }
        next();
      } catch (error) {
        return res.status(401).json({ error: 'Error verifying role' });
      }
    };
  }
};

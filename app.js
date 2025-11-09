const express = require("express");
const app = express();
const port = 3001;
const dotenv = require("dotenv");
const admin = require("./lib/firebaseAdmin");
dotenv.config();

// CORS configuration for Next.js frontend
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow requests from Next.js (ports 3000, 3001, or any localhost)
  if (origin && (origin.includes('localhost:3000') || origin.includes('localhost:3001') || origin.includes('127.0.0.1'))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to verify Firebase ID token
async function verifyToken(req, res, next) {
  try {
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
}

// Get user profile endpoint
app.get("/users/profile", verifyToken, async (req, res) => {
  try {
    const user = await admin.auth().getUser(req.user.uid);
    const customClaims = user.customClaims || {};
    
    res.json({
      id: user.uid,
      email: user.email,
      username: user.displayName || customClaims.username || user.email?.split('@')[0],
      role: customClaims.role || 'student',
      emailVerified: user.emailVerified
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile (set custom claims like role)
app.post("/users/profile", verifyToken, async (req, res) => {
  try {
    const { username, role } = req.body;
    const uid = req.user.uid;
    
    const updates = {};
    if (username) {
      updates.displayName = username;
    }
    
    // Update custom claims
    const customClaims = { role: role || 'student' };
    if (username) {
      customClaims.username = username;
    }
    
    await admin.auth().setCustomUserClaims(uid, customClaims);
    
    if (Object.keys(updates).length > 0) {
      await admin.auth().updateUser(uid, updates);
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout endpoint (client-side handles Firebase logout, this is just for cleanup if needed)
app.post("/users/logout", verifyToken, async (req, res) => {
  try {
    // Firebase handles logout on client side
    // This endpoint can be used for server-side session cleanup if needed
    res.json({ message: "logout successful" });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save document metadata endpoint
app.post("/documents", verifyToken, async (req, res) => {
  try {
    const { title, course, category, description, documentUrl, documentPublicId, type } = req.body;
    const uid = req.user.uid;

    if (!title || !course || !category || !documentUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Here you would save to your database (Firestore, MongoDB, etc.)
    // For now, we'll just return success
    const documentData = {
      id: `doc_${Date.now()}`,
      title,
      course,
      category,
      description: description || '',
      type: type || 'PDF',
      documentUrl,
      documentPublicId,
      uploadedBy: uid,
      uploadedAt: new Date().toISOString(),
      likes: 0,
      views: 0,
      downloads: 0
    };

    // TODO: Save to database
    // await db.collection('documents').add(documentData);

    res.status(201).json({ 
      message: 'Document saved successfully',
      document: documentData
    });
  } catch (error) {
    console.error('Save document error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get documents endpoint
app.get("/documents", verifyToken, async (req, res) => {
  try {
    // TODO: Fetch from database
    // const documents = await db.collection('documents').get();
    
    res.json({ 
      documents: [],
      message: 'Documents retrieved successfully'
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Server is running", status: "ok" });
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`✅ Firebase Admin initialized`);
});

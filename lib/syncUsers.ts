// Utility script to sync Firebase Auth users to Firestore users collection
// Run this once to populate the users collection with existing auth users

import { db } from './firebase';
import { doc, setDoc, collection, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';

// This function can be called from the browser console or a admin page
// to manually add users to Firestore if they exist in Firebase Auth but not in Firestore
export const addManualUser = async (user: {
  id: string;
  name: string;
  email: string;
  department?: string;
  semester?: string;
  fastId?: string;
  avatar?: string;
}) => {
  if (!db) {
    console.error('Firestore is not initialized');
    return false;
  }

  try {
    const searchTerms = [
      user.name.toLowerCase(),
      user.email.toLowerCase(),
      user.department?.toLowerCase(),
      user.semester?.toLowerCase(),
      user.fastId?.toLowerCase(),
    ].filter(Boolean) as string[];

    // Add to users collection
    await setDoc(doc(db, 'users', user.id), {
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      department: user.department || 'Computer Science',
      semester: user.semester || 'Fall 2024',
      fastId: user.fastId || `FAST-STD-${user.id.slice(-4)}`,
      searchTerms,
      isOnline: false,
      lastSeen: serverTimestamp(),
    }, { merge: true });

    // Also add to chatUsers collection
    await setDoc(doc(db, 'chatUsers', user.id), {
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      department: user.department || 'Computer Science',
      semester: user.semester || 'Fall 2024',
      fastId: user.fastId || `FAST-STD-${user.id.slice(-4)}`,
      searchTerms,
      isOnline: false,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });

    console.log('✅ User added to both collections:', user.name);
    return true;
  } catch (error) {
    console.error('Error adding user to Firestore:', error);
    return false;
  }
};

// Get all users currently in Firestore (both collections)
export const listFirestoreUsers = async () => {
  if (!db) {
    console.error('❌ Firestore is not initialized - db is null!');
    return [];
  }

  try {
    console.log('📂 Fetching users from Firestore...');
    
    // Check chatUsers collection
    const chatUsersRef = collection(db, 'chatUsers');
    const chatUsersSnapshot = await getDocs(chatUsersRef);
    console.log(`📊 chatUsers collection: ${chatUsersSnapshot.docs.length} documents`);
    chatUsersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   - [chatUsers] ${doc.id}: ${data.name || data.email || 'No name'}`);
    });
    
    // Check users collection
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    console.log(`📊 users collection: ${usersSnapshot.docs.length} documents`);
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   - [users] ${doc.id}: ${data.name || data.email || 'No name'}`);
    });

    const allUsers = new Map();
    
    chatUsersSnapshot.docs.forEach(doc => {
      allUsers.set(doc.id, { id: doc.id, ...doc.data(), source: 'chatUsers' });
    });
    
    usersSnapshot.docs.forEach(doc => {
      if (!allUsers.has(doc.id)) {
        allUsers.set(doc.id, { id: doc.id, ...doc.data(), source: 'users' });
      }
    });

    const users = Array.from(allUsers.values());
    console.log(`\n📊 Total unique users: ${users.length}`);
    
    return users;
  } catch (error) {
    console.error('❌ Error listing users:', error);
    return [];
  }
};

// Sync users from 'users' collection to 'chatUsers' collection
export const syncUsersToChatUsers = async () => {
  if (!db) {
    console.error('❌ Firestore is not initialized');
    return { success: false, synced: 0 };
  }

  try {
    console.log('🔄 Starting user sync from users to chatUsers...');
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let synced = 0;
    
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      
      // Create search terms
      const searchTerms = [
        userData.name?.toLowerCase(),
        userData.email?.toLowerCase(),
        userData.department?.toLowerCase(),
        userData.semester?.toLowerCase(),
        userData.fastId?.toLowerCase(),
      ].filter(Boolean) as string[];
      
      await setDoc(doc(db, 'chatUsers', userDoc.id), {
        name: userData.name || 'Unknown User',
        email: userData.email || '',
        avatar: userData.avatar || null,
        department: userData.department || 'Unknown',
        semester: userData.semester || 'Unknown',
        fastId: userData.fastId || '',
        searchTerms,
        isOnline: userData.isOnline || false,
        lastSeen: userData.lastSeen || serverTimestamp(),
        createdAt: userData.createdAt || serverTimestamp(),
      }, { merge: true });
      
      synced++;
      console.log(`   ✅ Synced: ${userData.name || userData.email}`);
    }
    
    console.log(`\n🎉 Sync complete! ${synced} users synced to chatUsers collection.`);
    return { success: true, synced };
  } catch (error) {
    console.error('❌ Error syncing users:', error);
    return { success: false, synced: 0 };
  }
};

// Debug function to check Firebase status
export const debugFirebaseStatus = () => {
  console.log('='.repeat(50));
  console.log('🔥 FIREBASE DEBUG STATUS');
  console.log('='.repeat(50));
  console.log('db:', db ? '✅ Available' : '❌ NULL');
  console.log('db type:', typeof db);
  if (db) {
    console.log('db app:', (db as any)._databaseId?.projectId || 'Unknown');
  }
  console.log('='.repeat(50));
  return { dbAvailable: !!db };
};

// Example usage (can be pasted in browser console after importing):
// 
// import { addManualUser, listFirestoreUsers, syncUsersToChatUsers, debugFirebaseStatus } from '@/lib/syncUsers';
// 
// // Check Firebase status
// debugFirebaseStatus();
//
// // List current users
// await listFirestoreUsers();
// 
// // Sync existing users to chatUsers
// await syncUsersToChatUsers();
//
// // Add a user manually
// await addManualUser({
//   id: 'firebase-auth-uid-here',
//   name: 'John Doe',
//   email: 'john@example.com',
//   department: 'Computer Science',
//   semester: 'Fall 2024',
//   fastId: 'FAST-STD-1234'
// });

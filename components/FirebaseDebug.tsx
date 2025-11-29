'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  serverTimestamp,
  query,
  limit 
} from 'firebase/firestore';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface FirebaseDebugProps {
  currentUser?: {
    id: string;
    name: string;
    email: string;
    department?: string;
    semester?: string;
  };
}

export function FirebaseDebug({ currentUser }: FirebaseDebugProps) {
  const [status, setStatus] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Check Firebase connection
  useEffect(() => {
    checkFirebase();
  }, []);

  const checkFirebase = async () => {
    setStatus('Checking Firebase connection...');
    setError(null);
    
    if (!db) {
      setStatus('❌ Firebase db is NULL!');
      setError('Firebase Firestore is not initialized. Check your environment variables.');
      return;
    }

    try {
      // Try to read from chatUsers collection
      const chatUsersRef = collection(db, 'chatUsers');
      const chatUsersSnapshot = await getDocs(query(chatUsersRef, limit(10)));
      
      // Try to read from users collection
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(query(usersRef, limit(10)));

      const allUsers: any[] = [];
      
      chatUsersSnapshot.docs.forEach(doc => {
        allUsers.push({ id: doc.id, source: 'chatUsers', ...doc.data() });
      });
      
      usersSnapshot.docs.forEach(doc => {
        if (!allUsers.find(u => u.id === doc.id)) {
          allUsers.push({ id: doc.id, source: 'users', ...doc.data() });
        }
      });

      setUsers(allUsers);
      setStatus(`✅ Firebase connected! Found ${chatUsersSnapshot.docs.length} users in chatUsers, ${usersSnapshot.docs.length} in users collection.`);
      
      if (allUsers.length === 0) {
        setStatus('✅ Firebase connected but no users found. Click "Create Test User" to add one.');
      }
    } catch (err: any) {
      console.error('Firebase error:', err);
      
      if (err.code === 'permission-denied') {
        setStatus('❌ PERMISSION DENIED - You must update Firestore security rules!');
        setError('Click the button below to open Firebase Console and fix the rules.');
      } else if (err.code === 'unavailable') {
        setStatus('❌ Firestore unavailable - Database might not exist!');
        setError('Go to Firebase Console → Build → Firestore Database → Create Database');
      } else {
        setStatus('❌ Firebase error');
        setError(err.message);
      }
    }
  };

  const createTestUser = async () => {
    if (!db) {
      setError('Firebase not initialized');
      return;
    }

    setLoading(true);
    try {
      const testUserId = `test-user-${Date.now()}`;
      const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        username: 'testuser',
        department: 'Computer Science',
        semester: 'Fall 2024',
        searchTerms: ['test user', 'testuser', 'test', 'computer science'],
        isOnline: true,
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'chatUsers', testUserId), testUser);
      setStatus('✅ Test user created successfully!');
      
      // Refresh the list
      await checkFirebase();
    } catch (err: any) {
      console.error('Error creating test user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCurrentUser = async () => {
    if (!db || !currentUser) {
      setError('Firebase not initialized or no current user');
      return;
    }

    setLoading(true);
    try {
      const searchTerms = [
        currentUser.name?.toLowerCase(),
        currentUser.email?.toLowerCase(),
        currentUser.department?.toLowerCase(),
        ...currentUser.name?.toLowerCase().split(' ') || [],
      ].filter(Boolean);

      await setDoc(doc(db, 'chatUsers', currentUser.id), {
        name: currentUser.name,
        email: currentUser.email,
        department: currentUser.department || 'Computer Science',
        semester: currentUser.semester || 'Fall 2024',
        searchTerms,
        isOnline: true,
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });

      setStatus(`✅ User ${currentUser.name} added to chatUsers!`);
      await checkFirebase();
    } catch (err: any) {
      console.error('Error adding current user:', err);
      if (err.code === 'permission-denied') {
        setStatus('❌ PERMISSION DENIED - You must update Firestore security rules!');
        setError('Click the button below to open Firebase Console and fix the rules.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isPermissionError = status.includes('PERMISSION DENIED');

  return (
    <Card className={`p-4 m-4 border-2 ${isPermissionError ? 'bg-red-50 dark:bg-red-900/20 border-red-400' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300'}`}>
      <h3 className="text-lg font-bold mb-2">🔥 Firebase Debug Panel</h3>
      
      <div className="mb-4">
        <p className={`font-medium ${isPermissionError ? 'text-red-600 dark:text-red-400' : ''}`}>{status}</p>
        {error && (
          <p className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
      </div>

      {/* Show prominent fix button for permission errors */}
      {isPermissionError && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-300">
          <p className="font-medium mb-2">🔧 To fix this error:</p>
          <ol className="list-decimal ml-4 text-sm mb-3 space-y-1">
            <li>Click the button below to open Firebase Console</li>
            <li>Go to the <strong>Rules</strong> tab</li>
            <li>Replace the rules with:</li>
          </ol>
          <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs mb-3 overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
          </pre>
          <ol className="list-decimal ml-4 text-sm mb-3 space-y-1" start={4}>
            <li>Click <strong>"Publish"</strong></li>
            <li>Come back here and click <strong>"Refresh Status"</strong></li>
          </ol>
          <a 
            href="https://console.firebase.google.com/project/fast-connect-58826/firestore/rules" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🔗 Open Firebase Console Rules
          </a>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        <Button onClick={checkFirebase} variant="outline" size="sm">
          🔄 Refresh Status
        </Button>
        {!isPermissionError && (
          <>
            <Button onClick={createTestUser} variant="outline" size="sm" disabled={loading}>
              {loading ? '...' : '➕ Create Test User'}
            </Button>
            {currentUser && (
              <Button onClick={addCurrentUser} variant="outline" size="sm" disabled={loading}>
                {loading ? '...' : `➕ Add ${currentUser.name} to chatUsers`}
              </Button>
            )}
          </>
        )}
      </div>

      {users.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Users in Database ({users.length}):</h4>
          <ul className="text-sm space-y-1">
            {users.map(user => (
              <li key={user.id} className="p-1 bg-white dark:bg-gray-800 rounded">
                <span className="text-xs text-gray-500">[{user.source}]</span>{' '}
                <strong>{user.name || 'No name'}</strong> - {user.email || 'No email'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Firebase Setup Checklist:</strong></p>
        <ol className="list-decimal ml-4">
          <li>Go to <a href="https://console.firebase.google.com" target="_blank" className="text-blue-500 underline">Firebase Console</a></li>
          <li>Select your project: fast-connect-58826</li>
          <li>Go to Build → Firestore Database</li>
          <li>If no database exists, click "Create database"</li>
          <li>Choose "Start in test mode" for development</li>
          <li>Select a location close to you</li>
          <li>Click "Enable"</li>
        </ol>
      </div>
    </Card>
  );
}

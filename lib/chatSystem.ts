// Comprehensive Real-Time Chat System with Friend System
// Similar to Discord/WhatsApp/Facebook Messenger

import { db, storage } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Debug: Check if Firebase is initialized
if (typeof window !== 'undefined') {
  console.log('🔥 ChatSystem: Firebase db initialized:', !!db);
  if (!db) {
    console.error('❌ ChatSystem: Firebase Firestore is NOT initialized! Check your .env.local file and restart the server.');
  }
}

// ==================== TYPES ====================

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  department?: string;
  semester?: string;
  fastId?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName: string;
  receiverEmail: string;
  receiverAvatar?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: Date;
}

export interface Friend {
  id: string;
  odone: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  semester?: string;
  isOnline: boolean;
  lastSeen: Date;
  addedAt: Date;
}

export interface Conversation {
  id: string;
  type: 'private' | 'group';
  name?: string; // For groups
  description?: string; // For groups
  icon?: string; // For groups
  members: string[];
  memberDetails: { [userId: string]: { name: string; avatar?: string; email?: string } };
  admins?: string[]; // For groups
  lastMessage?: string;
  lastMessageTime?: Date;
  lastMessageSender?: string;
  lastMessageSenderId?: string;
  unreadCount: { [userId: string]: number };
  typingUsers?: string[];
  createdAt: Date;
  createdBy: string;
  // For groups
  groupType?: 'class' | 'semester' | 'event' | 'custom';
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: Date;
  readBy: string[];
  deliveredTo: string[];
  replyTo?: {
    messageId: string;
    senderName: string;
    content: string;
  };
  reactions?: { [emoji: string]: string[] }; // emoji -> userIds
  isEdited?: boolean;
  isDeleted?: boolean;
}

// ==================== HELPERS ====================

const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

// ==================== USER MANAGEMENT ====================

export const registerChatUser = async (user: {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  department?: string;
  semester?: string;
  fastId?: string;
}) => {
  if (!db) {
    console.error('❌ registerChatUser: Firestore not initialized! Check Firebase config.');
    return;
  }

  console.log('📝 registerChatUser: Registering user:', user.id, user.name);

  const searchTerms = [
    user.name?.toLowerCase(),
    user.email?.toLowerCase(),
    user.username?.toLowerCase(),
    user.department?.toLowerCase(),
    user.semester?.toLowerCase(),
    user.fastId?.toLowerCase(),
    // Add partial search terms for name
    ...user.name?.toLowerCase().split(' ') || [],
  ].filter(Boolean) as string[];

  try {
    await setDoc(doc(db, 'chatUsers', user.id), {
      name: user.name,
      email: user.email,
      username: user.username || user.email?.split('@')[0] || '',
      avatar: user.avatar || null,
      department: user.department || null,
      semester: user.semester || null,
      fastId: user.fastId || null,
      searchTerms,
      isOnline: true,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });
    console.log('✅ registerChatUser: User registered successfully:', user.name);
  } catch (error) {
    console.error('❌ registerChatUser: Error:', error);
  }
};

export const updateUserPresence = async (userId: string, isOnline: boolean) => {
  if (!db) return;

  try {
    await updateDoc(doc(db, 'chatUsers', userId), {
      isOnline,
      lastSeen: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating presence:', error);
  }
};

export const subscribeToUserPresence = (
  userIds: string[],
  callback: (presence: { [userId: string]: { isOnline: boolean; lastSeen: Date } }) => void
) => {
  if (!db || userIds.length === 0) return () => {};

  const unsubscribes: (() => void)[] = [];
  const presenceData: { [userId: string]: { isOnline: boolean; lastSeen: Date } } = {};

  userIds.forEach(userId => {
    const unsub = onSnapshot(doc(db!, 'chatUsers', userId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        presenceData[userId] = {
          isOnline: data.isOnline || false,
          lastSeen: convertTimestamp(data.lastSeen),
        };
      }
      callback({ ...presenceData });
    });
    unsubscribes.push(unsub);
  });

  return () => unsubscribes.forEach(unsub => unsub());
};

// ==================== USER SEARCH ====================

export const searchUsers = async (
  searchQuery: string,
  currentUserId: string,
  maxResults: number = 20
): Promise<ChatUser[]> => {
  if (!db || !searchQuery.trim()) return [];

  const searchLower = searchQuery.toLowerCase().trim();

  try {
    const results: ChatUser[] = [];
    const seenIds = new Set<string>();

    // Search in chatUsers collection first
    try {
      const chatUsersQuery = query(
        collection(db, 'chatUsers'),
        where('searchTerms', 'array-contains', searchLower),
        limit(maxResults)
      );
      const chatUsersSnapshot = await getDocs(chatUsersQuery);
      chatUsersSnapshot.docs.forEach(doc => {
        if (doc.id !== currentUserId && !seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          results.push({
            id: doc.id,
            ...doc.data(),
            lastSeen: convertTimestamp(doc.data().lastSeen),
            createdAt: convertTimestamp(doc.data().createdAt),
          } as ChatUser);
        }
      });
    } catch (e) {
      console.log('chatUsers search error:', e);
    }

    // Also search in users collection (legacy)
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('searchTerms', 'array-contains', searchLower),
        limit(maxResults)
      );
      const usersSnapshot = await getDocs(usersQuery);
      usersSnapshot.docs.forEach(doc => {
        if (doc.id !== currentUserId && !seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          results.push({
            id: doc.id,
            ...doc.data(),
            lastSeen: convertTimestamp(doc.data().lastSeen),
            createdAt: convertTimestamp(doc.data().createdAt || new Date()),
          } as ChatUser);
        }
      });
    } catch (e) {
      console.log('users search error:', e);
    }

    // If no results with exact match, try getting all users and filter client-side
    if (results.length === 0) {
      const allUsersResults = await getAllUsersFiltered(searchLower, currentUserId, maxResults);
      return allUsersResults;
    }

    return results.slice(0, maxResults);
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

// Helper function to get all users and filter client-side
const getAllUsersFiltered = async (
  searchLower: string,
  currentUserId: string,
  maxResults: number
): Promise<ChatUser[]> => {
  if (!db) return [];

  const results: ChatUser[] = [];
  const seenIds = new Set<string>();

  // Get from chatUsers
  try {
    const chatUsersSnapshot = await getDocs(collection(db, 'chatUsers'));
    chatUsersSnapshot.docs.forEach(doc => {
      if (doc.id !== currentUserId && !seenIds.has(doc.id)) {
        const data = doc.data();
        const name = (data.name || '').toLowerCase();
        const email = (data.email || '').toLowerCase();
        const username = (data.username || '').toLowerCase();
        const department = (data.department || '').toLowerCase();
        
        if (name.includes(searchLower) || 
            email.includes(searchLower) || 
            username.includes(searchLower) ||
            department.includes(searchLower)) {
          seenIds.add(doc.id);
          results.push({
            id: doc.id,
            ...data,
            lastSeen: convertTimestamp(data.lastSeen),
            createdAt: convertTimestamp(data.createdAt || new Date()),
          } as ChatUser);
        }
      }
    });
  } catch (e) {
    console.log('chatUsers getAllFiltered error:', e);
  }

  // Get from users (legacy)
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersSnapshot.docs.forEach(doc => {
      if (doc.id !== currentUserId && !seenIds.has(doc.id)) {
        const data = doc.data();
        const name = (data.name || '').toLowerCase();
        const email = (data.email || '').toLowerCase();
        const username = (data.username || '').toLowerCase();
        const department = (data.department || '').toLowerCase();
        
        if (name.includes(searchLower) || 
            email.includes(searchLower) || 
            username.includes(searchLower) ||
            department.includes(searchLower)) {
          seenIds.add(doc.id);
          results.push({
            id: doc.id,
            ...data,
            lastSeen: convertTimestamp(data.lastSeen),
            createdAt: convertTimestamp(data.createdAt || new Date()),
          } as ChatUser);
        }
      }
    });
  } catch (e) {
    console.log('users getAllFiltered error:', e);
  }

  return results.slice(0, maxResults);
};

export const getAllUsers = async (currentUserId: string): Promise<ChatUser[]> => {
  if (!db) return [];

  const results: ChatUser[] = [];
  const seenIds = new Set<string>();

  // Get from chatUsers
  try {
    const chatUsersSnapshot = await getDocs(collection(db, 'chatUsers'));
    chatUsersSnapshot.docs.forEach(doc => {
      if (doc.id !== currentUserId && !seenIds.has(doc.id)) {
        seenIds.add(doc.id);
        results.push({
          id: doc.id,
          ...doc.data(),
          lastSeen: convertTimestamp(doc.data().lastSeen),
          createdAt: convertTimestamp(doc.data().createdAt || new Date()),
        } as ChatUser);
      }
    });
  } catch (e) {
    console.log('chatUsers getAll error:', e);
  }

  // Get from users (legacy)
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersSnapshot.docs.forEach(doc => {
      if (doc.id !== currentUserId && !seenIds.has(doc.id)) {
        seenIds.add(doc.id);
        results.push({
          id: doc.id,
          ...doc.data(),
          lastSeen: convertTimestamp(doc.data().lastSeen),
          createdAt: convertTimestamp(doc.data().createdAt || new Date()),
        } as ChatUser);
      }
    });
  } catch (e) {
    console.log('users getAll error:', e);
  }

  return results;
};

export const subscribeToAllUsers = (
  currentUserId: string,
  callback: (users: ChatUser[]) => void,
  onError?: (error: string) => void
) => {
  console.log('🔔 subscribeToAllUsers called for user:', currentUserId);
  
  if (!db) {
    console.error('❌ Firebase db is null! Cannot subscribe to users.');
    onError?.('Firebase not initialized');
    return () => {};
  }

  const allUsers = new Map<string, ChatUser>();
  let hasPermissionError = false;

  const handlePermissionError = (error: any, collectionName: string) => {
    console.error(`❌ Error subscribing to ${collectionName}:`, error);
    if (error.code === 'permission-denied' && !hasPermissionError) {
      hasPermissionError = true;
      const errorMsg = `⚠️ Firebase Permission Denied! 
      
Go to Firebase Console → Firestore Database → Rules and set:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

Then click "Publish"`;
      console.error(errorMsg);
      onError?.(errorMsg);
    }
  };

  // Subscribe to chatUsers collection
  const unsubChatUsers = onSnapshot(
    collection(db, 'chatUsers'),
    (snapshot) => {
      snapshot.docs.forEach(doc => {
        if (doc.id !== currentUserId) {
          allUsers.set(doc.id, {
            id: doc.id,
            ...doc.data(),
            lastSeen: convertTimestamp(doc.data().lastSeen),
            createdAt: convertTimestamp(doc.data().createdAt || new Date()),
          } as ChatUser);
        }
      });
      callback(Array.from(allUsers.values()));
    },
    (error) => handlePermissionError(error, 'chatUsers')
  );

  // Subscribe to users collection (legacy)
  const unsubUsers = onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      snapshot.docs.forEach(doc => {
        if (doc.id !== currentUserId && !allUsers.has(doc.id)) {
          allUsers.set(doc.id, {
            id: doc.id,
            ...doc.data(),
            lastSeen: convertTimestamp(doc.data().lastSeen),
            createdAt: convertTimestamp(doc.data().createdAt || new Date()),
          } as ChatUser);
        }
      });
      callback(Array.from(allUsers.values()));
    },
    (error) => handlePermissionError(error, 'users')
  );

  return () => {
    unsubChatUsers();
    unsubUsers();
  };
};

// ==================== FRIEND SYSTEM ====================

export const sendFriendRequest = async (
  sender: { id: string; name: string; email: string; avatar?: string },
  receiver: { id: string; name: string; email: string; avatar?: string }
) => {
  if (!db) return null;

  try {
    // Check if request already exists
    const existingQuery = query(
      collection(db, 'friendRequests'),
      where('senderId', '==', sender.id),
      where('receiverId', '==', receiver.id),
      where('status', '==', 'pending')
    );
    const existing = await getDocs(existingQuery);
    if (!existing.empty) {
      console.log('Friend request already exists');
      return null;
    }

    // Check reverse direction too
    const reverseQuery = query(
      collection(db, 'friendRequests'),
      where('senderId', '==', receiver.id),
      where('receiverId', '==', sender.id),
      where('status', '==', 'pending')
    );
    const reverse = await getDocs(reverseQuery);
    if (!reverse.empty) {
      // Auto-accept if they already sent us a request
      const reverseRequestId = reverse.docs[0].id;
      await acceptFriendRequest(reverseRequestId, receiver.id, sender.id);
      return reverseRequestId;
    }

    // Check if already friends
    const friendsCheck = await getDoc(doc(db, 'friends', sender.id));
    if (friendsCheck.exists()) {
      const friendsList = friendsCheck.data().friendIds || [];
      if (friendsList.includes(receiver.id)) {
        console.log('Already friends');
        return null;
      }
    }

    const requestRef = await addDoc(collection(db, 'friendRequests'), {
      senderId: sender.id,
      senderName: sender.name,
      senderEmail: sender.email,
      senderAvatar: sender.avatar || null,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverEmail: receiver.email,
      receiverAvatar: receiver.avatar || null,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    console.log('Friend request sent:', requestRef.id);
    return requestRef.id;
  } catch (error) {
    console.error('Error sending friend request:', error);
    return null;
  }
};

export const acceptFriendRequest = async (
  requestId: string,
  receiverId: string,
  senderId: string
) => {
  if (!db) return false;

  try {
    const batch = writeBatch(db);

    // Update request status
    batch.update(doc(db, 'friendRequests', requestId), {
      status: 'accepted',
    });

    // Get user details
    const senderDoc = await getDoc(doc(db, 'chatUsers', senderId));
    const receiverDoc = await getDoc(doc(db, 'chatUsers', receiverId));

    const senderData = senderDoc.data();
    const receiverData = receiverDoc.data();

    // Add to friends list for both users
    const friendDataForReceiver = {
      odone: senderId,
      name: senderData?.name || 'Unknown',
      email: senderData?.email || '',
      avatar: senderData?.avatar || null,
      department: senderData?.department || null,
      semester: senderData?.semester || null,
      addedAt: serverTimestamp(),
    };

    const friendDataForSender = {
      odone: receiverId,
      name: receiverData?.name || 'Unknown',
      email: receiverData?.email || '',
      avatar: receiverData?.avatar || null,
      department: receiverData?.department || null,
      semester: receiverData?.semester || null,
      addedAt: serverTimestamp(),
    };

    // Update friends collections
    batch.set(doc(db, 'friends', receiverId), {
      friendIds: arrayUnion(senderId),
    }, { merge: true });

    batch.set(doc(db, 'friends', senderId), {
      friendIds: arrayUnion(receiverId),
    }, { merge: true });

    // Store friend details
    batch.set(doc(db, 'friends', receiverId, 'list', senderId), friendDataForReceiver);
    batch.set(doc(db, 'friends', senderId, 'list', receiverId), friendDataForSender);

    await batch.commit();

    // Create a private conversation for them
    await createPrivateConversation(
      { id: senderId, name: senderData?.name || 'Unknown', avatar: senderData?.avatar, email: senderData?.email },
      { id: receiverId, name: receiverData?.name || 'Unknown', avatar: receiverData?.avatar, email: receiverData?.email }
    );

    console.log('Friend request accepted');
    return true;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return false;
  }
};

export const declineFriendRequest = async (requestId: string) => {
  if (!db) return false;

  try {
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: 'declined',
    });
    return true;
  } catch (error) {
    console.error('Error declining friend request:', error);
    return false;
  }
};

export const cancelFriendRequest = async (requestId: string) => {
  if (!db) return false;

  try {
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: 'cancelled',
    });
    return true;
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    return false;
  }
};

export const removeFriend = async (userId: string, friendId: string) => {
  if (!db) return false;

  try {
    const batch = writeBatch(db);

    // Remove from both friends lists
    batch.update(doc(db, 'friends', userId), {
      friendIds: arrayRemove(friendId),
    });
    batch.update(doc(db, 'friends', friendId), {
      friendIds: arrayRemove(userId),
    });

    // Delete friend detail docs
    batch.delete(doc(db, 'friends', userId, 'list', friendId));
    batch.delete(doc(db, 'friends', friendId, 'list', userId));

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    return false;
  }
};

export const subscribeToPendingRequests = (
  userId: string,
  callback: (requests: FriendRequest[]) => void
) => {
  if (!db) return () => {};

  // Requests received - simplified query without orderBy to avoid index requirement
  const receivedQuery = query(
    collection(db, 'friendRequests'),
    where('receiverId', '==', userId),
    where('status', '==', 'pending')
  );

  return onSnapshot(
    receivedQuery, 
    (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      } as FriendRequest));
      // Sort client-side instead
      requests.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      callback(requests);
    },
    (error) => {
      console.error('Error in subscribeToPendingRequests:', error);
      callback([]);
    }
  );
};

export const subscribeToSentRequests = (
  userId: string,
  callback: (requests: FriendRequest[]) => void
) => {
  if (!db) return () => {};

  // Simplified query without orderBy to avoid index requirement
  const sentQuery = query(
    collection(db, 'friendRequests'),
    where('senderId', '==', userId),
    where('status', '==', 'pending')
  );

  return onSnapshot(
    sentQuery, 
    (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      } as FriendRequest));
      // Sort client-side instead
      requests.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      callback(requests);
    },
    (error) => {
      console.error('Error in subscribeToSentRequests:', error);
      callback([]);
    }
  );
};

export const subscribeToFriends = (
  userId: string,
  callback: (friends: Friend[]) => void
) => {
  if (!db) return () => {};

  return onSnapshot(
    collection(db, 'friends', userId, 'list'),
    (snapshot) => {
      const friends = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastSeen: convertTimestamp(doc.data().lastSeen),
        addedAt: convertTimestamp(doc.data().addedAt),
      } as Friend));
      callback(friends);
    },
    (error) => {
      console.error('Error subscribing to friends:', error);
      callback([]);
    }
  );
};

// Combined subscription for friend requests (incoming and outgoing)
export const subscribeToFriendRequests = (
  userId: string,
  onIncoming: (requests: FriendRequest[]) => void,
  onOutgoing: (requests: FriendRequest[]) => void
) => {
  const unsubPending = subscribeToPendingRequests(userId, onIncoming);
  const unsubSent = subscribeToSentRequests(userId, onOutgoing);
  
  return () => {
    unsubPending();
    unsubSent();
  };
};

// ==================== CONVERSATIONS ====================

export const createPrivateConversation = async (
  user1: { id: string; name: string; avatar?: string; email?: string },
  user2: { id: string; name: string; avatar?: string; email?: string }
) => {
  if (!db) return null;

  // Check if conversation already exists
  const existingQuery = query(
    collection(db, 'conversations'),
    where('type', '==', 'private'),
    where('members', 'array-contains', user1.id)
  );

  const existing = await getDocs(existingQuery);
  const existingConvo = existing.docs.find(doc => {
    const members = doc.data().members;
    return members.includes(user2.id);
  });

  if (existingConvo) {
    return existingConvo.id;
  }

  try {
    const convoRef = await addDoc(collection(db, 'conversations'), {
      type: 'private',
      members: [user1.id, user2.id],
      memberDetails: {
        [user1.id]: { name: user1.name, avatar: user1.avatar || null, email: user1.email || '' },
        [user2.id]: { name: user2.name, avatar: user2.avatar || null, email: user2.email || '' },
      },
      unreadCount: {
        [user1.id]: 0,
        [user2.id]: 0,
      },
      createdAt: serverTimestamp(),
      createdBy: user1.id,
    });

    return convoRef.id;
  } catch (error) {
    console.error('Error creating private conversation:', error);
    return null;
  }
};

export const createGroupConversation = async (
  creator: { id: string; name: string; avatar?: string; email?: string },
  groupName: string,
  groupDescription: string,
  members: { id: string; name: string; avatar?: string; email?: string }[],
  groupType: 'class' | 'semester' | 'event' | 'custom' = 'custom',
  icon?: string
) => {
  if (!db) return null;

  try {
    const allMembers = [creator, ...members];
    const memberIds = allMembers.map(m => m.id);
    const memberDetails: { [key: string]: { name: string; avatar?: string; email?: string } } = {};
    const unreadCount: { [key: string]: number } = {};

    allMembers.forEach(m => {
      memberDetails[m.id] = { name: m.name, avatar: m.avatar || undefined, email: m.email || '' };
      unreadCount[m.id] = 0;
    });

    const convoRef = await addDoc(collection(db, 'conversations'), {
      type: 'group',
      name: groupName,
      description: groupDescription,
      icon: icon || null,
      groupType,
      members: memberIds,
      memberDetails,
      admins: [creator.id],
      unreadCount,
      createdAt: serverTimestamp(),
      createdBy: creator.id,
    });

    // Send system message
    await addDoc(collection(db, 'conversations', convoRef.id, 'messages'), {
      senderId: 'system',
      senderName: 'System',
      content: `${creator.name} created the group "${groupName}"`,
      type: 'system',
      createdAt: serverTimestamp(),
      readBy: [],
      deliveredTo: memberIds,
    });

    return convoRef.id;
  } catch (error) {
    console.error('Error creating group conversation:', error);
    return null;
  }
};

export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  if (!db) return () => {};

  // Simplified query without orderBy to avoid index requirement
  const q = query(
    collection(db, 'conversations'),
    where('members', 'array-contains', userId)
  );

  return onSnapshot(
    q, 
    (snapshot) => {
      const conversations = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastMessageTime: convertTimestamp(doc.data().lastMessageTime),
          createdAt: convertTimestamp(doc.data().createdAt),
        } as Conversation))
        // Sort client-side instead
        .sort((a, b) => (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0));
      callback(conversations);
    }, 
    (error) => {
      console.error('Error subscribing to conversations:', error);
      callback([]);
    }
  );
};

export const addMemberToGroup = async (
  conversationId: string,
  adder: { id: string; name: string },
  newMember: { id: string; name: string; avatar?: string; email?: string }
) => {
  if (!db) return false;

  try {
    const batch = writeBatch(db);

    batch.update(doc(db, 'conversations', conversationId), {
      members: arrayUnion(newMember.id),
      [`memberDetails.${newMember.id}`]: {
        name: newMember.name,
        avatar: newMember.avatar || null,
        email: newMember.email || '',
      },
      [`unreadCount.${newMember.id}`]: 0,
    });

    await batch.commit();

    // System message
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId: 'system',
      senderName: 'System',
      content: `${adder.name} added ${newMember.name} to the group`,
      type: 'system',
      createdAt: serverTimestamp(),
      readBy: [],
      deliveredTo: [],
    });

    return true;
  } catch (error) {
    console.error('Error adding member:', error);
    return false;
  }
};

export const leaveGroup = async (
  conversationId: string,
  user: { id: string; name: string }
) => {
  if (!db) return false;

  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      members: arrayRemove(user.id),
    });

    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId: 'system',
      senderName: 'System',
      content: `${user.name} left the group`,
      type: 'system',
      createdAt: serverTimestamp(),
      readBy: [],
      deliveredTo: [],
    });

    return true;
  } catch (error) {
    console.error('Error leaving group:', error);
    return false;
  }
};

// Alias for createGroupConversation with simpler signature
export const createGroup = async (
  creator: { id: string; name: string; avatar?: string; email?: string },
  groupName: string,
  groupDescription: string,
  memberIds: string[],
  memberDetails: { [key: string]: { name: string; avatar?: string; email?: string } }
): Promise<string | null> => {
  if (!db) return null;

  try {
    const unreadCount: { [key: string]: number } = {};
    memberIds.forEach(id => {
      unreadCount[id] = 0;
    });

    const convoRef = await addDoc(collection(db, 'conversations'), {
      type: 'group',
      name: groupName,
      description: groupDescription,
      icon: null,
      groupType: 'custom',
      members: memberIds,
      memberDetails,
      admins: [creator.id],
      unreadCount,
      createdAt: serverTimestamp(),
      createdBy: creator.id,
    });

    // Send system message
    await addDoc(collection(db, 'conversations', convoRef.id, 'messages'), {
      senderId: 'system',
      senderName: 'System',
      content: `${creator.name} created the group "${groupName}"`,
      type: 'system',
      createdAt: serverTimestamp(),
      readBy: [],
      deliveredTo: memberIds,
    });

    return convoRef.id;
  } catch (error) {
    console.error('Error creating group:', error);
    return null;
  }
};

export const updateGroupInfo = async (
  conversationId: string,
  updates: { name?: string; description?: string; icon?: string }
): Promise<boolean> => {
  if (!db) return false;

  try {
    const updateData: Record<string, string> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.icon !== undefined) updateData.icon = updates.icon;

    await updateDoc(doc(db, 'conversations', conversationId), updateData);
    return true;
  } catch (error) {
    console.error('Error updating group info:', error);
    return false;
  }
};

export const addGroupMember = async (
  conversationId: string,
  newMember: { id: string; name: string; avatar?: string; email?: string }
): Promise<boolean> => {
  if (!db) return false;

  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      members: arrayUnion(newMember.id),
      [`memberDetails.${newMember.id}`]: {
        name: newMember.name,
        avatar: newMember.avatar || null,
        email: newMember.email || '',
      },
      [`unreadCount.${newMember.id}`]: 0,
    });

    return true;
  } catch (error) {
    console.error('Error adding group member:', error);
    return false;
  }
};

export const removeGroupMember = async (
  conversationId: string,
  memberId: string,
  memberName: string
): Promise<boolean> => {
  if (!db) return false;

  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      members: arrayRemove(memberId),
      admins: arrayRemove(memberId),
    });

    // System message
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId: 'system',
      senderName: 'System',
      content: `${memberName} was removed from the group`,
      type: 'system',
      createdAt: serverTimestamp(),
      readBy: [],
      deliveredTo: [],
    });

    return true;
  } catch (error) {
    console.error('Error removing group member:', error);
    return false;
  }
};

export const promoteToAdmin = async (
  conversationId: string,
  memberId: string,
  memberName: string
): Promise<boolean> => {
  if (!db) return false;

  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      admins: arrayUnion(memberId),
    });

    // System message
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId: 'system',
      senderName: 'System',
      content: `${memberName} is now an admin`,
      type: 'system',
      createdAt: serverTimestamp(),
      readBy: [],
      deliveredTo: [],
    });

    return true;
  } catch (error) {
    console.error('Error promoting to admin:', error);
    return false;
  }
};

export const demoteFromAdmin = async (
  conversationId: string,
  memberId: string,
  memberName: string
): Promise<boolean> => {
  if (!db) return false;

  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      admins: arrayRemove(memberId),
    });

    // System message
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId: 'system',
      senderName: 'System',
      content: `${memberName} is no longer an admin`,
      type: 'system',
      createdAt: serverTimestamp(),
      readBy: [],
      deliveredTo: [],
    });

    return true;
  } catch (error) {
    console.error('Error demoting from admin:', error);
    return false;
  }
};

// ==================== MESSAGES ====================

export const sendMessage = async (
  conversationId: string,
  sender: { id: string; name: string; avatar?: string },
  content: string,
  type: 'text' | 'image' | 'file' = 'text',
  fileData?: { url: string; name: string; size: number; type: string },
  replyTo?: { messageId: string; senderName: string; content: string }
) => {
  if (!db) return null;

  try {
    const messageRef = await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar || null,
      content,
      type,
      fileUrl: fileData?.url || null,
      fileName: fileData?.name || null,
      fileSize: fileData?.size || null,
      fileType: fileData?.type || null,
      replyTo: replyTo || null,
      createdAt: serverTimestamp(),
      readBy: [sender.id],
      deliveredTo: [sender.id],
      reactions: {},
    });

    // Update conversation with last message
    const convoDoc = await getDoc(doc(db, 'conversations', conversationId));
    const members = convoDoc.data()?.members || [];
    const unreadUpdates: { [key: string]: any } = {};
    members.forEach((memberId: string) => {
      if (memberId !== sender.id) {
        unreadUpdates[`unreadCount.${memberId}`] = increment(1);
      }
    });

    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: type === 'text' ? content : (type === 'image' ? '📷 Image' : '📎 File'),
      lastMessageTime: serverTimestamp(),
      lastMessageSender: sender.name,
      lastMessageSenderId: sender.id,
      ...unreadUpdates,
    });

    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void,
  messageLimit: number = 100
) => {
  if (!db) return () => {};

  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(messageLimit)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      conversationId,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
    } as Message));
    callback(messages);
  });
};

export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  if (!db) return;

  try {
    // Update unread count
    await updateDoc(doc(db, 'conversations', conversationId), {
      [`unreadCount.${userId}`]: 0,
    });

    // Mark recent messages as read
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach(doc => {
      if (!doc.data().readBy?.includes(userId)) {
        batch.update(doc.ref, {
          readBy: arrayUnion(userId),
        });
      }
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// Alias for markMessagesAsRead
export const markAsRead = markMessagesAsRead;

export const addReaction = async (
  conversationId: string,
  messageId: string,
  userId: string,
  emoji: string
) => {
  if (!db) return;

  try {
    await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), {
      [`reactions.${emoji}`]: arrayUnion(userId),
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
  }
};

export const removeReaction = async (
  conversationId: string,
  messageId: string,
  userId: string,
  emoji: string
) => {
  if (!db) return;

  try {
    await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), {
      [`reactions.${emoji}`]: arrayRemove(userId),
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
  }
};

export const deleteMessage = async (conversationId: string, messageId: string): Promise<boolean> => {
  if (!db) return false;

  try {
    await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), {
      isDeleted: true,
      content: 'This message was deleted',
    });
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
};

// ==================== TYPING INDICATORS ====================

export const setTypingStatus = async (
  conversationId: string,
  userId: string,
  userName: string,
  isTyping: boolean
) => {
  if (!db) return;

  try {
    const typingRef = doc(db, 'conversations', conversationId, 'typing', userId);
    if (isTyping) {
      await setDoc(typingRef, {
        userName,
        isTyping: true,
        timestamp: serverTimestamp(),
      });
    } else {
      await deleteDoc(typingRef);
    }
  } catch (error) {
    console.error('Error setting typing status:', error);
  }
};

export const subscribeToTyping = (
  conversationId: string,
  currentUserId: string,
  callback: (typingUsers: { id: string; name: string }[]) => void
) => {
  if (!db) return () => {};

  return onSnapshot(
    collection(db, 'conversations', conversationId, 'typing'),
    (snapshot) => {
      const typingUsers = snapshot.docs
        .filter(doc => doc.id !== currentUserId)
        .map(doc => ({
          id: doc.id,
          name: doc.data().userName,
        }));
      callback(typingUsers);
    }
  );
};

// ==================== FILE UPLOAD ====================

export const uploadFile = async (
  file: File,
  conversationId: string,
  userId: string
): Promise<{ url: string; name: string; size: number; type: string } | null> => {
  if (!storage) return null;

  try {
    const fileRef = ref(storage, `chat/${conversationId}/${userId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    return {
      url,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

// ==================== HELPERS ====================

export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const formatLastSeen = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Active now';
  if (diffMins < 60) return `Active ${diffMins}m ago`;
  if (diffHours < 24) return `Active ${diffHours}h ago`;
  if (diffDays < 7) return `Active ${diffDays}d ago`;
  return `Last seen ${date.toLocaleDateString()}`;
};

export const getConversationName = (
  conversation: Conversation,
  currentUserId: string
): string => {
  if (conversation.type === 'group') {
    return conversation.name || 'Unnamed Group';
  }

  // For private chats, return the other person's name
  const otherMemberId = conversation.members.find(id => id !== currentUserId);
  if (otherMemberId && conversation.memberDetails[otherMemberId]) {
    return conversation.memberDetails[otherMemberId].name;
  }
  return 'Unknown';
};

export const getConversationAvatar = (
  conversation: Conversation,
  currentUserId: string
): string | undefined => {
  if (conversation.type === 'group') {
    return conversation.icon;
  }

  const otherMemberId = conversation.members.find(id => id !== currentUserId);
  if (otherMemberId && conversation.memberDetails[otherMemberId]) {
    return conversation.memberDetails[otherMemberId].avatar;
  }
  return undefined;
};

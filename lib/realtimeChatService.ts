import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
  arrayUnion,
  arrayRemove,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

// ==================== TYPES ====================

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  isOnline: boolean;
  lastSeen: Date;
  typing?: boolean;
  // Searchable fields
  department?: string;
  semester?: string;
  fastId?: string;
  searchTerms?: string[]; // For easier searching
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  read: boolean;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'direct' | 'group';
  members: string[];
  memberDetails: { [userId: string]: { name: string; avatar?: string } };
  lastMessage?: string;
  lastMessageTime?: Date;
  lastMessageSender?: string;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  createdBy: string;
  icon?: string;
}

export interface GroupMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: Date;
  readBy: string[];
  type: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  replyTo?: {
    messageId: string;
    senderName: string;
    content: string;
  };
}

// Helper to convert Firestore timestamp
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date();
};

// ==================== USER PRESENCE ====================

export const updateUserPresence = async (userId: string, isOnline: boolean) => {
  if (!db) return;
  
  const userRef = doc(db, 'userPresence', userId);
  await setDoc(userRef, {
    isOnline,
    lastSeen: serverTimestamp(),
  }, { merge: true });
};

export const subscribeToUserPresence = (
  userIds: string[],
  callback: (presence: { [userId: string]: { isOnline: boolean; lastSeen: Date } }) => void
) => {
  if (!db || userIds.length === 0) return () => {};
  
  const unsubscribes: (() => void)[] = [];
  const presenceData: { [userId: string]: { isOnline: boolean; lastSeen: Date } } = {};
  
  userIds.forEach(userId => {
    const userRef = doc(db!, 'userPresence', userId);
    const unsub = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        presenceData[userId] = {
          isOnline: data.isOnline || false,
          lastSeen: convertTimestamp(data.lastSeen),
        };
      } else {
        presenceData[userId] = { isOnline: false, lastSeen: new Date() };
      }
      callback({ ...presenceData });
    });
    unsubscribes.push(unsub);
  });
  
  return () => unsubscribes.forEach(unsub => unsub());
};

// ==================== TYPING INDICATORS ====================

export const setTypingStatus = async (roomId: string, userId: string, isTyping: boolean) => {
  if (!db) return;
  
  const typingRef = doc(db, 'chatRooms', roomId, 'typing', userId);
  if (isTyping) {
    await setDoc(typingRef, {
      isTyping: true,
      timestamp: serverTimestamp(),
    });
  } else {
    await deleteDoc(typingRef).catch(() => {});
  }
};

export const subscribeToTypingStatus = (
  roomId: string,
  currentUserId: string,
  callback: (typingUsers: string[]) => void
) => {
  if (!db) return () => {};
  
  const typingRef = collection(db, 'chatRooms', roomId, 'typing');
  
  return onSnapshot(typingRef, (snapshot) => {
    const typingUsers: string[] = [];
    const now = Date.now();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const timestamp = convertTimestamp(data.timestamp).getTime();
      // Only show typing if within last 10 seconds
      if (doc.id !== currentUserId && data.isTyping && (now - timestamp) < 10000) {
        typingUsers.push(doc.id);
      }
    });
    
    callback(typingUsers);
  });
};

// ==================== CHAT ROOMS ====================

export const createDirectChat = async (
  currentUser: { id: string; name: string; avatar?: string },
  otherUser: { id: string; name: string; avatar?: string }
) => {
  if (!db) throw new Error('Firebase not initialized');
  
  // Check if direct chat already exists
  const roomId = [currentUser.id, otherUser.id].sort().join('_');
  const existingRoom = await getDoc(doc(db, 'chatRooms', roomId));
  
  if (existingRoom.exists()) {
    return roomId;
  }
  
  // Create new direct chat
  await setDoc(doc(db, 'chatRooms', roomId), {
    type: 'direct',
    members: [currentUser.id, otherUser.id],
    memberDetails: {
      [currentUser.id]: { name: currentUser.name, avatar: currentUser.avatar },
      [otherUser.id]: { name: otherUser.name, avatar: otherUser.avatar },
    },
    unreadCount: {
      [currentUser.id]: 0,
      [otherUser.id]: 0,
    },
    createdAt: serverTimestamp(),
    createdBy: currentUser.id,
  });
  
  return roomId;
};

export const createGroupChat = async (
  name: string,
  description: string,
  creator: { id: string; name: string; avatar?: string },
  members: { id: string; name: string; avatar?: string }[]
) => {
  if (!db) throw new Error('Firebase not initialized');
  
  const memberIds = [creator.id, ...members.map(m => m.id)];
  const memberDetails: { [key: string]: { name: string; avatar?: string } } = {
    [creator.id]: { name: creator.name, avatar: creator.avatar },
  };
  const unreadCount: { [key: string]: number } = { [creator.id]: 0 };
  
  members.forEach(m => {
    memberDetails[m.id] = { name: m.name, avatar: m.avatar };
    unreadCount[m.id] = 0;
  });
  
  const roomRef = await addDoc(collection(db, 'chatRooms'), {
    name,
    description,
    type: 'group',
    members: memberIds,
    memberDetails,
    unreadCount,
    createdAt: serverTimestamp(),
    createdBy: creator.id,
  });
  
  // Add system message
  await addDoc(collection(db, 'chatRooms', roomRef.id, 'messages'), {
    senderId: 'system',
    senderName: 'System',
    content: `${creator.name} created the group "${name}"`,
    type: 'system',
    createdAt: serverTimestamp(),
    readBy: [],
  });
  
  return roomRef.id;
};

export const subscribeToChatRooms = (
  userId: string,
  callback: (rooms: ChatRoom[]) => void
) => {
  if (!db) return () => {};
  
  const q = query(
    collection(db, 'chatRooms'),
    where('members', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const rooms: ChatRoom[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
      lastMessageTime: doc.data().lastMessageTime ? convertTimestamp(doc.data().lastMessageTime) : undefined,
    } as ChatRoom));
    callback(rooms);
  }, (error) => {
    console.error('Error fetching chat rooms:', error);
    callback([]);
  });
};

// ==================== MESSAGES ====================

export const sendMessage = async (
  roomId: string,
  sender: { id: string; name: string; avatar?: string },
  content: string,
  type: 'text' | 'image' | 'file' = 'text',
  fileUrl?: string,
  fileName?: string,
  replyTo?: { messageId: string; senderName: string; content: string }
) => {
  if (!db) throw new Error('Firebase not initialized');
  
  const messageRef = await addDoc(collection(db, 'chatRooms', roomId, 'messages'), {
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    content,
    type,
    fileUrl: fileUrl || null,
    fileName: fileName || null,
    replyTo: replyTo || null,
    createdAt: serverTimestamp(),
    readBy: [sender.id],
  });
  
  // Update room's last message
  const roomRef = doc(db, 'chatRooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (roomSnap.exists()) {
    const roomData = roomSnap.data();
    const unreadCount = { ...roomData.unreadCount };
    
    // Increment unread count for all members except sender
    roomData.members.forEach((memberId: string) => {
      if (memberId !== sender.id) {
        unreadCount[memberId] = (unreadCount[memberId] || 0) + 1;
      }
    });
    
    await updateDoc(roomRef, {
      lastMessage: content,
      lastMessageTime: serverTimestamp(),
      lastMessageSender: sender.name,
      unreadCount,
    });
  }
  
  // Clear typing status
  await setTypingStatus(roomId, sender.id, false);
  
  return messageRef.id;
};

export const subscribeToMessages = (
  roomId: string,
  callback: (messages: GroupMessage[]) => void
) => {
  if (!db) return () => {};
  
  const q = query(
    collection(db, 'chatRooms', roomId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(100)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages: GroupMessage[] = snapshot.docs.map(doc => ({
      id: doc.id,
      roomId,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
    } as GroupMessage));
    callback(messages);
  });
};

export const markMessagesAsRead = async (roomId: string, userId: string) => {
  if (!db) return;
  
  // Update unread count
  const roomRef = doc(db, 'chatRooms', roomId);
  await updateDoc(roomRef, {
    [`unreadCount.${userId}`]: 0,
  });
  
  // Mark messages as read
  const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (!data.readBy?.includes(userId)) {
      batch.update(doc.ref, {
        readBy: arrayUnion(userId),
      });
    }
  });
  
  await batch.commit();
};

// ==================== USERS LIST ====================

export const subscribeToAllUsers = (
  currentUserId: string,
  callback: (users: ChatUser[]) => void
) => {
  if (!db) {
    console.error('Firestore db is not initialized');
    return () => {};
  }
  
  console.log('Subscribing to all users in Firestore...');
  const q = query(collection(db, 'users'));
  
  return onSnapshot(q, (snapshot) => {
    console.log('Users snapshot received, count:', snapshot.docs.length);
    const users: ChatUser[] = snapshot.docs
      .filter(doc => doc.id !== currentUserId)
      .map(doc => {
        const data = doc.data();
        console.log('User found:', doc.id, data.name, data.email);
        return {
          id: doc.id,
          ...data,
          lastSeen: convertTimestamp(data.lastSeen || new Date()),
        } as ChatUser;
      });
    console.log('Total users (excluding current):', users.length);
    callback(users);
  }, (error) => {
    console.error('Error fetching users:', error);
    callback([]);
  });
};

// Search users by name, email, department, semester, or FAST ID
export const searchUsers = async (
  searchQuery: string,
  currentUserId: string
): Promise<ChatUser[]> => {
  if (!db || !searchQuery.trim()) return [];
  
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  
  const query = searchQuery.toLowerCase().trim();
  
  const users: ChatUser[] = snapshot.docs
    .filter(doc => doc.id !== currentUserId)
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastSeen: convertTimestamp(doc.data().lastSeen || new Date()),
    } as ChatUser))
    .filter(user => {
      // Search by multiple fields
      const name = user.name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const department = user.department?.toLowerCase() || '';
      const semester = user.semester?.toLowerCase() || '';
      const fastId = user.fastId?.toLowerCase() || '';
      
      return (
        name.includes(query) ||
        email.includes(query) ||
        department.includes(query) ||
        semester.includes(query) ||
        fastId.includes(query)
      );
    });
  
  return users;
};

// Get users by department
export const getUsersByDepartment = async (
  department: string,
  currentUserId: string
): Promise<ChatUser[]> => {
  if (!db) return [];
  
  const q = query(
    collection(db, 'users'),
    where('department', '==', department)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs
    .filter(doc => doc.id !== currentUserId)
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastSeen: convertTimestamp(doc.data().lastSeen || new Date()),
    } as ChatUser));
};

// Get users by semester
export const getUsersBySemester = async (
  semester: string,
  currentUserId: string
): Promise<ChatUser[]> => {
  if (!db) return [];
  
  const q = query(
    collection(db, 'users'),
    where('semester', '==', semester)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs
    .filter(doc => doc.id !== currentUserId)
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastSeen: convertTimestamp(doc.data().lastSeen || new Date()),
    } as ChatUser));
};

export const registerUser = async (user: { 
  id: string; 
  name: string; 
  email: string; 
  avatar?: string;
  department?: string;
  semester?: string;
  fastId?: string;
}) => {
  if (!db) {
    console.error('Firestore db is not initialized in registerUser');
    return;
  }
  
  console.log('Registering user to Firestore:', user.id, user.name);
  
  // Create search terms for easier searching
  const searchTerms = [
    user.name.toLowerCase(),
    user.email.toLowerCase(),
    user.department?.toLowerCase(),
    user.semester?.toLowerCase(),
    user.fastId?.toLowerCase(),
  ].filter(Boolean) as string[];
  
  try {
    await setDoc(doc(db, 'users', user.id), {
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      department: user.department || null,
      semester: user.semester || null,
      fastId: user.fastId || null,
      searchTerms,
      isOnline: true,
      lastSeen: serverTimestamp(),
    }, { merge: true });
    console.log('User registered successfully in Firestore');
  } catch (error) {
    console.error('Error registering user:', error);
  }
};

// ==================== DELETE MESSAGE ====================

export const deleteMessage = async (roomId: string, messageId: string) => {
  if (!db) return;
  await deleteDoc(doc(db, 'chatRooms', roomId, 'messages', messageId));
};

// ==================== FORMAT HELPERS ====================

export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString();
};

export const formatLastSeen = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Online';
  if (diffMins < 60) return `Last seen ${diffMins} min ago`;
  if (diffHours < 24) return `Last seen ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `Last seen ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return `Last seen ${date.toLocaleDateString()}`;
};

// ==================== INITIALIZE DEFAULT GROUPS ====================

export const initializeDefaultGroups = async (userId: string, userName: string) => {
  if (!db) return;
  
  // Check if default groups exist
  const generalQuery = query(
    collection(db, 'chatRooms'),
    where('name', '==', 'General Chat'),
    where('type', '==', 'group')
  );
  
  const snapshot = await getDocs(generalQuery);
  
  if (snapshot.empty) {
    // Create default groups
    const defaultGroups = [
      { name: 'General Chat', description: 'General discussion for all students' },
      { name: 'Study Group', description: 'Collaborate and study together' },
      { name: 'Announcements', description: 'Important university announcements' },
    ];
    
    for (const group of defaultGroups) {
      await addDoc(collection(db, 'chatRooms'), {
        name: group.name,
        description: group.description,
        type: 'group',
        members: [userId],
        memberDetails: {
          [userId]: { name: userName },
        },
        unreadCount: { [userId]: 0 },
        createdAt: serverTimestamp(),
        createdBy: 'system',
      });
    }
    
    console.log('✅ Default chat groups initialized');
  }
};

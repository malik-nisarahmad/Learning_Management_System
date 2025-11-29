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
} from 'firebase/firestore';

// Types
export interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  icon?: string;
  createdAt: Date;
  createdBy: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  authorAvatar?: string;
  subreddit: string;
  subredditId: string;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  comments: number;
  createdAt: Date;
  imageUrl?: string;
  linkUrl?: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  author: string;
  authorId: string;
  authorAvatar?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  createdAt: Date;
  replies?: Comment[];
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

// ==================== COMMUNITIES ====================

export const getCommunitiesRef = () => {
  if (!db) throw new Error('Firebase not initialized');
  return collection(db, 'communities');
};

export const createCommunity = async (name: string, description: string, userId: string) => {
  if (!db) throw new Error('Firebase not initialized');
  
  const communityRef = await addDoc(collection(db, 'communities'), {
    name,
    description,
    members: 1,
    createdAt: serverTimestamp(),
    createdBy: userId,
  });
  
  return communityRef.id;
};

export const subscribeToCommunities = (callback: (communities: Community[]) => void) => {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }
  
  const q = query(collection(db, 'communities'), orderBy('members', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const communities: Community[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
    } as Community));
    callback(communities);
  });
};

export const joinCommunity = async (communityId: string) => {
  if (!db) throw new Error('Firebase not initialized');
  
  const communityRef = doc(db, 'communities', communityId);
  await updateDoc(communityRef, {
    members: increment(1),
  });
};

// ==================== POSTS ====================

export const createPost = async (
  title: string,
  content: string,
  author: string,
  authorId: string,
  subreddit: string,
  subredditId: string,
  imageUrl?: string,
  linkUrl?: string
) => {
  if (!db) throw new Error('Firebase not initialized');
  
  const postRef = await addDoc(collection(db, 'posts'), {
    title,
    content,
    author,
    authorId,
    subreddit,
    subredditId,
    upvotes: 1,
    downvotes: 0,
    upvotedBy: [authorId], // Auto-upvote by author
    downvotedBy: [],
    comments: 0,
    createdAt: serverTimestamp(),
    imageUrl: imageUrl || null,
    linkUrl: linkUrl || null,
  });
  
  return postRef.id;
};

export const subscribeToPosts = (
  subredditId: string | null,
  sortBy: 'hot' | 'new' | 'top' | 'rising',
  callback: (posts: Post[]) => void
) => {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }
  
  let q;
  
  // Build query based on subreddit and sort
  if (subredditId && subredditId !== 'all') {
    if (sortBy === 'new') {
      q = query(
        collection(db, 'posts'),
        where('subredditId', '==', subredditId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } else {
      // 'hot', 'top', 'rising' - sort by upvotes
      q = query(
        collection(db, 'posts'),
        where('subredditId', '==', subredditId),
        orderBy('upvotes', 'desc'),
        limit(50)
      );
    }
  } else {
    // All communities
    if (sortBy === 'new') {
      q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } else {
      q = query(
        collection(db, 'posts'),
        orderBy('upvotes', 'desc'),
        limit(50)
      );
    }
  }
  
  return onSnapshot(q, (snapshot) => {
    const posts: Post[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
    } as Post));
    callback(posts);
  });
};

export const upvotePost = async (postId: string, userId: string) => {
  if (!db) throw new Error('Firebase not initialized');
  
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) return;
  
  const postData = postSnap.data();
  const alreadyUpvoted = postData.upvotedBy?.includes(userId);
  const alreadyDownvoted = postData.downvotedBy?.includes(userId);
  
  if (alreadyUpvoted) {
    // Remove upvote
    await updateDoc(postRef, {
      upvotes: increment(-1),
      upvotedBy: arrayRemove(userId),
    });
  } else {
    // Add upvote
    const updates: any = {
      upvotes: increment(1),
      upvotedBy: arrayUnion(userId),
    };
    
    // Remove downvote if exists
    if (alreadyDownvoted) {
      updates.downvotes = increment(-1);
      updates.downvotedBy = arrayRemove(userId);
    }
    
    await updateDoc(postRef, updates);
  }
};

export const downvotePost = async (postId: string, userId: string) => {
  if (!db) throw new Error('Firebase not initialized');
  
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) return;
  
  const postData = postSnap.data();
  const alreadyUpvoted = postData.upvotedBy?.includes(userId);
  const alreadyDownvoted = postData.downvotedBy?.includes(userId);
  
  if (alreadyDownvoted) {
    // Remove downvote
    await updateDoc(postRef, {
      downvotes: increment(-1),
      downvotedBy: arrayRemove(userId),
    });
  } else {
    // Add downvote
    const updates: any = {
      downvotes: increment(1),
      downvotedBy: arrayUnion(userId),
    };
    
    // Remove upvote if exists
    if (alreadyUpvoted) {
      updates.upvotes = increment(-1);
      updates.upvotedBy = arrayRemove(userId);
    }
    
    await updateDoc(postRef, updates);
  }
};

// ==================== COMMENTS ====================

export const createComment = async (
  postId: string,
  parentId: string | null,
  content: string,
  author: string,
  authorId: string
) => {
  if (!db) throw new Error('Firebase not initialized');
  
  // Add comment
  const commentRef = await addDoc(collection(db, 'comments'), {
    postId,
    parentId,
    author,
    authorId,
    content,
    upvotes: 1,
    downvotes: 0,
    upvotedBy: [authorId],
    downvotedBy: [],
    createdAt: serverTimestamp(),
  });
  
  // Update post comment count
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    comments: increment(1),
  });
  
  return commentRef.id;
};

export const subscribeToComments = (
  postId: string,
  callback: (comments: Comment[]) => void
) => {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }
  
  const q = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const allComments: Comment[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
    } as Comment));
    
    // Build nested comment structure
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];
    
    // First pass: create map
    allComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    
    // Second pass: build tree
    allComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        } else {
          rootComments.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });
    
    callback(rootComments);
  });
};

export const upvoteComment = async (commentId: string, userId: string) => {
  if (!db) throw new Error('Firebase not initialized');
  
  const commentRef = doc(db, 'comments', commentId);
  const commentSnap = await getDoc(commentRef);
  
  if (!commentSnap.exists()) return;
  
  const commentData = commentSnap.data();
  const alreadyUpvoted = commentData.upvotedBy?.includes(userId);
  const alreadyDownvoted = commentData.downvotedBy?.includes(userId);
  
  if (alreadyUpvoted) {
    await updateDoc(commentRef, {
      upvotes: increment(-1),
      upvotedBy: arrayRemove(userId),
    });
  } else {
    const updates: any = {
      upvotes: increment(1),
      upvotedBy: arrayUnion(userId),
    };
    if (alreadyDownvoted) {
      updates.downvotes = increment(-1);
      updates.downvotedBy = arrayRemove(userId);
    }
    await updateDoc(commentRef, updates);
  }
};

export const downvoteComment = async (commentId: string, userId: string) => {
  if (!db) throw new Error('Firebase not initialized');
  
  const commentRef = doc(db, 'comments', commentId);
  const commentSnap = await getDoc(commentRef);
  
  if (!commentSnap.exists()) return;
  
  const commentData = commentSnap.data();
  const alreadyUpvoted = commentData.upvotedBy?.includes(userId);
  const alreadyDownvoted = commentData.downvotedBy?.includes(userId);
  
  if (alreadyDownvoted) {
    await updateDoc(commentRef, {
      downvotes: increment(-1),
      downvotedBy: arrayRemove(userId),
    });
  } else {
    const updates: any = {
      downvotes: increment(1),
      downvotedBy: arrayUnion(userId),
    };
    if (alreadyUpvoted) {
      updates.upvotes = increment(-1);
      updates.upvotedBy = arrayRemove(userId);
    }
    await updateDoc(commentRef, updates);
  }
};

// ==================== INITIALIZE DEFAULT DATA ====================

export const initializeDefaultCommunities = async () => {
  if (!db) return;
  
  const communitiesSnap = await getDocs(collection(db, 'communities'));
  
  if (communitiesSnap.empty) {
    const defaultCommunities = [
      { name: 'General Discussion', description: 'General topics and discussions', members: 245 },
      { name: 'Data Structures', description: 'CS201 - Data Structures discussions', members: 189 },
      { name: 'OOP Lab', description: 'CS102 - Object Oriented Programming', members: 156 },
      { name: 'Projects', description: 'Share and discuss projects', members: 98 },
      { name: 'Study Group', description: 'Find study partners', members: 134 },
      { name: 'Exam Prep', description: 'Exam preparation and tips', members: 312 },
    ];
    
    for (const community of defaultCommunities) {
      await addDoc(collection(db, 'communities'), {
        ...community,
        createdAt: serverTimestamp(),
        createdBy: 'system',
      });
    }
    
    console.log('✅ Default communities initialized');
  }
};

// Helper to format timestamp
export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

// Reddit/Facebook-style Discussion System
// Posts with comments, upvotes/downvotes, and reactions

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
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ==================== TYPES ====================

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorDepartment?: string;
  title: string;
  content: string;
  images?: string[];
  category: 'general' | 'question' | 'discussion' | 'announcement' | 'help' | 'resource';
  tags: string[];
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentId?: string; // For nested replies
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  replyCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

// Helper to convert Firestore timestamp
const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
};

// ==================== POSTS ====================

export const createPost = async (post: {
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorDepartment?: string;
  title: string;
  content: string;
  images?: string[];
  category: Post['category'];
  tags?: string[];
}) => {
  if (!db) return null;

  try {
    // Filter out undefined values to avoid Firebase errors
    const cleanPost: Record<string, unknown> = {};
    Object.entries(post).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanPost[key] = value;
      }
    });

    const postRef = await addDoc(collection(db, 'posts'), {
      ...cleanPost,
      tags: post.tags || [],
      upvotes: 0,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
      commentCount: 0,
      viewCount: 0,
      isPinned: false,
      isEdited: false,
      createdAt: serverTimestamp(),
    });

    return postRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
};

export const updatePost = async (
  postId: string,
  updates: { title?: string; content?: string; category?: Post['category']; tags?: string[] }
) => {
  if (!db) return false;

  try {
    await updateDoc(doc(db, 'posts', postId), {
      ...updates,
      isEdited: true,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating post:', error);
    return false;
  }
};

export const deletePost = async (postId: string) => {
  if (!db) return false;

  try {
    // Delete all comments for this post
    const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postId));
    const commentsSnapshot = await getDocs(commentsQuery);
    
    const deletePromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete the post
    await deleteDoc(doc(db, 'posts', postId));
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};

export const votePost = async (postId: string, odone: string, voteType: 'up' | 'down') => {
  if (!db) return false;

  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) return false;

    const data = postDoc.data();
    const hasUpvoted = data.upvotedBy?.includes(odone);
    const hasDownvoted = data.downvotedBy?.includes(odone);

    const updates: any = {};

    if (voteType === 'up') {
      if (hasUpvoted) {
        // Remove upvote
        updates.upvotes = increment(-1);
        updates.upvotedBy = arrayRemove(odone);
      } else {
        // Add upvote
        updates.upvotes = increment(1);
        updates.upvotedBy = arrayUnion(odone);
        
        // Remove downvote if exists
        if (hasDownvoted) {
          updates.downvotes = increment(-1);
          updates.downvotedBy = arrayRemove(odone);
        }
      }
    } else {
      if (hasDownvoted) {
        // Remove downvote
        updates.downvotes = increment(-1);
        updates.downvotedBy = arrayRemove(odone);
      } else {
        // Add downvote
        updates.downvotes = increment(1);
        updates.downvotedBy = arrayUnion(odone);
        
        // Remove upvote if exists
        if (hasUpvoted) {
          updates.upvotes = increment(-1);
          updates.upvotedBy = arrayRemove(odone);
        }
      }
    }

    await updateDoc(postRef, updates);
    return true;
  } catch (error) {
    console.error('Error voting on post:', error);
    return false;
  }
};

export const incrementViewCount = async (postId: string) => {
  if (!db) return;

  try {
    await updateDoc(doc(db, 'posts', postId), {
      viewCount: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

export const subscribeToPosts = (
  callback: (posts: Post[]) => void,
  options?: { category?: Post['category']; authorId?: string; limit?: number }
) => {
  if (!db) return () => {};

  let q = query(collection(db, 'posts'));

  // Note: Firestore requires indexes for multiple where clauses
  // We'll sort client-side to avoid index requirements
  
  return onSnapshot(
    q,
    (snapshot) => {
      let posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: doc.data().updatedAt ? convertTimestamp(doc.data().updatedAt) : undefined,
      } as Post));

      // Filter by category if specified
      if (options?.category) {
        posts = posts.filter(p => p.category === options.category);
      }

      // Filter by author if specified
      if (options?.authorId) {
        posts = posts.filter(p => p.authorId === options.authorId);
      }

      // Sort by pinned first, then by date (newest first)
      posts.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
      });

      // Apply limit if specified
      if (options?.limit) {
        posts = posts.slice(0, options.limit);
      }

      callback(posts);
    },
    (error) => {
      console.error('Error subscribing to posts:', error);
      callback([]);
    }
  );
};

export const getPost = async (postId: string): Promise<Post | null> => {
  if (!db) return null;

  try {
    const postDoc = await getDoc(doc(db, 'posts', postId));
    if (!postDoc.exists()) return null;

    return {
      id: postDoc.id,
      ...postDoc.data(),
      createdAt: convertTimestamp(postDoc.data().createdAt),
      updatedAt: postDoc.data().updatedAt ? convertTimestamp(postDoc.data().updatedAt) : undefined,
    } as Post;
  } catch (error) {
    console.error('Error getting post:', error);
    return null;
  }
};

// ==================== COMMENTS ====================

export const createComment = async (comment: {
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentId?: string;
}) => {
  if (!db) return null;

  try {
    // Filter out undefined values to avoid Firebase errors
    const cleanComment: Record<string, unknown> = {};
    Object.entries(comment).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanComment[key] = value;
      }
    });

    const commentRef = await addDoc(collection(db, 'comments'), {
      ...cleanComment,
      upvotes: 0,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
      replyCount: 0,
      isEdited: false,
      createdAt: serverTimestamp(),
    });

    // Update post comment count
    await updateDoc(doc(db, 'posts', comment.postId), {
      commentCount: increment(1),
    });

    // If this is a reply, update parent comment's reply count
    if (comment.parentId) {
      await updateDoc(doc(db, 'comments', comment.parentId), {
        replyCount: increment(1),
      });
    }

    return commentRef.id;
  } catch (error) {
    console.error('Error creating comment:', error);
    return null;
  }
};

export const updateComment = async (commentId: string, content: string) => {
  if (!db) return false;

  try {
    await updateDoc(doc(db, 'comments', commentId), {
      content,
      isEdited: true,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating comment:', error);
    return false;
  }
};

export const deleteComment = async (commentId: string, postId: string, parentId?: string) => {
  if (!db) return false;

  try {
    // Delete all replies to this comment
    const repliesQuery = query(collection(db, 'comments'), where('parentId', '==', commentId));
    const repliesSnapshot = await getDocs(repliesQuery);
    
    const deletePromises = repliesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete the comment
    await deleteDoc(doc(db, 'comments', commentId));

    // Update post comment count (including replies)
    await updateDoc(doc(db, 'posts', postId), {
      commentCount: increment(-(1 + repliesSnapshot.docs.length)),
    });

    // Update parent comment's reply count if this was a reply
    if (parentId) {
      await updateDoc(doc(db, 'comments', parentId), {
        replyCount: increment(-1),
      });
    }

    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

export const voteComment = async (commentId: string, odone: string, voteType: 'up' | 'down') => {
  if (!db) return false;

  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    
    if (!commentDoc.exists()) return false;

    const data = commentDoc.data();
    const hasUpvoted = data.upvotedBy?.includes(odone);
    const hasDownvoted = data.downvotedBy?.includes(odone);

    const updates: any = {};

    if (voteType === 'up') {
      if (hasUpvoted) {
        updates.upvotes = increment(-1);
        updates.upvotedBy = arrayRemove(odone);
      } else {
        updates.upvotes = increment(1);
        updates.upvotedBy = arrayUnion(odone);
        if (hasDownvoted) {
          updates.downvotes = increment(-1);
          updates.downvotedBy = arrayRemove(odone);
        }
      }
    } else {
      if (hasDownvoted) {
        updates.downvotes = increment(-1);
        updates.downvotedBy = arrayRemove(odone);
      } else {
        updates.downvotes = increment(1);
        updates.downvotedBy = arrayUnion(odone);
        if (hasUpvoted) {
          updates.upvotes = increment(-1);
          updates.upvotedBy = arrayRemove(odone);
        }
      }
    }

    await updateDoc(commentRef, updates);
    return true;
  } catch (error) {
    console.error('Error voting on comment:', error);
    return false;
  }
};

export const subscribeToComments = (
  postId: string,
  callback: (comments: Comment[]) => void
) => {
  if (!db) return () => {};

  const q = query(collection(db, 'comments'), where('postId', '==', postId));

  return onSnapshot(
    q,
    (snapshot) => {
      const allComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: doc.data().updatedAt ? convertTimestamp(doc.data().updatedAt) : undefined,
      } as Comment));

      // Sort by date (oldest first for proper threading)
      allComments.sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));

      callback(allComments);
    },
    (error) => {
      console.error('Error subscribing to comments:', error);
      callback([]);
    }
  );
};

// ==================== IMAGE UPLOAD ====================

export const uploadPostImage = async (file: File, odone: string): Promise<string | null> => {
  if (!storage) return null;

  try {
    const timestamp = Date.now();
    const fileName = `posts/${odone}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

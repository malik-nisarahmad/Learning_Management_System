// Real-time Study Materials System with Firebase
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
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

// Types
export interface Material {
  id: string;
  title: string;
  course: string;
  type: 'PDF' | 'Image' | 'Document';
  description: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  likes: number;
  likedBy: string[];
  views: number;
  downloads: number;
  category: string;
  documentUrl: string;
  documentPublicId?: string;
  tags?: string[];
  commentCount: number;
}

export interface MaterialComment {
  id: string;
  materialId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Timestamp | Date;
  likes: number;
  likedBy: string[];
  parentId?: string; // For nested replies
}

// Create a new material
export async function createMaterial(data: {
  title: string;
  course: string;
  type: 'PDF' | 'Image' | 'Document';
  description: string;
  category: string;
  documentUrl: string;
  documentPublicId?: string;
  tags?: string[];
  authorId: string;
  authorName: string;
  authorAvatar?: string;
}): Promise<string> {
  if (!db) throw new Error('Firebase not initialized');

  const materialData = {
    title: data.title,
    course: data.course,
    type: data.type,
    description: data.description,
    category: data.category,
    documentUrl: data.documentUrl,
    ...(data.documentPublicId && { documentPublicId: data.documentPublicId }),
    ...(data.tags && { tags: data.tags }),
    authorId: data.authorId,
    authorName: data.authorName,
    ...(data.authorAvatar && { authorAvatar: data.authorAvatar }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    likes: 0,
    likedBy: [],
    views: 0,
    downloads: 0,
    commentCount: 0,
  };

  const docRef = await addDoc(collection(db, 'materials'), materialData);
  return docRef.id;
}

// Subscribe to materials (real-time)
export function subscribeToMaterials(
  callback: (materials: Material[]) => void,
  options?: {
    category?: string;
    course?: string;
    authorId?: string;
  }
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  let q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));

  // Note: Firestore requires composite indexes for multiple where clauses
  // For simplicity, we'll filter client-side for category/course
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    let materials: Material[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Material[];

    // Client-side filtering
    if (options?.category && options.category !== 'all') {
      materials = materials.filter(m => m.category === options.category);
    }
    if (options?.course) {
      materials = materials.filter(m => m.course === options.course);
    }
    if (options?.authorId) {
      materials = materials.filter(m => m.authorId === options.authorId);
    }

    callback(materials);
  }, (error) => {
    console.error('Error subscribing to materials:', error);
  });

  return unsubscribe;
}

// Get single material
export async function getMaterial(materialId: string): Promise<Material | null> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db, 'materials', materialId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Material;
  }
  return null;
}

// Update material
export async function updateMaterial(
  materialId: string,
  data: Partial<Omit<Material, 'id' | 'authorId' | 'createdAt'>>
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db, 'materials', materialId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Delete material
export async function deleteMaterial(materialId: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  // Delete all comments first
  const commentsQuery = query(
    collection(db, 'materialComments'),
    where('materialId', '==', materialId)
  );
  const commentsSnap = await getDocs(commentsQuery);
  const deletePromises = commentsSnap.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // Delete the material
  await deleteDoc(doc(db, 'materials', materialId));
}

// Like/Unlike material
export async function toggleMaterialLike(
  materialId: string,
  userId: string,
  isCurrentlyLiked: boolean
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db, 'materials', materialId);
  
  if (isCurrentlyLiked) {
    await updateDoc(docRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId),
    });
  } else {
    await updateDoc(docRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId),
    });
  }
}

// Increment view count
export async function incrementViews(materialId: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db, 'materials', materialId);
  await updateDoc(docRef, {
    views: increment(1),
  });
}

// Increment download count
export async function incrementDownloads(materialId: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db, 'materials', materialId);
  await updateDoc(docRef, {
    downloads: increment(1),
  });
}

// Reset download count to zero
export async function resetDownloads(materialId: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db, 'materials', materialId);
  await updateDoc(docRef, {
    downloads: 0,
  });
}

// ========== COMMENTS ==========

// Create a comment
export async function createMaterialComment(data: {
  materialId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  parentId?: string;
}): Promise<string> {
  if (!db) throw new Error('Firebase not initialized');

  const commentData = {
    materialId: data.materialId,
    content: data.content,
    authorId: data.authorId,
    authorName: data.authorName,
    ...(data.authorAvatar && { authorAvatar: data.authorAvatar }),
    ...(data.parentId && { parentId: data.parentId }),
    createdAt: serverTimestamp(),
    likes: 0,
    likedBy: [],
  };

  const docRef = await addDoc(collection(db, 'materialComments'), commentData);

  // Increment comment count on material
  const materialRef = doc(db, 'materials', data.materialId);
  await updateDoc(materialRef, {
    commentCount: increment(1),
  });

  return docRef.id;
}

// Subscribe to comments for a material (real-time)
export function subscribeToMaterialComments(
  materialId: string,
  callback: (comments: MaterialComment[]) => void
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  const q = query(
    collection(db, 'materialComments'),
    where('materialId', '==', materialId),
    orderBy('createdAt', 'asc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const comments: MaterialComment[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MaterialComment[];

    callback(comments);
  }, (error) => {
    console.error('Error subscribing to comments:', error);
  });

  return unsubscribe;
}

// Delete comment
export async function deleteMaterialComment(
  commentId: string,
  materialId: string
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  await deleteDoc(doc(db, 'materialComments', commentId));

  // Decrement comment count
  const materialRef = doc(db, 'materials', materialId);
  await updateDoc(materialRef, {
    commentCount: increment(-1),
  });
}

// Like/Unlike comment
export async function toggleCommentLike(
  commentId: string,
  userId: string,
  isCurrentlyLiked: boolean
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db, 'materialComments', commentId);
  
  if (isCurrentlyLiked) {
    await updateDoc(docRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId),
    });
  } else {
    await updateDoc(docRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId),
    });
  }
}

// Helper to format time ago
export function formatTimeAgo(timestamp: Timestamp | Date | undefined): string {
  if (!timestamp) return 'Just now';
  
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  return date.toLocaleDateString();
}

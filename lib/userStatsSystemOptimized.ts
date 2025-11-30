// Optimized Real-time Quiz Scores & User Stats System with Firebase
// Uses caching and efficient queries to minimize reads/writes
import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
  getCountFromServer,
} from 'firebase/firestore';

// ========== CACHE SYSTEM ==========
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in ms
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 60000; // 1 minute default cache

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < entry.ttl) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

function invalidateCache(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

// ========== TYPES ==========
export interface QuizAttempt {
  id: string;
  oderId: string;
  userName: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: Timestamp | Date;
}

export interface UserStats {
  id: string;
  oderId: string;
  totalQuizzes: number;
  averageScore: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  bestScore: number;
  worstScore: number;
  totalTimeSpent: number;
  topicStats: Record<string, {
    attempts: number;
    averageScore: number;
    bestScore: number;
  }>;
  materialsViewed: number;
  materialsUploaded: number;
  materialsLiked: number;
  eventsRegistered: number;
  eventsAttended: number;
  discussionPosts: number;
  discussionReplies: number;
  lastActive: Timestamp | Date;
  streak: number;
  longestStreak: number;
  updatedAt: Timestamp | Date;
}

export interface DashboardStats {
  materialsCount: number;
  userQuizScore: number;
  discussionsCount: number;
  upcomingEventsCount: number;
  totalQuizzes: number;
  weeklyProgress: number;
}

// ========== QUIZ ATTEMPTS ==========

export async function saveQuizAttempt(data: {
  oderId: string;
  userName: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
}): Promise<string> {
  if (!db) throw new Error('Firebase not initialized');

  const attemptData = {
    oderId: data.oderId,
    userName: data.userName,
    topic: data.topic,
    difficulty: data.difficulty,
    score: data.score,
    totalQuestions: data.totalQuestions,
    correctAnswers: data.correctAnswers,
    timeSpent: data.timeSpent,
    completedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'quizAttempts'), attemptData);
  
  // Update user stats (single write instead of read+write)
  await updateUserQuizStats(data.oderId, data);
  
  // Invalidate cache
  invalidateCache(`quiz_${data.oderId}`);
  invalidateCache('dashboard_');
  
  return docRef.id;
}

async function updateUserQuizStats(oderId: string, quizData: {
  topic: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
}): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const statsRef = doc(db, 'userStats', oderId);
  const statsSnap = await getDoc(statsRef);

  if (statsSnap.exists()) {
    const currentStats = statsSnap.data() as UserStats;
    const newTotalQuizzes = currentStats.totalQuizzes + 1;
    const newTotalCorrect = currentStats.totalCorrectAnswers + quizData.correctAnswers;
    const newTotalQuestions = currentStats.totalQuestions + quizData.totalQuestions;
    const newAverageScore = Math.round(
      ((currentStats.averageScore * currentStats.totalQuizzes) + quizData.score) / newTotalQuizzes
    );

    const topicStats = currentStats.topicStats || {};
    const currentTopicStats = topicStats[quizData.topic] || { attempts: 0, averageScore: 0, bestScore: 0 };
    const newTopicAttempts = currentTopicStats.attempts + 1;
    const newTopicAverage = Math.round(
      ((currentTopicStats.averageScore * currentTopicStats.attempts) + quizData.score) / newTopicAttempts
    );

    topicStats[quizData.topic] = {
      attempts: newTopicAttempts,
      averageScore: newTopicAverage,
      bestScore: Math.max(currentTopicStats.bestScore, quizData.score),
    };

    await updateDoc(statsRef, {
      totalQuizzes: newTotalQuizzes,
      averageScore: newAverageScore,
      totalCorrectAnswers: newTotalCorrect,
      totalQuestions: newTotalQuestions,
      bestScore: Math.max(currentStats.bestScore, quizData.score),
      worstScore: Math.min(currentStats.worstScore, quizData.score),
      totalTimeSpent: currentStats.totalTimeSpent + quizData.timeSpent,
      topicStats,
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    const topicStats: Record<string, { attempts: number; averageScore: number; bestScore: number }> = {};
    topicStats[quizData.topic] = {
      attempts: 1,
      averageScore: quizData.score,
      bestScore: quizData.score,
    };

    await setDoc(statsRef, {
      oderId,
      totalQuizzes: 1,
      averageScore: quizData.score,
      totalCorrectAnswers: quizData.correctAnswers,
      totalQuestions: quizData.totalQuestions,
      bestScore: quizData.score,
      worstScore: quizData.score,
      totalTimeSpent: quizData.timeSpent,
      topicStats,
      materialsViewed: 0,
      materialsUploaded: 0,
      materialsLiked: 0,
      eventsRegistered: 0,
      eventsAttended: 0,
      discussionPosts: 0,
      discussionReplies: 0,
      lastActive: serverTimestamp(),
      streak: 1,
      longestStreak: 1,
      updatedAt: serverTimestamp(),
    });
  }
}

// Get user's quiz attempts with caching
export function subscribeToUserQuizAttempts(
  oderId: string,
  callback: (attempts: QuizAttempt[]) => void,
  limitCount: number = 5
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  // Check cache first
  const cacheKey = `quiz_${oderId}_${limitCount}`;
  const cached = getCached<QuizAttempt[]>(cacheKey);
  if (cached) {
    callback(cached);
  }

  // Simple query without compound index requirement
  const q = query(
    collection(db, 'quizAttempts'),
    where('oderId', '==', oderId),
    limit(limitCount)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const attempts: QuizAttempt[] = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as QuizAttempt[];

    // Sort client-side to avoid index
    attempts.sort((a, b) => {
      const dateA = a.completedAt instanceof Date ? a.completedAt : a.completedAt?.toDate?.() || new Date(0);
      const dateB = b.completedAt instanceof Date ? b.completedAt : b.completedAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    setCache(cacheKey, attempts);
    callback(attempts);
  });

  return unsubscribe;
}

// ========== USER STATS ==========

export async function getUserStats(oderId: string): Promise<UserStats | null> {
  if (!db) throw new Error('Firebase not initialized');

  const cacheKey = `userStats_${oderId}`;
  const cached = getCached<UserStats>(cacheKey);
  if (cached) return cached;

  const statsRef = doc(db, 'userStats', oderId);
  const statsSnap = await getDoc(statsRef);

  if (statsSnap.exists()) {
    const stats = { id: statsSnap.id, ...statsSnap.data() } as UserStats;
    setCache(cacheKey, stats, 30000); // 30 second cache
    return stats;
  }
  return null;
}

export function subscribeToUserStats(
  oderId: string,
  callback: (stats: UserStats | null) => void
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  const statsRef = doc(db, 'userStats', oderId);

  const unsubscribe = onSnapshot(statsRef, (snapshot) => {
    if (snapshot.exists()) {
      const stats = { id: snapshot.id, ...snapshot.data() } as UserStats;
      setCache(`userStats_${oderId}`, stats, 30000);
      callback(stats);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}

export async function initializeUserStats(oderId: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const statsRef = doc(db, 'userStats', oderId);
  const statsSnap = await getDoc(statsRef);

  if (!statsSnap.exists()) {
    await setDoc(statsRef, {
      oderId,
      totalQuizzes: 0,
      averageScore: 0,
      totalCorrectAnswers: 0,
      totalQuestions: 0,
      bestScore: 0,
      worstScore: 100,
      totalTimeSpent: 0,
      topicStats: {},
      materialsViewed: 0,
      materialsUploaded: 0,
      materialsLiked: 0,
      eventsRegistered: 0,
      eventsAttended: 0,
      discussionPosts: 0,
      discussionReplies: 0,
      lastActive: serverTimestamp(),
      streak: 0,
      longestStreak: 0,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function incrementUserStat(
  oderId: string,
  stat: 'materialsViewed' | 'materialsUploaded' | 'materialsLiked' | 'eventsRegistered' | 'eventsAttended' | 'discussionPosts' | 'discussionReplies',
  value: number = 1
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const statsRef = doc(db, 'userStats', oderId);
  
  try {
    await updateDoc(statsRef, {
      [stat]: increment(value),
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // If doc doesn't exist, create it
    await initializeUserStats(oderId);
    await updateDoc(statsRef, {
      [stat]: increment(value),
    });
  }
  
  invalidateCache(`userStats_${oderId}`);
}

// ========== OPTIMIZED DASHBOARD STATS ==========

// Single subscription for dashboard - much more efficient
export function subscribeToDashboardStats(
  oderId: string,
  callback: (stats: DashboardStats) => void
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  // Check cache first for immediate response
  const cacheKey = `dashboard_${oderId}`;
  const cached = getCached<DashboardStats>(cacheKey);
  if (cached) {
    callback(cached);
  }

  // Only subscribe to user stats - this is the only real-time data needed
  // Other counts can be fetched once and cached
  const statsRef = doc(db, 'userStats', oderId);
  
  let materialsCount = 0;
  let upcomingEventsCount = 0;
  let countsLoaded = false;

  // Fetch counts once (not real-time) to reduce reads
  const loadCounts = async () => {
    if (countsLoaded) return;
    
    try {
      // Use getCountFromServer for efficient counting (doesn't download all docs)
      const materialsCountSnap = await getCountFromServer(collection(db, 'materials'));
      materialsCount = materialsCountSnap.data().count;

      // For events, we need to filter, so get docs but only once
      const today = new Date().toISOString().split('T')[0];
      const eventsSnap = await getDocs(collection(db, 'events'));
      upcomingEventsCount = eventsSnap.docs.filter(doc => {
        const data = doc.data();
        return data.date >= today && data.isPublished !== false;
      }).length;

      countsLoaded = true;
    } catch (error) {
      console.error('Error loading counts:', error);
      materialsCount = 0;
      upcomingEventsCount = 0;
    }
  };

  loadCounts();

  const unsubscribe = onSnapshot(statsRef, (snapshot) => {
    let userQuizScore = 0;
    let totalQuizzes = 0;
    let discussionsCount = 0;

    if (snapshot.exists()) {
      const data = snapshot.data();
      userQuizScore = data.averageScore || 0;
      totalQuizzes = data.totalQuizzes || 0;
      discussionsCount = data.discussionPosts || 0;
    }

    const weeklyProgress = Math.min(100, Math.round((totalQuizzes / 5) * 100));
    
    const stats: DashboardStats = {
      materialsCount,
      userQuizScore,
      discussionsCount,
      upcomingEventsCount,
      totalQuizzes,
      weeklyProgress,
    };

    setCache(cacheKey, stats, 30000);
    callback(stats);
  });

  return unsubscribe;
}

// ========== TOP MATERIALS (with caching) ==========

let topMaterialsCache: { id: string; title: string; course: string; likes: number; views: number; authorName: string }[] = [];
let topMaterialsUnsubscribe: (() => void) | null = null;
let topMaterialsListeners: ((materials: typeof topMaterialsCache) => void)[] = [];

export function subscribeToTopMaterials(
  callback: (materials: { id: string; title: string; course: string; likes: number; views: number; authorName: string }[]) => void,
  limitCount: number = 5
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  // Return cached data immediately if available
  if (topMaterialsCache.length > 0) {
    callback(topMaterialsCache.slice(0, limitCount));
  }

  // Add to listeners
  topMaterialsListeners.push(callback);

  // Only create one subscription for all listeners (singleton pattern)
  if (!topMaterialsUnsubscribe) {
    const q = query(
      collection(db, 'materials'),
      orderBy('likes', 'desc'),
      limit(10) // Fetch a bit more to serve different limit requests
    );

    topMaterialsUnsubscribe = onSnapshot(q, (snapshot) => {
      topMaterialsCache = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          course: data.course,
          likes: data.likes || 0,
          views: data.views || 0,
          authorName: data.authorName || 'Unknown',
        };
      });

      // Notify all listeners
      topMaterialsListeners.forEach(listener => {
        listener(topMaterialsCache.slice(0, limitCount));
      });
    });
  }

  // Return cleanup function
  return () => {
    topMaterialsListeners = topMaterialsListeners.filter(l => l !== callback);
    
    // If no more listeners, unsubscribe from Firebase
    if (topMaterialsListeners.length === 0 && topMaterialsUnsubscribe) {
      topMaterialsUnsubscribe();
      topMaterialsUnsubscribe = null;
    }
  };
}

// ========== LEADERBOARD ==========

export function subscribeToLeaderboard(
  callback: (leaderboard: { oderId: string; userName: string; averageScore: number; totalQuizzes: number }[]) => void,
  limitCount: number = 10
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  // Simple query - sort client side to avoid compound index
  const q = query(
    collection(db, 'userStats'),
    where('totalQuizzes', '>', 0),
    limit(limitCount * 2) // Get more and filter/sort client side
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const leaderboard = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          oderId: doc.id,
          userName: 'User',
          averageScore: data.averageScore || 0,
          totalQuizzes: data.totalQuizzes || 0,
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, limitCount);

    callback(leaderboard);
  });

  return unsubscribe;
}

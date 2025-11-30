// Optimized Firebase queries with caching to reduce reads/writes
import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
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
  ttl: number; // Time to live in ms
}

class FirebaseCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  
  // Default TTL: 5 minutes for counts, 1 minute for user-specific data
  private readonly DEFAULT_COUNT_TTL = 5 * 60 * 1000;
  private readonly DEFAULT_USER_TTL = 60 * 1000;
  
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_COUNT_TTL,
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const firebaseCache = new FirebaseCache();

// ========== OPTIMIZED COUNTS ==========

// Get count using getCountFromServer (more efficient than fetching all docs)
export async function getCollectionCount(collectionName: string): Promise<number> {
  const cacheKey = `count_${collectionName}`;
  const cached = firebaseCache.get<number>(cacheKey);
  if (cached !== null) return cached;
  
  if (!db) return 0;
  
  try {
    const coll = collection(db, collectionName);
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;
    firebaseCache.set(cacheKey, count);
    return count;
  } catch (error) {
    console.error(`Error getting count for ${collectionName}:`, error);
    return 0;
  }
}

// Get count with query conditions
export async function getFilteredCount(
  collectionName: string,
  field: string,
  operator: '==' | '>' | '<' | '>=' | '<=' | '!=',
  value: unknown
): Promise<number> {
  const cacheKey = `count_${collectionName}_${field}_${operator}_${value}`;
  const cached = firebaseCache.get<number>(cacheKey);
  if (cached !== null) return cached;
  
  if (!db) return 0;
  
  try {
    const q = query(collection(db, collectionName), where(field, operator as never, value));
    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;
    firebaseCache.set(cacheKey, count);
    return count;
  } catch (error) {
    console.error(`Error getting filtered count:`, error);
    return 0;
  }
}

// ========== OPTIMIZED DASHBOARD STATS ==========

export interface DashboardStats {
  materialsCount: number;
  userQuizScore: number;
  discussionsCount: number;
  upcomingEventsCount: number;
  totalQuizzes: number;
  weeklyProgress: number;
}

// Get dashboard stats with caching (non-realtime, much more efficient)
export async function getDashboardStatsOptimized(userId: string): Promise<DashboardStats> {
  const cacheKey = `dashboard_${userId}`;
  const cached = firebaseCache.get<DashboardStats>(cacheKey);
  if (cached !== null) return cached;
  
  if (!db) {
    return {
      materialsCount: 0,
      userQuizScore: 0,
      discussionsCount: 0,
      upcomingEventsCount: 0,
      totalQuizzes: 0,
      weeklyProgress: 0,
    };
  }
  
  try {
    // Use parallel requests for efficiency
    const [materialsCount, userStats, upcomingEventsCount] = await Promise.all([
      getCollectionCount('materials'),
      getUserStatsOptimized(userId),
      getUpcomingEventsCount(),
    ]);
    
    const stats: DashboardStats = {
      materialsCount,
      userQuizScore: userStats?.averageScore || 0,
      discussionsCount: userStats?.discussionPosts || 0,
      upcomingEventsCount,
      totalQuizzes: userStats?.totalQuizzes || 0,
      weeklyProgress: Math.min(100, Math.round(((userStats?.totalQuizzes || 0) / 5) * 100)),
    };
    
    // Cache for 1 minute
    firebaseCache.set(cacheKey, stats, 60 * 1000);
    return stats;
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      materialsCount: 0,
      userQuizScore: 0,
      discussionsCount: 0,
      upcomingEventsCount: 0,
      totalQuizzes: 0,
      weeklyProgress: 0,
    };
  }
}

// Get upcoming events count
async function getUpcomingEventsCount(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  return getFilteredCount('events', 'date', '>=', today);
}

// ========== OPTIMIZED USER STATS ==========

export interface UserStats {
  id: string;
  userId: string;
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

// Get user stats with caching
export async function getUserStatsOptimized(userId: string): Promise<UserStats | null> {
  const cacheKey = `userStats_${userId}`;
  const cached = firebaseCache.get<UserStats>(cacheKey);
  if (cached !== null) return cached;
  
  if (!db) return null;
  
  try {
    const statsRef = doc(db, 'userStats', userId);
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      const stats = { id: statsSnap.id, ...statsSnap.data() } as UserStats;
      firebaseCache.set(cacheKey, stats, 60 * 1000); // Cache for 1 minute
      return stats;
    }
    return null;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
}

// ========== OPTIMIZED QUIZ ATTEMPTS ==========

export interface QuizAttempt {
  id: string;
  userId: string;
  userName: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: Timestamp | Date;
}

// Get recent quiz attempts with limit (efficient)
export async function getRecentQuizAttempts(
  userId: string,
  limitCount: number = 5
): Promise<QuizAttempt[]> {
  const cacheKey = `quizAttempts_${userId}_${limitCount}`;
  const cached = firebaseCache.get<QuizAttempt[]>(cacheKey);
  if (cached !== null) return cached;
  
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, 'quizAttempts'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const attempts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as QuizAttempt[];
    
    firebaseCache.set(cacheKey, attempts, 30 * 1000); // Cache for 30 seconds
    return attempts;
  } catch (error) {
    console.error('Error getting quiz attempts:', error);
    return [];
  }
}

// ========== OPTIMIZED MATERIALS ==========

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

// Get materials with limit (for initial load)
export async function getMaterialsOptimized(limitCount: number = 20): Promise<Material[]> {
  const cacheKey = `materials_${limitCount}`;
  const cached = firebaseCache.get<Material[]>(cacheKey);
  if (cached !== null) return cached;
  
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, 'materials'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const materials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Material[];
    
    firebaseCache.set(cacheKey, materials, 60 * 1000); // Cache for 1 minute
    return materials;
  } catch (error) {
    console.error('Error getting materials:', error);
    return [];
  }
}

// ========== OPTIMIZED EVENTS ==========

export type EventCategory = 'Academic' | 'Social' | 'Workshop' | 'Seminar' | 'Exam' | 'Holiday' | 'Sports' | 'Cultural';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  category: EventCategory;
  organizerId: string;
  organizerName: string;
  organizerSociety?: string;
  societyId?: string;
  attendees: string[];
  attendeeCount: number;
  maxAttendees?: number;
  registrationLink?: string;
  imageUrl?: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  isPublished: boolean;
  isFeatured: boolean;
  tags?: string[];
}

// Get upcoming events with limit
export async function getUpcomingEventsOptimized(limitCount: number = 10): Promise<Event[]> {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `events_upcoming_${limitCount}`;
  const cached = firebaseCache.get<Event[]>(cacheKey);
  if (cached !== null) return cached;
  
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, 'events'),
      where('isPublished', '==', true),
      where('date', '>=', today),
      orderBy('date', 'asc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
    
    firebaseCache.set(cacheKey, events, 2 * 60 * 1000); // Cache for 2 minutes
    return events;
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
}

// ========== SINGLE LIGHTWEIGHT SUBSCRIPTION ==========

// This creates ONE subscription for dashboard updates instead of 5 separate ones
// It only tracks counts, not full documents
export function subscribeToLightweightDashboard(
  userId: string,
  callback: (stats: DashboardStats) => void
): () => void {
  if (!db) {
    callback({
      materialsCount: 0,
      userQuizScore: 0,
      discussionsCount: 0,
      upcomingEventsCount: 0,
      totalQuizzes: 0,
      weeklyProgress: 0,
    });
    return () => {};
  }
  
  // Only subscribe to user's own stats document (1 document read)
  const statsRef = doc(db, 'userStats', userId);
  
  let hasLoadedInitial = false;
  
  const unsubscribe = onSnapshot(statsRef, async (statsSnap) => {
    // Get counts only on initial load or every 5 minutes
    if (!hasLoadedInitial) {
      hasLoadedInitial = true;
      
      // Load dashboard stats (cached)
      const stats = await getDashboardStatsOptimized(userId);
      callback(stats);
    } else {
      // On updates to user stats, just update the user-specific values
      const cached = firebaseCache.get<DashboardStats>(`dashboard_${userId}`);
      if (cached && statsSnap.exists()) {
        const userData = statsSnap.data();
        const updatedStats: DashboardStats = {
          ...cached,
          userQuizScore: userData.averageScore || 0,
          totalQuizzes: userData.totalQuizzes || 0,
          discussionsCount: userData.discussionPosts || 0,
          weeklyProgress: Math.min(100, Math.round(((userData.totalQuizzes || 0) / 5) * 100)),
        };
        firebaseCache.set(`dashboard_${userId}`, updatedStats, 60 * 1000);
        callback(updatedStats);
      }
    }
  }, (error) => {
    console.error('Dashboard subscription error:', error);
  });
  
  return unsubscribe;
}

// ========== REFRESH FUNCTIONS ==========

// Force refresh dashboard stats (invalidate cache)
export async function refreshDashboardStats(userId: string): Promise<DashboardStats> {
  firebaseCache.invalidate(`dashboard_${userId}`);
  firebaseCache.invalidatePattern('count_');
  return getDashboardStatsOptimized(userId);
}

// Invalidate caches when data changes
export function invalidateMaterialsCache(): void {
  firebaseCache.invalidatePattern('materials');
  firebaseCache.invalidatePattern('count_materials');
}

export function invalidateEventsCache(): void {
  firebaseCache.invalidatePattern('events');
  firebaseCache.invalidatePattern('count_events');
}

export function invalidateUserStatsCache(userId: string): void {
  firebaseCache.invalidate(`userStats_${userId}`);
  firebaseCache.invalidate(`dashboard_${userId}`);
  firebaseCache.invalidatePattern(`quizAttempts_${userId}`);
}

// ========== BATCH OPERATIONS ==========

// Initialize user stats only if doesn't exist (prevents unnecessary writes)
export async function ensureUserStatsExist(userId: string): Promise<void> {
  if (!db) return;
  
  const statsRef = doc(db, 'userStats', userId);
  const statsSnap = await getDoc(statsRef);
  
  if (!statsSnap.exists()) {
    await setDoc(statsRef, {
      userId,
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

// ========== DEBOUNCED STAT INCREMENT ==========

// Debounce stat increments to batch them
const pendingIncrements: Map<string, Map<string, number>> = new Map();
let incrementTimeout: NodeJS.Timeout | null = null;

export function debouncedIncrement(
  userId: string,
  stat: 'materialsViewed' | 'materialsUploaded' | 'materialsLiked' | 'eventsRegistered' | 'eventsAttended' | 'discussionPosts' | 'discussionReplies',
  value: number = 1
): void {
  if (!pendingIncrements.has(userId)) {
    pendingIncrements.set(userId, new Map());
  }
  
  const userIncrements = pendingIncrements.get(userId)!;
  const currentValue = userIncrements.get(stat) || 0;
  userIncrements.set(stat, currentValue + value);
  
  // Debounce: flush after 2 seconds of no new increments
  if (incrementTimeout) {
    clearTimeout(incrementTimeout);
  }
  
  incrementTimeout = setTimeout(flushIncrements, 2000);
}

async function flushIncrements(): Promise<void> {
  if (!db) return;
  
  for (const [userId, increments] of pendingIncrements.entries()) {
    if (increments.size === 0) continue;
    
    try {
      const statsRef = doc(db, 'userStats', userId);
      const updates: Record<string, unknown> = {
        lastActive: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      for (const [stat, value] of increments.entries()) {
        updates[stat] = increment(value);
      }
      
      await updateDoc(statsRef, updates);
      
      // Invalidate cache
      invalidateUserStatsCache(userId);
    } catch (error) {
      console.error('Error flushing increments for user:', userId, error);
    }
  }
  
  pendingIncrements.clear();
}

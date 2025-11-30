// Real-time Quiz Scores & User Stats System with Firebase
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
} from 'firebase/firestore';

// Types
export interface QuizAttempt {
  id: string;
  userId: string;
  userName: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  completedAt: Timestamp | Date;
}

export interface UserStats {
  id: string;
  userId: string;
  totalQuizzes: number;
  averageScore: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  bestScore: number;
  worstScore: number;
  totalTimeSpent: number; // in seconds
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
  streak: number; // consecutive days active
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

// Save quiz attempt
export async function saveQuizAttempt(data: {
  userId: string;
  userName: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
}): Promise<string> {
  if (!db) throw new Error('Firebase not initialized');

  // Save the attempt
  const attemptData = {
    userId: data.userId,
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

  // Update user stats
  await updateUserQuizStats(data.userId, data);

  return docRef.id;
}

// Update user quiz stats
async function updateUserQuizStats(userId: string, quizData: {
  topic: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
}): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const statsRef = doc(db, 'userStats', userId);
  const statsSnap = await getDoc(statsRef);

  if (statsSnap.exists()) {
    const currentStats = statsSnap.data() as UserStats;
    const newTotalQuizzes = currentStats.totalQuizzes + 1;
    const newTotalCorrect = currentStats.totalCorrectAnswers + quizData.correctAnswers;
    const newTotalQuestions = currentStats.totalQuestions + quizData.totalQuestions;
    const newAverageScore = Math.round(
      ((currentStats.averageScore * currentStats.totalQuizzes) + quizData.score) / newTotalQuizzes
    );

    // Update topic stats
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
    // Create new stats document
    const topicStats: Record<string, { attempts: number; averageScore: number; bestScore: number }> = {};
    topicStats[quizData.topic] = {
      attempts: 1,
      averageScore: quizData.score,
      bestScore: quizData.score,
    };

    await setDoc(statsRef, {
      userId: userId,
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

// Get user's quiz attempts
export function subscribeToUserQuizAttempts(
  userId: string,
  callback: (attempts: QuizAttempt[]) => void,
  limitCount: number = 10
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  const q = query(
    collection(db, 'quizAttempts'),
    where('userId', '==', userId),
    orderBy('completedAt', 'desc'),
    limit(limitCount)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const attempts: QuizAttempt[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QuizAttempt[];

    callback(attempts);
  });

  return unsubscribe;
}

// ========== USER STATS ==========

// Get user stats
export async function getUserStats(userId: string): Promise<UserStats | null> {
  if (!db) throw new Error('Firebase not initialized');

  const statsRef = doc(db, 'userStats', userId);
  const statsSnap = await getDoc(statsRef);

  if (statsSnap.exists()) {
    return { id: statsSnap.id, ...statsSnap.data() } as UserStats;
  }
  return null;
}

// Subscribe to user stats (real-time)
export function subscribeToUserStats(
  userId: string,
  callback: (stats: UserStats | null) => void
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  const statsRef = doc(db, 'userStats', userId);

  const unsubscribe = onSnapshot(statsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as UserStats);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}

// Initialize user stats (call when user first signs up)
export async function initializeUserStats(userId: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const statsRef = doc(db, 'userStats', userId);
  const statsSnap = await getDoc(statsRef);

  if (!statsSnap.exists()) {
    await setDoc(statsRef, {
      userId: userId,
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

// Update specific stat
export async function incrementUserStat(
  userId: string,
  stat: 'materialsViewed' | 'materialsUploaded' | 'materialsLiked' | 'eventsRegistered' | 'eventsAttended' | 'discussionPosts' | 'discussionReplies',
  value: number = 1
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const statsRef = doc(db, 'userStats', userId);
  const statsSnap = await getDoc(statsRef);

  if (statsSnap.exists()) {
    await updateDoc(statsRef, {
      [stat]: increment(value),
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Initialize stats first
    await initializeUserStats(userId);
    await updateDoc(statsRef, {
      [stat]: increment(value),
    });
  }
}

// ========== DASHBOARD STATS ==========

// Get dashboard stats for a user
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  if (!db) throw new Error('Firebase not initialized');

  // Get materials count
  const materialsSnap = await getDocs(collection(db, 'materials'));
  const materialsCount = materialsSnap.size;

  // Get user's quiz score
  const userStats = await getUserStats(userId);
  const userQuizScore = userStats?.averageScore || 0;
  const totalQuizzes = userStats?.totalQuizzes || 0;

  // Get discussions count (user's posts)
  const discussionsQuery = query(
    collection(db, 'discussions'),
    where('authorId', '==', userId)
  );
  const discussionsSnap = await getDocs(discussionsQuery);
  const discussionsCount = discussionsSnap.size;

  // Get upcoming events count
  const today = new Date().toISOString().split('T')[0];
  const eventsSnap = await getDocs(collection(db, 'events'));
  const upcomingEventsCount = eventsSnap.docs.filter(doc => {
    const data = doc.data();
    return data.date >= today;
  }).length;

  // Calculate weekly progress (simple: quizzes this week / 5 goal)
  const weeklyProgress = Math.min(100, Math.round((totalQuizzes / 5) * 100));

  return {
    materialsCount,
    userQuizScore,
    discussionsCount,
    upcomingEventsCount,
    totalQuizzes,
    weeklyProgress,
  };
}

// Subscribe to dashboard stats (real-time)
export function subscribeToDashboardStats(
  userId: string,
  callback: (stats: DashboardStats) => void
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  // We'll use multiple subscriptions and combine them
  let materialsCount = 0;
  let upcomingEventsCount = 0;
  let userQuizScore = 0;
  let totalQuizzes = 0;
  let discussionsCount = 0;

  const updateCallback = () => {
    const weeklyProgress = Math.min(100, Math.round((totalQuizzes / 5) * 100));
    callback({
      materialsCount,
      userQuizScore,
      discussionsCount,
      upcomingEventsCount,
      totalQuizzes,
      weeklyProgress,
    });
  };

  // Subscribe to materials
  const unsubMaterials = onSnapshot(collection(db, 'materials'), (snapshot) => {
    materialsCount = snapshot.size;
    updateCallback();
  });

  // Subscribe to events
  const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
    const today = new Date().toISOString().split('T')[0];
    upcomingEventsCount = snapshot.docs.filter(doc => {
      const data = doc.data();
      return data.date >= today && data.isPublished;
    }).length;
    updateCallback();
  });

  // Subscribe to user stats
  const statsRef = doc(db, 'userStats', userId);
  const unsubStats = onSnapshot(statsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      userQuizScore = data.averageScore || 0;
      totalQuizzes = data.totalQuizzes || 0;
      discussionsCount = data.discussionPosts || 0;
    }
    updateCallback();
  });

  // Return combined unsubscribe
  return () => {
    unsubMaterials();
    unsubEvents();
    unsubStats();
  };
}

// ========== LEADERBOARD ==========

// Get quiz leaderboard
export function subscribeToLeaderboard(
  callback: (leaderboard: { userId: string; userName: string; averageScore: number; totalQuizzes: number }[]) => void,
  limitCount: number = 10
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  const q = query(
    collection(db, 'userStats'),
    where('totalQuizzes', '>', 0),
    orderBy('totalQuizzes', 'desc'),
    orderBy('averageScore', 'desc'),
    limit(limitCount)
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const leaderboard = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        userId: doc.id,
        userName: 'User', // Will need to fetch from users collection
        averageScore: data.averageScore || 0,
        totalQuizzes: data.totalQuizzes || 0,
      };
    });

    callback(leaderboard);
  });

  return unsubscribe;
}

// ========== TOP MATERIALS ==========

// Get top trending materials
export function subscribeToTopMaterials(
  callback: (materials: { id: string; title: string; course: string; likes: number; views: number; authorName: string }[]) => void,
  limitCount: number = 5
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  const q = query(
    collection(db, 'materials'),
    orderBy('likes', 'desc'),
    limit(limitCount)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const materials = snapshot.docs.map((doc) => {
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

    callback(materials);
  });

  return unsubscribe;
}

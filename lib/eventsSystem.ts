// Real-time Events System with Firebase
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
export type EventCategory = 'Academic' | 'Social' | 'Workshop' | 'Seminar' | 'Exam' | 'Holiday' | 'Sports' | 'Cultural';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string;
  endTime?: string;
  location: string;
  category: EventCategory;
  organizerId: string;
  organizerName: string;
  organizerSociety?: string; // Society name if organizer is a society
  societyId?: string; // Unique society ID
  attendees: string[]; // Array of user IDs who registered
  attendeeCount: number;
  maxAttendees?: number; // Optional capacity limit
  registrationLink?: string; // Optional external registration (like Google Form)
  imageUrl?: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  isPublished: boolean;
  isFeatured: boolean;
  tags?: string[];
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userDepartment?: string;
  registeredAt: Timestamp | Date;
  status: 'registered' | 'attended' | 'cancelled';
  reminderEnabled: boolean;
}

export interface Society {
  id: string;
  name: string;
  uniqueId: string; // e.g., "ACM-FAST", "IEEE-NUCES"
  description: string;
  logoUrl?: string;
  presidentId: string;
  presidentName: string;
  memberIds: string[];
  memberCount: number;
  createdAt: Timestamp | Date;
  isVerified: boolean;
}

// ========== EVENTS ==========

// Create a new event
export async function createEvent(data: {
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
  maxAttendees?: number;
  registrationLink?: string;
  imageUrl?: string;
  tags?: string[];
}): Promise<string> {
  if (!db) throw new Error('Firebase not initialized');

  const eventData = {
    title: data.title,
    description: data.description,
    date: data.date,
    time: data.time,
    ...(data.endTime && { endTime: data.endTime }),
    location: data.location,
    category: data.category,
    organizerId: data.organizerId,
    organizerName: data.organizerName,
    ...(data.organizerSociety && { organizerSociety: data.organizerSociety }),
    ...(data.societyId && { societyId: data.societyId }),
    attendees: [],
    attendeeCount: 0,
    ...(data.maxAttendees && { maxAttendees: data.maxAttendees }),
    ...(data.registrationLink && { registrationLink: data.registrationLink }),
    ...(data.imageUrl && { imageUrl: data.imageUrl }),
    ...(data.tags && { tags: data.tags }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isPublished: true,
    isFeatured: false,
  };

  const docRef = await addDoc(collection(db, 'events'), eventData);
  return docRef.id;
}

// Subscribe to events (real-time)
export function subscribeToEvents(
  callback: (events: Event[]) => void,
  options?: {
    category?: EventCategory;
    organizerId?: string;
    societyId?: string;
    upcoming?: boolean;
  }
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  let q = query(
    collection(db, 'events'),
    where('isPublished', '==', true),
    orderBy('date', 'asc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    let events: Event[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];

    // Client-side filtering for additional options
    if (options?.category) {
      events = events.filter(e => e.category === options.category);
    }
    if (options?.organizerId) {
      events = events.filter(e => e.organizerId === options.organizerId);
    }
    if (options?.societyId) {
      events = events.filter(e => e.societyId === options.societyId);
    }
    if (options?.upcoming) {
      const today = new Date().toISOString().split('T')[0];
      events = events.filter(e => e.date >= today);
    }

    callback(events);
  }, (error) => {
    console.error('Error subscribing to events:', error);
  });

  return unsubscribe;
}

// Get single event
export async function getEvent(eventId: string): Promise<Event | null> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db, 'events', eventId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Event;
  }
  return null;
}

// Update event
export async function updateEvent(
  eventId: string,
  data: Partial<Omit<Event, 'id' | 'createdAt'>>
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db, 'events', eventId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Delete event
export async function deleteEvent(eventId: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db, 'events', eventId);
  await deleteDoc(docRef);
}

// Register for event
export async function registerForEvent(
  eventId: string,
  userId: string,
  userData: {
    userName: string;
    userEmail: string;
    userDepartment?: string;
  }
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  // Update event attendees
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    attendees: arrayUnion(userId),
    attendeeCount: increment(1),
  });

  // Create registration record
  await addDoc(collection(db, 'eventRegistrations'), {
    eventId,
    userId,
    userName: userData.userName,
    userEmail: userData.userEmail,
    ...(userData.userDepartment && { userDepartment: userData.userDepartment }),
    registeredAt: serverTimestamp(),
    status: 'registered',
    reminderEnabled: true,
  });
}

// Unregister from event
export async function unregisterFromEvent(
  eventId: string,
  userId: string
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  // Update event attendees
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    attendees: arrayRemove(userId),
    attendeeCount: increment(-1),
  });

  // Update registration status
  const q = query(
    collection(db, 'eventRegistrations'),
    where('eventId', '==', eventId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  snapshot.docs.forEach(async (docSnap) => {
    await updateDoc(doc(db, 'eventRegistrations', docSnap.id), {
      status: 'cancelled',
    });
  });
}

// Toggle reminder for event
export async function toggleEventReminder(
  eventId: string,
  userId: string,
  enabled: boolean
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const q = query(
    collection(db, 'eventRegistrations'),
    where('eventId', '==', eventId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  snapshot.docs.forEach(async (docSnap) => {
    await updateDoc(doc(db, 'eventRegistrations', docSnap.id), {
      reminderEnabled: enabled,
    });
  });
}

// Get user's registered events
export function subscribeToUserRegistrations(
  userId: string,
  callback: (registrations: EventRegistration[]) => void
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  const q = query(
    collection(db, 'eventRegistrations'),
    where('userId', '==', userId),
    where('status', '==', 'registered')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const registrations: EventRegistration[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EventRegistration[];

    callback(registrations);
  });

  return unsubscribe;
}

// ========== SOCIETIES ==========

// Create society
export async function createSociety(data: {
  name: string;
  uniqueId: string;
  description: string;
  logoUrl?: string;
  presidentId: string;
  presidentName: string;
}): Promise<string> {
  if (!db) throw new Error('Firebase not initialized');

  const societyData = {
    name: data.name,
    uniqueId: data.uniqueId,
    description: data.description,
    ...(data.logoUrl && { logoUrl: data.logoUrl }),
    presidentId: data.presidentId,
    presidentName: data.presidentName,
    memberIds: [data.presidentId],
    memberCount: 1,
    createdAt: serverTimestamp(),
    isVerified: false,
  };

  const docRef = await addDoc(collection(db, 'societies'), societyData);
  return docRef.id;
}

// Subscribe to societies
export function subscribeToSocieties(
  callback: (societies: Society[]) => void
): () => void {
  if (!db) {
    console.error('Firebase not initialized');
    return () => {};
  }

  const q = query(collection(db, 'societies'), orderBy('name', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const societies: Society[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Society[];

    callback(societies);
  });

  return unsubscribe;
}

// Check if user can create events (admin or society member)
export async function canUserCreateEvent(userId: string): Promise<{ canCreate: boolean; societies: Society[] }> {
  if (!db) throw new Error('Firebase not initialized');

  const q = query(
    collection(db, 'societies'),
    where('memberIds', 'array-contains', userId)
  );
  const snapshot = await getDocs(q);
  const societies: Society[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Society[];

  return {
    canCreate: societies.length > 0,
    societies,
  };
}

// ========== HELPERS ==========

export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function isEventUpcoming(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

export function isEventToday(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const today = new Date();
  return eventDate.toDateString() === today.toDateString();
}

export function getEventCountdown(dateString: string): string {
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Past';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `${diffDays} days`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks`;
  return `${Math.ceil(diffDays / 30)} months`;
}

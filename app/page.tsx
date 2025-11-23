'use client';

import { useState, useEffect } from 'react';
import { Landing } from '@/components/Landing';
import { Login } from '@/components/Login';
import { Register } from '@/components/Register';
import { Dashboard } from '@/components/Dashboard';
import { ProfileManagement } from '@/components/ProfileManagement';
import { StudyMaterials } from '@/components/StudyMaterials';
import { AIQuiz } from '@/components/AIQuiz';
import { ChatDiscussion } from '@/components/ChatDiscussion';
import { FacultyContact } from '@/components/FacultyContact';
import { Events } from '@/components/Events';
import { Toaster } from '@/components/ui/sonner';

export type UserRole = 'student' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  fastId: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  semester?: string;
}

export type Screen = 
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'profile'
  | 'materials'
  | 'quiz'
  | 'chat'
  | 'faculty'
  | 'events';

export default function Page() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Restore user session on page load
  useEffect(() => {
    const restoreUserSession = async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        const { onAuthStateChanged } = await import('firebase/auth');
        
        if (!auth) {
          setLoading(false);
          return;
        }

        onAuthStateChanged(auth as any, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              // Get user profile from backend
              const token = await firebaseUser.getIdToken();
              // ✅ Skip backend entirely
              const userData = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                role: 'student',
              };

              const user: User = {
                id: userData.id || firebaseUser.uid,
                name: userData.username || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: userData.email || firebaseUser.email || '',
                fastId: `FAST-${(userData.role || 'student') === 'admin' ? 'ADM' : 'STD'}-${(userData.id || firebaseUser.uid).slice(-4)}`,
                role: (userData.role || 'student') as 'student' | 'admin',
                department: 'Computer Science',
                semester: (userData.role || 'student') === 'student' ? 'Fall 2024' : undefined,
                avatar: firebaseUser.photoURL || undefined
              };

              setUser(user);
              setCurrentScreen('dashboard');
            } catch (error) {
              console.error('Error restoring user session:', error);
            }
          } else {
            setUser(null);
            setCurrentScreen('landing');
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing auth state:', error);
        setLoading(false);
      }
    };

    restoreUserSession();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('fastConnectUser', JSON.stringify(userData));
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
  try {
    const { signOut } = await import('firebase/auth');
    const { auth } = await import('@/lib/firebase');
    if (auth) {
      await signOut(auth);
    }
  } catch (err) {
    console.error('Logout error:', err);
  }
  setUser(null);
  localStorage.removeItem('fastConnectUser'); // ✅ clear
  setCurrentScreen('landing');
};

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {currentScreen === 'landing' && (
        <Landing onNavigate={navigate} darkMode={darkMode} toggleTheme={toggleTheme} />
      )}
      {currentScreen === 'login' && (
        <Login onLogin={handleLogin} onNavigate={navigate} darkMode={darkMode} toggleTheme={toggleTheme} />
      )}
      {currentScreen === 'register' && (
        <Register onRegister={handleLogin} onNavigate={navigate} darkMode={darkMode} toggleTheme={toggleTheme} />
      )}
      {currentScreen === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onNavigate={navigate} 
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'profile' && user && (
        <ProfileManagement 
          user={user}
          setUser={setUser}
          onNavigate={navigate}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'materials' && user && (
        <StudyMaterials 
          user={user}
          onNavigate={navigate}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'quiz' && user && (
        <AIQuiz 
          user={user}
          onNavigate={navigate}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'chat' && user && (
        <ChatDiscussion 
          user={user}
          onNavigate={navigate}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'faculty' && user && (
        <FacultyContact 
          user={user}
          onNavigate={navigate}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'events' && user && (
        <Events 
          user={user}
          onNavigate={navigate}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
      )}
      <Toaster />
    </div>
  );
}

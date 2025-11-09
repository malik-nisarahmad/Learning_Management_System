import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { GraduationCap, Moon, Sun, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { signInWithEmailAndPassword, sendPasswordResetEmail, type Auth } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { Screen, User } from '@/app/page';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigate: (screen: Screen) => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export function Login({ onLogin, onNavigate, darkMode, toggleTheme }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!auth) {
      setError('Firebase is not configured. Please set up your .env.local file. See FIREBASE_SETUP.md for instructions.');
      setLoading(false);
      return;
    }
    
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth as Auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user profile from backend (for custom claims like role)
      const token = await firebaseUser.getIdToken();
      const response = await fetch('http://localhost:3001/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let userData;
      if (response.ok) {
        userData = await response.json();
      } else {
        // Fallback if backend is not available
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: 'student',
        };
      }

      // Convert to frontend User type
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
    
      onLogin(user);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!auth) {
      setError('Firebase is not configured. Please set up your .env.local file.');
      setLoading(false);
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth as Auth, resetEmail);
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setShowForgotPassword(false);
      setResetEmail('');
        setLoading(false);
    }, 3000);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(err.message || 'Failed to send reset email.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('landing')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white">FAST Connect</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-400"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <Card className="w-full max-w-md p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        {!showForgotPassword ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-gray-900 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to your FAST Connect account
              </p>
            </div>

            {error && (
              <Alert className="mb-6 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@nu.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 dark:text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={() => onNavigate('register')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Register here
                </button>
              </p>
            </div>

          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-gray-900 dark:text-white mb-2">Reset Password</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your email to receive reset instructions
              </p>
            </div>

            {resetSent && (
              <Alert className="mb-6 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  Password reset link has been sent to your email!
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resetEmail" className="text-gray-900 dark:text-white">
                  Email Address
                </Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="your.email@nu.edu.pk"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}

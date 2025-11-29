import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle, Mail, Lock, ArrowLeft, Eye, EyeOff, GraduationCap, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { signInWithEmailAndPassword, sendPasswordResetEmail, type Auth } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { registerChatUser } from '@/lib/chatSystem';
import type { Screen, User } from '@/app/page';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigate: (screen: Screen) => void;
  darkMode: boolean;
}

export function Login({ onLogin, onNavigate, darkMode }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError('Firebase is not configured. Please set up your .env.local file.');
      setLoading(false);
      return;
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth as Auth, email, password);
      const firebaseUser = userCredential.user;
      
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
    
      await registerChatUser({
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        semester: user.semester,
        fastId: user.fastId,
        avatar: user.avatar
      });
    
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
      setError('Firebase is not configured.');
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
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                FAST<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Connect</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/60 border border-slate-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/10">
          {!showForgotPassword ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-float">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome back</h2>
                <p className="text-slate-400 text-sm">
                  Sign in to continue your learning journey
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@nu.edu.pk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 pl-11 h-12 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 pl-11 pr-11 h-12 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-12 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              {/* Register Link */}
              <div className="mt-6 pt-6 border-t border-slate-800/50 text-center">
                <p className="text-slate-400 text-sm">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => onNavigate('register')}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-semibold hover:text-indigo-300 transition-all"
                  >
                    Create one
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Reset Password Header */}
              <div className="mb-8">
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to sign in
                </button>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Reset password</h2>
                <p className="text-slate-400 text-sm">
                  Enter your email to receive reset instructions
                </p>
              </div>

              {/* Success Alert */}
              {resetSent && (
                <Alert className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400 text-sm">
                    Password reset link has been sent to your email.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Alert */}
              {error && (
                <Alert className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Reset Form */}
              <form onSubmit={handlePasswordReset} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail" className="text-slate-300 text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a6587]" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="your.email@nu.edu.pk"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-[#0f1222] border-[#2a3358] text-white placeholder:text-[#5a6587] pl-11 h-12 rounded-xl focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 transition-all"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] hover:from-[#5b4cdb] hover:to-[#9645e5] text-white h-12 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GraduationCap, AlertCircle, User, Mail, Lock, Building, CreditCard, Eye, EyeOff, CheckCircle2, Sparkles, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, type Auth } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { registerChatUser } from '@/lib/chatSystem';
import type { Screen, User as UserType } from '@/app/page';

interface RegisterProps {
  onRegister: (user: UserType) => void;
  onNavigate: (screen: Screen) => void;
  darkMode: boolean;
}

export function Register({ onRegister, onNavigate, darkMode }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    fastId: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'student' as 'student' | 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    if (!auth) {
      setError('Firebase is not configured. Please set up your .env.local file. See FIREBASE_SETUP.md for instructions.');
      setLoading(false);
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth as Auth, 
        formData.email, 
        formData.password
      );
      const firebaseUser = userCredential.user;
      
      if (formData.name) {
        await updateProfile(firebaseUser, {
          displayName: formData.name
        });
      }
      
      await sendEmailVerification(firebaseUser);
      
      const token = await firebaseUser.getIdToken();
      try {
        await fetch('http://localhost:3001/users/profile', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.name,
            email: formData.email,
            fastId: formData.fastId,
            role: formData.role,
            department: formData.department,
            semester: formData.role === 'student' ? 'Fall-2024' : undefined,
          }),
        });
      } catch (backendError) {
        console.warn('Backend profile update failed, but user created:', backendError);
      }
      
      const user: UserType = {
        id: firebaseUser.uid,
        name: formData.name,
        email: firebaseUser.email || formData.email,
        fastId: formData.fastId || `FAST-${formData.role === 'admin' ? 'ADM' : 'STD'}-${firebaseUser.uid.slice(-4)}`,
        role: formData.role,
        department: formData.department || 'Computer Science',
        semester: formData.role === 'student' ? 'Fall 2024' : undefined,
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
      
      setSuccess('Registration successful! Please check your email to verify your account.');
      
      setTimeout(() => {
        onRegister(user);
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => onNavigate('landing')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                FAST<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Connect</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Register Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/60 border border-slate-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-float">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Create Account</h2>
            <p className="text-slate-400 text-sm">
              Start your learning journey with FAST Connect
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

          {/* Success Alert */}
          {success && (
            <Alert className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400 text-sm">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300 text-sm font-medium">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Ahmed Khan"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  disabled={loading}
                  className="pl-11 h-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* FAST ID Field */}
            <div className="space-y-2">
              <Label htmlFor="fastId" className="text-slate-300 text-sm font-medium">
                FAST Institute ID
              </Label>
              <div className="relative group">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <Input
                  id="fastId"
                  type="text"
                  placeholder="FAST-STD-2021"
                  value={formData.fastId}
                  onChange={(e) => handleChange('fastId', e.target.value)}
                  disabled={loading}
                  className="pl-11 h-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@nu.edu.pk"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  disabled={loading}
                  className="pl-11 h-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Department & Role Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleChange('department', value)} disabled={loading}>
                  <SelectTrigger className="h-12 bg-slate-950/50 border-slate-800 text-white rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    <Building className="w-5 h-5 text-slate-500 mr-2" />
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 rounded-xl">
                    <SelectItem value="Computer Science" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Computer Science</SelectItem>
                    <SelectItem value="Software Engineering" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Software Engineering</SelectItem>
                    <SelectItem value="Electrical Engineering" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Electrical Engineering</SelectItem>
                    <SelectItem value="Business Administration" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Business Administration</SelectItem>
                    <SelectItem value="Mathematics" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">Role</Label>
                <Select value={formData.role} onValueChange={(value: 'student' | 'admin') => handleChange('role', value)} disabled={loading}>
                  <SelectTrigger className="h-12 bg-slate-950/50 border-slate-800 text-white rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 rounded-xl">
                    <SelectItem value="student" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Student</SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Admin / Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  disabled={loading}
                  className="pl-11 pr-11 h-12 bg-[#0f1222] border-[#2a3358] text-white placeholder:text-[#5a6587] rounded-xl focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5a6587] hover:text-[#8892b3] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#b8c0e0] text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a6587]" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  disabled={loading}
                  className="pl-11 pr-11 h-12 bg-[#0f1222] border-[#2a3358] text-white placeholder:text-[#5a6587] rounded-xl focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5a6587] hover:text-[#8892b3] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-[#00cec9] to-[#81ecec] hover:from-[#00b5b0] hover:to-[#6fd6d6] text-[#0c0f1a] font-semibold border-0 mt-6 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#0c0f1a]/30 border-t-[#0c0f1a] rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-[#2a3358]/50 text-center">
            <p className="text-[#8892b3] text-sm">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="bg-gradient-to-r from-[#a29bfe] to-[#81ecec] bg-clip-text text-transparent font-semibold hover:from-[#6c5ce7] hover:to-[#00cec9] transition-all"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

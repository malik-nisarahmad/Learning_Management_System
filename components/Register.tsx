import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GraduationCap, Moon, Sun, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, type Auth } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { Screen, User } from '@/app/page';

interface RegisterProps {
  onRegister: (user: User) => void;
  onNavigate: (screen: Screen) => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export function Register({ onRegister, onNavigate, darkMode, toggleTheme }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    fastId: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'student' as 'student' | 'admin'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
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
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth as Auth, 
        formData.email, 
        formData.password
      );
      const firebaseUser = userCredential.user;
      
      // Update display name
      if (formData.name) {
        await updateProfile(firebaseUser, {
          displayName: formData.name
        });
      }
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
      
      // Get ID token and update user profile on backend (for role, etc.)
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
            role: formData.role
          }),
        });
      } catch (backendError) {
        console.warn('Backend profile update failed, but user created:', backendError);
      }
      
      // Convert to frontend User type and login
      const user: User = {
        id: firebaseUser.uid,
      name: formData.name,
        email: firebaseUser.email || formData.email,
        fastId: formData.fastId || `FAST-${formData.role === 'admin' ? 'ADM' : 'STD'}-${firebaseUser.uid.slice(-4)}`,
      role: formData.role,
        department: formData.department || 'Computer Science',
        semester: formData.role === 'student' ? 'Fall 2024' : undefined,
        avatar: firebaseUser.photoURL || undefined
      };
      
      setSuccess('Registration successful! Please check your email to verify your account.');
      
      // Auto-login after a short delay
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

      <Card className="w-full max-w-md p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 my-24">
        <div className="text-center mb-8">
          <h2 className="text-gray-900 dark:text-white mb-2">Create Account</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Register with your FAST Institute ID
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

        {success && (
          <Alert className="mb-6 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
            <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-300">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900 dark:text-white">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ahmed Khan"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              disabled={loading}
              className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fastId" className="text-gray-900 dark:text-white">
              FAST Institute ID
            </Label>
            <Input
              id="fastId"
              type="text"
              placeholder="FAST-STD-2021"
              value={formData.fastId}
              onChange={(e) => handleChange('fastId', e.target.value)}
              disabled={loading}
              className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-900 dark:text-white">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@nu.edu.pk"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              disabled={loading}
              className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-gray-900 dark:text-white">
              Department
            </Label>
            <Select value={formData.department} onValueChange={(value) => handleChange('department', value)} disabled={loading}>
              <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                <SelectItem value="Business Administration">Business Administration</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-900 dark:text-white">
              Role
            </Label>
            <Select value={formData.role} onValueChange={(value: 'student' | 'admin') => handleChange('role', value)} disabled={loading}>
              <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="admin">Admin / Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-900 dark:text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              disabled={loading}
              className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-white">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              required
              disabled={loading}
              className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}

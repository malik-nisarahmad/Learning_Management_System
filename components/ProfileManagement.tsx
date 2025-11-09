import { useState } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Camera, Save, Mail, Phone, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Screen, User } from '@/app/page';

interface ProfileManagementProps {
  user: User;
  setUser: (user: User) => void;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export function ProfileManagement({ 
  user, 
  setUser, 
  onNavigate, 
  onLogout, 
  darkMode, 
  toggleTheme 
}: ProfileManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    fastId: user.fastId,
    department: user.department || '',
    semester: user.semester || '',
    phone: '+92 300 1234567',
    address: 'Karachi, Pakistan',
    bio: 'Computer Science student passionate about AI and Machine Learning.'
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setUser({
      ...user,
      name: formData.name,
      email: formData.email,
      department: formData.department,
      semester: formData.semester
    });
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation
        user={user}
        currentScreen="profile"
        onNavigate={onNavigate}
        onLogout={onLogout}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-gray-900 dark:text-white mb-2">Profile Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your personal information and preferences
          </p>
        </div>

        <Card className="p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
            <div className="relative mb-4">
              <Avatar className="w-32 h-32">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-3xl">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-gray-900 dark:text-white mb-1">{formData.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{formData.fastId}</p>
            <div className="mt-2">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                {user.role === 'admin' ? 'Admin' : 'Student'}
              </span>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 dark:text-white">Personal Information</h3>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900 dark:text-white">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!isEditing}
                  className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fastId" className="text-gray-900 dark:text-white">
                  FAST ID
                </Label>
                <Input
                  id="fastId"
                  value={formData.fastId}
                  disabled
                  className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-white">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-900 dark:text-white">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-gray-900 dark:text-white">
                  Department
                </Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => handleChange('department', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white disabled:opacity-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                    <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                    <SelectItem value="Business Administration">Business Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {user.role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="semester" className="text-gray-900 dark:text-white">
                    <CalendarIcon className="w-4 h-4 inline mr-2" />
                    Current Semester
                  </Label>
                  <Input
                    id="semester"
                    value={formData.semester}
                    onChange={(e) => handleChange('semester', e.target.value)}
                    disabled={!isEditing}
                    className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
                  />
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-gray-900 dark:text-white">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={!isEditing}
                  className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio" className="text-gray-900 dark:text-white">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-gray-900 dark:text-white mb-4">Account Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Materials Uploaded</p>
                <p className="text-gray-900 dark:text-white">12</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Quizzes Completed</p>
                <p className="text-gray-900 dark:text-white">34</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Discussions</p>
                <p className="text-gray-900 dark:text-white">56</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Total Likes</p>
                <p className="text-gray-900 dark:text-white">234</p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

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
}

export function ProfileManagement({ 
  user, 
  setUser, 
  onNavigate, 
  onLogout, 
  darkMode 
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
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navigation
          user={user}
          currentScreen="profile"
          onNavigate={onNavigate}
          onLogout={onLogout}
          darkMode={darkMode}
        />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 sm:pt-24 sm:pb-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile Management</h1>
            <p className="text-sm text-slate-400">
              Manage your personal information and preferences
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-md rounded-2xl p-6 sm:p-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-slate-800/60">
              <div className="relative mb-4">
                <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-slate-700">
                  <AvatarFallback className="bg-slate-800 text-indigo-400 text-xl sm:text-2xl font-bold">
                    {getInitials(formData.name)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center text-white transition-all duration-200 shadow-lg shadow-indigo-500/20">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{formData.name}</h3>
              <p className="text-slate-400 text-sm">{formData.fastId}</p>
              <div className="mt-3">
                <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-semibold">
                  {user.role === 'admin' ? 'Admin' : 'Student'}
                </span>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-white font-semibold text-lg">Personal Information</h3>
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white border-0 text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)} 
                      className="h-10 px-5 bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white text-sm rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold border-0 text-sm rounded-xl shadow-lg shadow-indigo-500/20"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300 text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={!isEditing}
                    className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl disabled:opacity-60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fastId" className="text-slate-300 text-sm font-medium">
                    FAST ID
                  </Label>
                  <Input
                    id="fastId"
                    value={formData.fastId}
                    disabled
                    className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl disabled:opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl disabled:opacity-60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-300 text-sm font-medium">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl disabled:opacity-60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-slate-300 text-sm font-medium">
                    Department
                  </Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => handleChange('department', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl disabled:opacity-60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 rounded-xl">
                      <SelectItem value="Computer Science" className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-white">Computer Science</SelectItem>
                      <SelectItem value="Software Engineering" className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-white">Software Engineering</SelectItem>
                      <SelectItem value="Electrical Engineering" className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-white">Electrical Engineering</SelectItem>
                      <SelectItem value="Business Administration" className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-white">Business Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {user.role === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="semester" className="text-slate-300 text-sm font-medium">
                      <CalendarIcon className="w-4 h-4 inline mr-2" />
                      Current Semester
                    </Label>
                    <Input
                      id="semester"
                      value={formData.semester}
                      onChange={(e) => handleChange('semester', e.target.value)}
                      disabled={!isEditing}
                      className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl disabled:opacity-60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="text-slate-300 text-sm font-medium">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={!isEditing}
                    className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl disabled:opacity-60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio" className="text-slate-300 text-sm font-medium">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className="bg-slate-950/50 border-slate-800 text-white rounded-xl disabled:opacity-60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="mt-8 pt-8 border-t border-slate-800/60">
              <h3 className="text-white font-semibold text-lg mb-5">Account Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl group hover:border-indigo-500/40 transition-all duration-200">
                  <p className="text-slate-400 text-xs mb-1">Materials Uploaded</p>
                  <p className="text-indigo-400 text-2xl font-bold">12</p>
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl group hover:border-emerald-500/40 transition-all duration-200">
                  <p className="text-slate-400 text-xs mb-1">Quizzes Completed</p>
                  <p className="text-emerald-400 text-2xl font-bold">34</p>
                </div>
                <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl group hover:border-pink-500/40 transition-all duration-200">
                  <p className="text-slate-400 text-xs mb-1">Discussions</p>
                  <p className="text-pink-400 text-2xl font-bold">56</p>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl group hover:border-amber-500/40 transition-all duration-200">
                  <p className="text-slate-400 text-xs mb-1">Total Likes</p>
                  <p className="text-amber-400 text-2xl font-bold">234</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

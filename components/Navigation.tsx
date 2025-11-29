import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  MessageSquare, 
  Users, 
  Calendar,
  UserCircle,
  LogOut,
  Bell,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import type { Screen, User } from '@/app/page';
import { useState } from 'react';

interface NavigationProps {
  user: User;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
  notificationCount?: number;
}

export function Navigation({ 
  user, 
  currentScreen, 
  onNavigate, 
  onLogout, 
  darkMode, 
  notificationCount = 3
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { screen: 'dashboard' as Screen, icon: LayoutDashboard, label: 'Dashboard' },
    { screen: 'materials' as Screen, icon: BookOpen, label: 'Materials' },
    { screen: 'quiz' as Screen, icon: Brain, label: 'AI Quiz' },
    { screen: 'chat' as Screen, icon: MessageSquare, label: 'Chat' },
    { screen: 'faculty' as Screen, icon: Users, label: 'Faculty' },
    { screen: 'events' as Screen, icon: Calendar, label: 'Events' },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block tracking-tight">
              FAST <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Connect</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/50 rounded-full p-1.5 border border-slate-800/60 backdrop-blur-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => onNavigate(item.screen)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'text-white bg-white/10 shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : ''}`} />
                  <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <button
              className="relative p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
              onClick={() => onNavigate('events')}
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#030712] animate-pulse" />
              )}
            </button>

            {/* User Profile - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-3 p-1 pr-4 rounded-full hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-800/60 group"
              >
                <Avatar className="w-9 h-9 border-2 border-slate-800 group-hover:border-indigo-500/50 transition-colors">
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-300 font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-white leading-none">{user.name.split(' ')[0]}</p>
                  <p className="text-xs text-slate-400 mt-1">{user.role}</p>
                </div>
              </button>
              <button
                onClick={onLogout}
                className="p-2.5 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-[#030712]/95 backdrop-blur-xl border-b border-slate-800/60 p-4 space-y-2 shadow-2xl animate-in slide-in-from-top-5 z-50">
            <div className="space-y-1 mb-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.screen;
                return (
                  <button
                    key={item.screen}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }`}
                    onClick={() => {
                      onNavigate(item.screen);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Mobile User Section */}
            <div className="pt-4 border-t border-slate-800/60">
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <Avatar className="w-10 h-10 border-2 border-slate-800">
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-300 font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onNavigate('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
              >
                <UserCircle className="w-5 h-5" />
                Profile Settings
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

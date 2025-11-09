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
  Moon,
  Sun,
  GraduationCap,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { Badge } from './ui/badge';
import type { Screen, User } from '@/app/page';
import { useState } from 'react';

interface NavigationProps {
  user: User;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
  notificationCount?: number;
}

export function Navigation({ 
  user, 
  currentScreen, 
  onNavigate, 
  onLogout, 
  darkMode, 
  toggleTheme,
  notificationCount = 3
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { screen: 'dashboard' as Screen, icon: LayoutDashboard, label: 'Dashboard' },
    { screen: 'materials' as Screen, icon: BookOpen, label: 'Study Materials' },
    { screen: 'quiz' as Screen, icon: Brain, label: 'AI Quiz' },
    { screen: 'chat' as Screen, icon: MessageSquare, label: 'Chat' },
    { screen: 'faculty' as Screen, icon: Users, label: 'Faculty' },
    { screen: 'events' as Screen, icon: Calendar, label: 'Events' },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-gray-900 dark:text-white">FAST Connect</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">{user.role === 'admin' ? 'Admin Portal' : 'Student Portal'}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.screen;
              return (
                <Button
                  key={item.screen}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    onNavigate(item.screen);
                    setMobileMenuOpen(false);
                  }}
                  className={isActive ? '' : 'text-gray-700 dark:text-gray-300'}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-700 dark:text-gray-300"
              onClick={() => onNavigate('events')}
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                  {notificationCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <div className="hidden md:flex items-center gap-2 ml-2">
              <Button
                variant="ghost"
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-900 dark:text-white">{user.name}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="text-gray-700 dark:text-gray-300"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-700 dark:text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.screen;
                return (
                  <Button
                    key={item.screen}
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start ${isActive ? '' : 'text-gray-700 dark:text-gray-300'}`}
                    onClick={() => {
                      onNavigate(item.screen);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 dark:text-gray-300"
                  onClick={() => {
                    onNavigate('profile');
                    setMobileMenuOpen(false);
                  }}
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 dark:text-gray-300"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

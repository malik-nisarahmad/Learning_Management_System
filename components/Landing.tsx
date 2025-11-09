import { Button } from './ui/button';
import { Card } from './ui/card';
import { BookOpen, MessageSquare, Calendar, GraduationCap, Brain, Users, Moon, Sun } from 'lucide-react';
import type { Screen } from '@/app/page';

interface LandingProps {
  onNavigate: (screen: Screen) => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export function Landing({ onNavigate, darkMode, toggleTheme }: LandingProps) {
  const features = [
    {
      icon: BookOpen,
      title: 'Study Materials',
      description: 'Access and share study materials, past papers, and lecture notes'
    },
    {
      icon: Brain,
      title: 'AI-Powered Quizzes',
      description: 'Generate practice quizzes with AI and get instant feedback'
    },
    {
      icon: MessageSquare,
      title: 'Chat & Discussions',
      description: 'Real-time chat and thread-based discussions with peers'
    },
    {
      icon: Users,
      title: 'Faculty Contact',
      description: 'Quick access to teacher information and AI email assistant'
    },
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Stay updated with upcoming events and reminders'
    },
    {
      icon: GraduationCap,
      title: 'Learning Analytics',
      description: 'Track your progress and performance across courses'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white">FAST Connect</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Learning Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-400"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="outline" onClick={() => onNavigate('login')}>
              Login
            </Button>
            <Button onClick={() => onNavigate('register')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-gray-900 dark:text-white mb-6">
            Welcome to FAST Connect
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Your comprehensive learning management platform designed specifically for FAST University. 
            Access study materials, collaborate with peers, take AI-powered quizzes, and stay connected with faculty.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => onNavigate('register')}>
              Register Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('login')}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-center text-gray-900 dark:text-white mb-12">
          Key Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 p-12 text-center border-0">
          <h3 className="text-white mb-4">
            Ready to enhance your learning experience?
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of FAST University students and faculty already using FAST Connect
          </p>
          <Button size="lg" variant="secondary" onClick={() => onNavigate('register')}>
            Create Your Account
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 FAST Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

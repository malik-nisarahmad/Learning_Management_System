import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  Brain, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  FileText,
  Users,
  ThumbsUp,
  Eye,
  Clock,
  ArrowRight
} from 'lucide-react';
import type { Screen, User } from '@/app/page';

interface DashboardProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export function Dashboard({ user, onNavigate, onLogout, darkMode, toggleTheme }: DashboardProps) {
  const quickActions = [
    {
      title: 'Study Materials',
      description: 'Browse and upload materials',
      icon: BookOpen,
      screen: 'materials' as Screen,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'AI Quiz',
      description: 'Practice with AI quizzes',
      icon: Brain,
      screen: 'quiz' as Screen,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Discussions',
      description: 'Chat with peers',
      icon: MessageSquare,
      screen: 'chat' as Screen,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Events',
      description: 'Upcoming events',
      icon: Calendar,
      screen: 'events' as Screen,
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const topMaterials = [
    {
      title: 'Data Structures Final Paper 2023',
      course: 'CS-201',
      likes: 156,
      views: 892,
      uploadedBy: 'Sarah Ahmed',
      timeAgo: '2 days ago',
      type: 'PDF'
    },
    {
      title: 'OOP Lab Manual Complete',
      course: 'CS-102',
      likes: 143,
      views: 756,
      uploadedBy: 'Ali Hassan',
      timeAgo: '1 week ago',
      type: 'PDF'
    },
    {
      title: 'Database Management Notes',
      course: 'CS-301',
      likes: 128,
      views: 654,
      uploadedBy: 'Fatima Khan',
      timeAgo: '3 days ago',
      type: 'PDF'
    },
    {
      title: 'Algorithms Midterm Solutions',
      course: 'CS-401',
      likes: 112,
      views: 543,
      uploadedBy: 'Ahmed Raza',
      timeAgo: '5 days ago',
      type: 'PDF'
    },
  ];

  const upcomingEvents = [
    {
      title: 'Tech Talk: AI in Education',
      date: 'Nov 15, 2025',
      time: '2:00 PM',
      location: 'Auditorium A'
    },
    {
      title: 'CS Department Seminar',
      date: 'Nov 18, 2025',
      time: '10:00 AM',
      location: 'Room 301'
    },
    {
      title: 'Final Exams Begin',
      date: 'Dec 1, 2025',
      time: 'All Day',
      location: 'Various Locations'
    },
  ];

  const recentActivity = [
    { action: 'New material uploaded', item: 'Operating Systems Notes', time: '1 hour ago' },
    { action: 'Quiz completed', item: 'Data Structures Practice', time: '3 hours ago' },
    { action: 'New comment', item: 'Algorithm Discussion Thread', time: '5 hours ago' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation
        user={user}
        currentScreen="dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-gray-900 dark:text-white mb-2">
            {getGreeting()}, {user.name}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back to FAST Connect. Here's what's happening today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Materials Accessed</p>
                <p className="text-gray-900 dark:text-white">24</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Quizzes Taken</p>
                <p className="text-gray-900 dark:text-white">12</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Active Discussions</p>
                <p className="text-gray-900 dark:text-white">8</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Upcoming Events</p>
                <p className="text-gray-900 dark:text-white">3</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onNavigate(action.screen)}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-gray-900 dark:text-white mb-1">{action.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{action.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Liked Materials */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 dark:text-white">Top Materials</h3>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('materials')}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="space-y-4">
                {topMaterials.map((material, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => onNavigate('materials')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-gray-900 dark:text-white">{material.title}</h4>
                          <Badge variant="secondary">{material.type}</Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{material.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{material.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{material.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{material.uploadedBy}</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <Clock className="w-4 h-4" />
                        <span>{material.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-white">Upcoming Events</h3>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('events')}>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => onNavigate('events')}
                  >
                    <h4 className="text-gray-900 dark:text-white mb-1">{event.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{event.date}</p>
                    <p className="text-gray-600 dark:text-gray-400">{event.time}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-gray-600 dark:text-gray-400">{activity.item}</p>
                      <p className="text-gray-500 dark:text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

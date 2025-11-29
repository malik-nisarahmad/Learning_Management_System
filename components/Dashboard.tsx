import { Navigation } from './Navigation';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  Brain, 
  MessageSquare, 
  Calendar,
  FileText,
  Users,
  ThumbsUp,
  Eye,
  ArrowRight,
  Activity,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Clock
} from 'lucide-react';
import type { Screen, User } from '@/app/page';

interface DashboardProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
}

export function Dashboard({ user, onNavigate, onLogout, darkMode }: DashboardProps) {
  const quickActions = [
    { 
      title: 'Study Materials', 
      description: 'Access course resources', 
      icon: BookOpen, 
      screen: 'materials' as Screen,
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    { 
      title: 'AI Quiz', 
      description: 'Practice & test yourself', 
      icon: Brain, 
      screen: 'quiz' as Screen,
      color: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    },
    { 
      title: 'Discussions', 
      description: 'Connect with peers', 
      icon: MessageSquare, 
      screen: 'chat' as Screen,
      color: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400'
    },
    { 
      title: 'Events', 
      description: 'View calendar', 
      icon: Calendar, 
      screen: 'events' as Screen,
      color: 'from-orange-500 to-amber-500',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400'
    },
  ];

  const stats = [
    { label: 'Materials', value: '24', change: '+12%', positive: true, icon: FileText },
    { label: 'Quiz Score', value: '85%', change: '+5%', positive: true, icon: Brain },
    { label: 'Discussions', value: '8', change: '+3', positive: true, icon: MessageSquare },
    { label: 'Events', value: '3', change: 'This week', positive: true, icon: Calendar },
  ];

  const topMaterials = [
    { title: 'Data Structures Final Paper 2023', course: 'CS-201', likes: 156, views: 892, author: 'Sarah Ahmed' },
    { title: 'OOP Lab Manual Complete', course: 'CS-102', likes: 143, views: 756, author: 'Ali Hassan' },
    { title: 'Database Management Notes', course: 'CS-301', likes: 128, views: 654, author: 'Fatima Khan' },
  ];

  const upcomingEvents = [
    { title: 'Tech Talk: AI in Education', date: 'Nov 15', time: '2:00 PM', type: 'Seminar', color: 'bg-purple-500' },
    { title: 'CS Department Seminar', date: 'Nov 18', time: '10:00 AM', type: 'Academic', color: 'bg-blue-500' },
    { title: 'Final Exams Begin', date: 'Dec 1', time: 'All Day', type: 'Exam', color: 'bg-red-500' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <Navigation user={user} currentScreen="dashboard" onNavigate={onNavigate} onLogout={onLogout} darkMode={darkMode} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 sm:pt-24 sm:pb-12 relative z-10">
        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-2 font-medium">{getGreeting()} 👋</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user.name.split(' ')[0]}</span>
              </h1>
            </div>
            <Button 
              onClick={() => onNavigate('materials')}
              className="btn-glow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Materials
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-14">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="group bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stat.positive ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-3xl font-bold text-white tracking-tight mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-10 sm:mb-14">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button 
                  key={index} 
                  onClick={() => onNavigate(action.screen)} 
                  className="group bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm rounded-2xl p-6 text-left hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-2xl ${action.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${action.iconColor}`} />
                  </div>
                  <h3 className="text-white font-semibold mb-1.5 text-base">{action.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trending Materials */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm rounded-2xl overflow-hidden hover:border-slate-700/50 transition-colors">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Trending Materials
              </h2>
              <button 
                onClick={() => onNavigate('materials')} 
                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1 group font-medium"
              >
                View all
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div>
              {topMaterials.map((material, index) => (
                <div 
                  key={index} 
                  onClick={() => onNavigate('materials')} 
                  className="px-6 py-5 border-b border-slate-800/60 last:border-b-0 hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-white font-medium text-base truncate group-hover:text-indigo-400 transition-colors">{material.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{material.course}</p>
                    </div>
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 ml-3 text-xs font-medium shrink-0 px-2.5 py-0.5">PDF</Badge>
                  </div>
                  <div className="flex items-center gap-5 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4" />
                      {material.likes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {material.views}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {material.author}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm rounded-2xl overflow-hidden hover:border-slate-700/50 transition-colors">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  Upcoming
                </h2>
                <button 
                  onClick={() => onNavigate('events')} 
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div>
                {upcomingEvents.map((event, index) => (
                  <div 
                    key={index} 
                    onClick={() => onNavigate('events')} 
                    className="px-6 py-5 border-b border-slate-800/60 last:border-b-0 hover:bg-slate-800/40 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full ${event.color} mt-2 shrink-0 ring-2 ring-slate-900`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">{event.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                          <span className="text-indigo-400 font-medium">{event.date}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {event.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-white">Your Progress</h3>
                </div>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  You're doing great! Keep up the momentum to reach your weekly goals.
                </p>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400 font-medium">Weekly Goal</span>
                      <span className="text-indigo-400 font-bold">75%</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400 font-medium">Quizzes Completed</span>
                      <span className="text-cyan-400 font-bold">12/15</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

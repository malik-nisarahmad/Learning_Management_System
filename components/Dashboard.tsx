'use client';

import { useState, useEffect, useCallback } from 'react';
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
  ChevronRight,
  TrendingUp,
  Sparkles,
  Clock,
  Activity,
  Loader2,
  RefreshCw
} from 'lucide-react';
import type { Screen, User } from '@/app/page';
// Use optimized Firebase queries instead of real-time subscriptions
import { 
  getDashboardStatsOptimized, 
  getMaterialsOptimized, 
  getUpcomingEventsOptimized,
  refreshDashboardStats,
  DashboardStats,
  Event
} from '@/lib/optimizedFirebase';
import { isEventUpcoming, getEventCountdown } from '@/lib/eventsSystem';

interface DashboardProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
}

export function Dashboard({ user, onNavigate, onLogout, darkMode }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topMaterials, setTopMaterials] = useState<{ id: string; title: string; course: string; likes: number; views: number; authorName: string }[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load data once on mount (cached queries - much more efficient)
  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        const refreshedStats = await refreshDashboardStats(user.id);
        setStats(refreshedStats);
      } else {
        const dashboardStats = await getDashboardStatsOptimized(user.id);
        setStats(dashboardStats);
      }
      
      // Get top materials (cached)
      const materials = await getMaterialsOptimized(3);
      setTopMaterials(materials.map(m => ({
        id: m.id,
        title: m.title,
        course: m.course,
        likes: m.likes,
        views: m.views,
        authorName: m.authorName,
      })));
      
      // Get upcoming events (cached)
      const events = await getUpcomingEventsOptimized(3);
      setUpcomingEvents(events.filter(e => isEventUpcoming(e.date)));
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    loadDashboardData(true);
  };

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Academic': 'bg-blue-500',
      'Social': 'bg-green-500',
      'Workshop': 'bg-purple-500',
      'Seminar': 'bg-indigo-500',
      'Exam': 'bg-red-500',
      'Holiday': 'bg-amber-500',
      'Sports': 'bg-cyan-500',
      'Cultural': 'bg-pink-500',
    };
    return colors[category] || 'bg-slate-500';
  };

  // Dynamic stats based on real data
  const displayStats = [
    { 
      label: 'Materials', 
      value: stats?.materialsCount?.toString() || '0', 
      change: 'Total', 
      positive: true, 
      icon: FileText 
    },
    { 
      label: 'Quiz Score', 
      value: stats?.userQuizScore ? `${stats.userQuizScore}%` : '0%', 
      change: `${stats?.totalQuizzes || 0} taken`, 
      positive: (stats?.userQuizScore || 0) >= 70, 
      icon: Brain 
    },
    { 
      label: 'Discussions', 
      value: stats?.discussionsCount?.toString() || '0', 
      change: 'Posts', 
      positive: true, 
      icon: MessageSquare 
    },
    { 
      label: 'Events', 
      value: stats?.upcomingEventsCount?.toString() || '0', 
      change: 'Upcoming', 
      positive: true, 
      icon: Calendar 
    },
  ];

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
                Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">{user.name.split(' ')[0]}</span>
              </h1>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-xl font-semibold transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                onClick={() => onNavigate('materials')}
                className="btn-glow bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 flex-1 sm:flex-initial"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Explore Materials
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-14">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="group bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    {loading ? (
                      <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                    ) : (
                      <Icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stat.positive ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-3xl font-bold text-white tracking-tight mb-1">
                  {loading ? '...' : stat.value}
                </p>
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
              {loading ? (
                <div className="px-6 py-12 text-center">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Loading materials...</p>
                </div>
              ) : topMaterials.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No materials yet. Be the first to upload!</p>
                </div>
              ) : (
                topMaterials.map((material, index) => (
                  <div 
                    key={material.id} 
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
                        {material.authorName}
                      </span>
                    </div>
                  </div>
                ))
              )}
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
                {loading ? (
                  <div className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No upcoming events</p>
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                    <div 
                      key={event.id} 
                      onClick={() => onNavigate('events')} 
                      className="px-6 py-5 border-b border-slate-800/60 last:border-b-0 hover:bg-slate-800/40 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(event.category)} mt-2 shrink-0 ring-2 ring-slate-900`} />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-sm truncate">{event.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                            <span className="text-indigo-400 font-medium">{getEventCountdown(event.date)}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {event.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activity Card */}
            <div className="bg-linear-to-br from-slate-900 to-slate-950 border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-white">Your Progress</h3>
                </div>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  {stats?.totalQuizzes === 0 
                    ? "Take your first quiz to start tracking progress!"
                    : "You're doing great! Keep up the momentum to reach your weekly goals."
                  }
                </p>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400 font-medium">Weekly Goal</span>
                      <span className="text-indigo-400 font-bold">{stats?.weeklyProgress || 0}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500" 
                        style={{ width: `${stats?.weeklyProgress || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400 font-medium">Quiz Average</span>
                      <span className="text-cyan-400 font-bold">{stats?.userQuizScore || 0}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-500" 
                        style={{ width: `${stats?.userQuizScore || 0}%` }}
                      />
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

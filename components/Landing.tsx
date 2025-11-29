'use client';

import { Button } from './ui/button';
import { 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  Brain, 
  Users, 
  ArrowRight,
  Zap,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Star
} from 'lucide-react';
import type { Screen } from '@/app/page';

interface LandingProps {
  onNavigate: (screen: Screen) => void;
  darkMode: boolean;
}

export function Landing({ onNavigate, darkMode }: LandingProps) {
  const features = [
    {
      icon: BookOpen,
      title: 'Study Materials',
      description: 'Access organized resources with smart search and AI recommendations.',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      icon: Brain,
      title: 'AI Quizzes',
      description: 'Generate personalized practice quizzes with instant AI feedback.',
      color: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Real-time messaging, study groups, and peer collaboration.',
      color: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400'
    },
    {
      icon: Users,
      title: 'Faculty Connect',
      description: 'Direct access to professors and teaching assistants.',
      color: 'from-orange-500 to-amber-500',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400'
    },
    {
      icon: Calendar,
      title: 'Smart Calendar',
      description: 'Never miss deadlines with intelligent reminders.',
      color: 'from-red-500 to-rose-500',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400'
    },
    {
      icon: Zap,
      title: 'Analytics',
      description: 'Track your progress with beautiful insights.',
      color: 'from-yellow-500 to-orange-500',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400'
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onNavigate('login')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                FAST <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Connect</span>
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button 
                onClick={() => onNavigate('login')}
                className="text-slate-300 hover:text-white text-sm font-medium px-4 py-2 rounded-full transition-all hover:bg-slate-800"
              >
                Sign in
              </button>
              <Button 
                onClick={() => onNavigate('register')}
                className="btn-glow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                <span className="hidden sm:inline">Get started</span>
                <span className="sm:hidden">Start</span>
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-slate-300">Trusted by 5,000+ students</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              The modern way to
              <br />
              <span className="gradient-text">
                learn & succeed
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Everything you need for academic excellence. Study materials, AI-powered quizzes, 
              real-time collaboration — all beautifully designed for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Button 
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto btn-glow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-14 px-8 rounded-full text-base font-semibold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1"
              >
                Start learning free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <button 
                onClick={() => onNavigate('login')}
                className="w-full sm:w-auto text-slate-300 hover:text-white h-14 px-8 text-base font-medium transition-all rounded-full border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50"
              >
                I have an account
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">5K+</div>
                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Students</div>
              </div>
              <div className="w-px h-12 bg-slate-800 hidden sm:block" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">1.2K+</div>
                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Materials</div>
              </div>
              <div className="w-px h-12 bg-slate-800 hidden sm:block" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">98%</div>
                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-slate-900/20 skew-y-3 transform origin-top-left -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Everything you need to excel
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Powerful features designed to make your academic journey smoother and more enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="group p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2"
                >
                  <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-10 sm:p-16 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 overflow-hidden text-center">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
                Ready to transform your learning?
              </h2>
              <p className="text-slate-400 mb-10 max-w-xl mx-auto text-lg">
                Join thousands of students already using FAST Connect to achieve their academic goals.
              </p>
              <Button 
                onClick={() => onNavigate('register')}
                className="btn-glow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-14 px-10 rounded-full text-lg font-semibold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
              >
                Get started for free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800/50 bg-slate-950/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">FAST Connect</span>
          </div>
          <p className="text-sm text-slate-500">© 2024 FAST Connect. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}

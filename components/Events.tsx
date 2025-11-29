import { useState } from 'react';
import { Navigation } from './Navigation';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Clock,
  MapPin,
  Users,
  Bell,
  BellOff,
  Plus,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import type { Screen, User } from '@/app/page';

interface EventsProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'Academic' | 'Social' | 'Workshop' | 'Seminar' | 'Exam' | 'Holiday';
  organizer: string;
  attendees: number;
}

export function Events({ user, onNavigate, onLogout, darkMode }: EventsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set(['1', '3']));
  const [remindersEnabled, setRemindersEnabled] = useState<Set<string>>(new Set(['1', '3']));

  const events: Event[] = [
    {
      id: '1',
      title: 'Tech Talk: AI in Education',
      description: 'Join us for an insightful discussion on how artificial intelligence is transforming education.',
      date: 'November 15, 2025',
      time: '2:00 PM - 4:00 PM',
      location: 'Auditorium A, Main Building',
      category: 'Seminar',
      organizer: 'CS Department',
      attendees: 156
    },
    {
      id: '2',
      title: 'Web Development Workshop',
      description: 'Hands-on workshop covering modern web development technologies.',
      date: 'November 16, 2025',
      time: '10:00 AM - 5:00 PM',
      location: 'Lab 301, CS Building',
      category: 'Workshop',
      organizer: 'Software Engineering Society',
      attendees: 45
    },
    {
      id: '3',
      title: 'CS Department Seminar',
      description: 'Annual seminar featuring guest speakers from leading tech companies.',
      date: 'November 18, 2025',
      time: '10:00 AM - 12:00 PM',
      location: 'Room 301, CS Building',
      category: 'Academic',
      organizer: 'Dr. Muhammad Khan',
      attendees: 89
    },
    {
      id: '4',
      title: 'Hackathon 2025',
      description: '24-hour coding competition. Build innovative solutions and win exciting prizes!',
      date: 'November 22, 2025',
      time: '9:00 AM - 9:00 AM',
      location: 'Innovation Lab',
      category: 'Workshop',
      organizer: 'Tech Society',
      attendees: 234
    },
    {
      id: '5',
      title: 'Fall Semester Exams Begin',
      description: 'Final examination period starts. Check your exam schedule on the portal.',
      date: 'December 1, 2025',
      time: 'All Day',
      location: 'Various Locations',
      category: 'Exam',
      organizer: 'Academic Office',
      attendees: 0
    },
    {
      id: '6',
      title: 'Alumni Meetup',
      description: 'Network with FAST alumni working in top tech companies.',
      date: 'November 25, 2025',
      time: '6:00 PM - 9:00 PM',
      location: 'Student Center',
      category: 'Social',
      organizer: 'Alumni Relations',
      attendees: 78
    }
  ];

  const categories = ['all', 'Academic', 'Social', 'Workshop', 'Seminar', 'Exam', 'Holiday'];

  const filteredEvents = events.filter(event => 
    selectedCategory === 'all' || event.category === selectedCategory
  );

  const upcomingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate >= today;
  });

  const pastEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate < today;
  });

  const handleRegister = (eventId: string) => {
    setRegisteredEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
        toast.info('Registration cancelled');
      } else {
        newSet.add(eventId);
        toast.success('Registered for event');
      }
      return newSet;
    });
  };

  const handleToggleReminder = (eventId: string) => {
    setRemindersEnabled(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
        toast.info('Reminder disabled');
      } else {
        newSet.add(eventId);
        toast.success('Reminder enabled');
      }
      return newSet;
    });
  };

  const renderEventCard = (event: Event) => {
    const isRegistered = registeredEvents.has(event.id);
    const hasReminder = remindersEnabled.has(event.id);

    return (
      <div 
        key={event.id} 
        className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-white font-semibold pr-3 group-hover:text-indigo-400 transition-colors">{event.title}</h3>
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs font-medium shrink-0 rounded-lg">
            {event.category}
          </Badge>
        </div>
        
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <CalendarIcon className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{event.organizer}</span>
            {event.attendees > 0 && <span className="text-slate-500">· {event.attendees} attending</span>}
          </div>
        </div>

        {isRegistered && (
          <div className="mb-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-emerald-500 font-medium">Registered</span>
          </div>
        )}

        <div className="flex gap-3">
          {event.category !== 'Exam' && event.category !== 'Holiday' && (
            <Button
              variant={isRegistered ? 'outline' : 'default'}
              className={`flex-1 text-sm h-10 rounded-xl transition-all ${
                isRegistered 
                  ? 'bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-red-500/50 hover:text-red-400' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/20'
              }`}
              onClick={() => handleRegister(event.id)}
            >
              {isRegistered ? <><X className="w-4 h-4 mr-1" />Cancel</> : <><Check className="w-4 h-4 mr-1" />Register</>}
            </Button>
          )}
          <Button
            variant="outline"
            className={`${event.category === 'Exam' || event.category === 'Holiday' ? 'flex-1' : ''} text-sm h-10 rounded-xl bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-indigo-500/50 hover:text-indigo-400 transition-all`}
            onClick={() => handleToggleReminder(event.id)}
          >
            {hasReminder ? <><BellOff className="w-4 h-4 mr-1" />Off</> : <><Bell className="w-4 h-4 mr-1" />Remind</>}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navigation user={user} currentScreen="events" onNavigate={onNavigate} onLogout={onLogout} darkMode={darkMode} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 sm:pt-24">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Events</h1>
              <p className="text-slate-400">Stay updated with upcoming events</p>
            </div>
            {user.role === 'admin' && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 max-w-lg rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white text-xl">Create Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventTitle" className="text-slate-400 text-sm font-medium">Title</Label>
                      <Input id="eventTitle" placeholder="Event title" className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="eventDate" className="text-slate-400 text-sm font-medium">Date</Label>
                        <Input id="eventDate" type="date" className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eventTime" className="text-slate-400 text-sm font-medium">Time</Label>
                        <Input id="eventTime" placeholder="2:00 PM - 4:00 PM" className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventLocation" className="text-slate-400 text-sm font-medium">Location</Label>
                      <Input id="eventLocation" placeholder="Event location" className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventDescription" className="text-slate-400 text-sm font-medium">Description</Label>
                      <Textarea id="eventDescription" placeholder="Event description" rows={3} className="bg-slate-950/50 border-slate-800 text-white rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-slate-700 text-slate-400 hover:bg-slate-800 h-11 px-5 rounded-xl">
                        Cancel
                      </Button>
                      <Button onClick={() => { toast.success('Event created'); setCreateDialogOpen(false); }} className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-5 rounded-xl">
                        Create
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Active Reminders */}
          {remindersEnabled.size > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-md rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-indigo-400" />
                <span className="text-sm text-slate-300">
                  {remindersEnabled.size} reminder{remindersEnabled.size !== 1 ? 's' : ''} active
                </span>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  selectedCategory === category 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>

          {/* Events Tabs */}
          <Tabs defaultValue="upcoming">
            <TabsList className="bg-transparent border-b border-slate-800 rounded-none w-full justify-start gap-0 h-auto p-0 mb-6">
              <TabsTrigger 
                value="upcoming" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-white text-slate-400 bg-transparent px-4 py-3 text-sm font-medium hover:text-slate-200"
              >
                Upcoming ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger 
                value="past" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-white text-slate-400 bg-transparent px-4 py-3 text-sm font-medium hover:text-slate-200"
              >
                Past ({pastEvents.length})
              </TabsTrigger>
              <TabsTrigger 
                value="registered" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-white text-slate-400 bg-transparent px-4 py-3 text-sm font-medium hover:text-slate-200"
              >
                Registered ({registeredEvents.size})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {upcomingEvents.map(event => renderEventCard(event))}
              </div>
              {upcomingEvents.length === 0 && (
                <div className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-md rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <CalendarIcon className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">No upcoming events</h3>
                  <p className="text-sm text-slate-400">Check back later for new events</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {pastEvents.map(event => renderEventCard(event))}
              </div>
              {pastEvents.length === 0 && (
                <div className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-md rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <CalendarIcon className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">No past events</h3>
                  <p className="text-sm text-slate-400">Past events will appear here</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="registered">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {events.filter(e => registeredEvents.has(e.id)).map(event => renderEventCard(event))}
              </div>
              {registeredEvents.size === 0 && (
                <div className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-md rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <CalendarIcon className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">No registered events</h3>
                  <p className="text-sm text-slate-400">Register for events to see them here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

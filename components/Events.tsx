import { useState } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
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
  Filter,
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
  toggleTheme: () => void;
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
  isRegistered?: boolean;
  hasReminder?: boolean;
}

export function Events({ user, onNavigate, onLogout, darkMode, toggleTheme }: EventsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set(['1', '3']));
  const [remindersEnabled, setRemindersEnabled] = useState<Set<string>>(new Set(['1', '3']));

  const events: Event[] = [
    {
      id: '1',
      title: 'Tech Talk: AI in Education',
      description: 'Join us for an insightful discussion on how artificial intelligence is transforming education and learning experiences.',
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
      description: 'Hands-on workshop covering modern web development technologies including React, Node.js, and MongoDB.',
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
      description: 'Annual seminar featuring guest speakers from leading tech companies discussing industry trends.',
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
      time: '9:00 AM (22nd) - 9:00 AM (23rd)',
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
      description: 'Network with FAST alumni working in top tech companies. Great opportunity for career guidance.',
      date: 'November 25, 2025',
      time: '6:00 PM - 9:00 PM',
      location: 'Student Center',
      category: 'Social',
      organizer: 'Alumni Relations',
      attendees: 78
    },
    {
      id: '7',
      title: 'Machine Learning Seminar',
      description: 'Introduction to Machine Learning algorithms and their real-world applications.',
      date: 'November 20, 2025',
      time: '3:00 PM - 5:00 PM',
      location: 'Auditorium B',
      category: 'Seminar',
      organizer: 'Dr. Ahmed Raza',
      attendees: 112
    },
    {
      id: '8',
      title: 'Winter Break',
      description: 'University closed for winter holidays. Enjoy your break!',
      date: 'December 20, 2025',
      time: 'All Day',
      location: 'N/A',
      category: 'Holiday',
      organizer: 'Academic Office',
      attendees: 0
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
        toast.success('Registered for event!');
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
        toast.success('Reminder enabled!');
      }
      return newSet;
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Academic': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Social': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Workshop': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'Seminar': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'Exam': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'Holiday': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
    };
    return colors[category as keyof typeof colors] || colors['Academic'];
  };

  const renderEventCard = (event: Event) => {
    const isRegistered = registeredEvents.has(event.id);
    const hasReminder = remindersEnabled.has(event.id);

    return (
      <Card key={event.id} className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-gray-900 dark:text-white">{event.title}</h4>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-3">{event.description}</p>
          </div>
          <Badge className={getCategoryColor(event.category)}>
            {event.category}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <CalendarIcon className="w-4 h-4 flex-shrink-0" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>{event.organizer}</span>
            {event.attendees > 0 && <span>• {event.attendees} attending</span>}
          </div>
        </div>

        {isRegistered && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-200">You are registered for this event</span>
          </div>
        )}

        <div className="flex gap-2">
          {event.category !== 'Exam' && event.category !== 'Holiday' && (
            <Button
              variant={isRegistered ? 'outline' : 'default'}
              className="flex-1"
              onClick={() => handleRegister(event.id)}
            >
              {isRegistered ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel Registration
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Register
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            className={event.category === 'Exam' || event.category === 'Holiday' ? 'flex-1' : ''}
            onClick={() => handleToggleReminder(event.id)}
          >
            {hasReminder ? (
              <>
                <BellOff className="w-4 h-4 mr-2" />
                Remove Reminder
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Set Reminder
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation
        user={user}
        currentScreen="events"
        onNavigate={onNavigate}
        onLogout={onLogout}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-gray-900 dark:text-white mb-2">Events & Calendar</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated with upcoming events and important dates
            </p>
          </div>
          {user.role === 'admin' && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">Create New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventTitle" className="text-gray-900 dark:text-white">
                      Event Title
                    </Label>
                    <Input
                      id="eventTitle"
                      placeholder="Enter event title"
                      className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventDate" className="text-gray-900 dark:text-white">
                        Date
                      </Label>
                      <Input
                        id="eventDate"
                        type="date"
                        className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventTime" className="text-gray-900 dark:text-white">
                        Time
                      </Label>
                      <Input
                        id="eventTime"
                        placeholder="e.g., 2:00 PM - 4:00 PM"
                        className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventLocation" className="text-gray-900 dark:text-white">
                      Location
                    </Label>
                    <Input
                      id="eventLocation"
                      placeholder="Event location"
                      className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventDescription" className="text-gray-900 dark:text-white">
                      Description
                    </Label>
                    <Textarea
                      id="eventDescription"
                      placeholder="Event description"
                      rows={4}
                      className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      toast.success('Event created successfully!');
                      setCreateDialogOpen(false);
                    }}>
                      Create Event
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Active Notifications */}
        {remindersEnabled.size > 0 && (
          <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <h4 className="text-blue-900 dark:text-blue-300 mb-1">Active Reminders</h4>
                <p className="text-blue-800 dark:text-blue-200">
                  You have {remindersEnabled.size} event reminder{remindersEnabled.size !== 1 ? 's' : ''} enabled. 
                  You'll be notified before each event.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Category Filter */}
        <Card className="p-4 mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Events' : category}
              </Button>
            ))}
          </div>
        </Card>

        {/* Events Tabs */}
        <Tabs defaultValue="upcoming">
          <TabsList className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mb-6">
            <TabsTrigger value="upcoming">
              Upcoming Events ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Events ({pastEvents.length})
            </TabsTrigger>
            <TabsTrigger value="registered">
              My Events ({registeredEvents.size})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => renderEventCard(event))}
            </div>
            {upcomingEvents.length === 0 && (
              <Card className="p-12 text-center bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-gray-900 dark:text-white mb-2">No upcoming events</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back later for new events
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map(event => renderEventCard(event))}
            </div>
            {pastEvents.length === 0 && (
              <Card className="p-12 text-center bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-gray-900 dark:text-white mb-2">No past events</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Past events will appear here
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="registered">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.filter(e => registeredEvents.has(e.id)).map(event => renderEventCard(event))}
            </div>
            {registeredEvents.size === 0 && (
              <Card className="p-12 text-center bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-gray-900 dark:text-white mb-2">No registered events</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Register for events to see them here
                </p>
                <Button onClick={() => document.querySelector('[value="upcoming"]')?.dispatchEvent(new Event('click', { bubbles: true }))}>
                  Browse Events
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { 
  Calendar as CalendarIcon, 
  Clock,
  MapPin,
  Users,
  Bell,
  BellOff,
  Plus,
  Check,
  X,
  Loader2,
  ExternalLink,
  Trash2,
  Edit,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Screen, User } from '@/app/page';
import {
  Event,
  EventCategory,
  Society,
  subscribeToEvents,
  subscribeToUserRegistrations,
  subscribeToSocieties,
  createEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  toggleEventReminder,
  canUserCreateEvent,
  formatEventDate,
  isEventUpcoming,
  getEventCountdown,
  EventRegistration,
} from '@/lib/eventsSystem';

interface EventsProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
}

export function Events({ user, onNavigate, onLogout, darkMode }: EventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<EventRegistration[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [userSocieties, setUserSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [canCreate, setCanCreate] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    category: 'Seminar' as EventCategory,
    maxAttendees: '',
    registrationLink: '',
    societyId: '',
  });

  const categories: (EventCategory | 'all')[] = ['all', 'Academic', 'Social', 'Workshop', 'Seminar', 'Exam', 'Holiday', 'Sports', 'Cultural'];

  // Subscribe to data
  useEffect(() => {
    const unsubEvents = subscribeToEvents((fetchedEvents) => {
      setEvents(fetchedEvents);
      setLoading(false);
    });

    const unsubRegistrations = subscribeToUserRegistrations(user.id, (registrations) => {
      setUserRegistrations(registrations);
    });

    const unsubSocieties = subscribeToSocieties((fetchedSocieties) => {
      setSocieties(fetchedSocieties);
    });

    // Check if user can create events
    canUserCreateEvent(user.id).then(({ canCreate, societies }) => {
      setCanCreate(canCreate || user.role === 'admin');
      setUserSocieties(societies);
    });

    return () => {
      unsubEvents();
      unsubRegistrations();
      unsubSocieties();
    };
  }, [user.id, user.role]);

  // Get registered event IDs
  const registeredEventIds = new Set(userRegistrations.map(r => r.eventId));
  const reminderEnabledIds = new Set(userRegistrations.filter(r => r.reminderEnabled).map(r => r.eventId));

  // Filter events
  const filteredEvents = events.filter(event => 
    selectedCategory === 'all' || event.category === selectedCategory
  );

  const upcomingEvents = filteredEvents.filter(event => isEventUpcoming(event.date));
  const pastEvents = filteredEvents.filter(event => !isEventUpcoming(event.date));
  const registeredEvents = events.filter(event => registeredEventIds.has(event.id));

  const handleRegister = async (eventId: string) => {
    const isRegistered = registeredEventIds.has(eventId);
    
    try {
      if (isRegistered) {
        await unregisterFromEvent(eventId, user.id);
        toast.info('Registration cancelled');
      } else {
        await registerForEvent(eventId, user.id, {
          userName: user.name,
          userEmail: user.email,
          userDepartment: user.department,
        });
        toast.success('Registered for event!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to update registration');
    }
  };

  const handleToggleReminder = async (eventId: string) => {
    const hasReminder = reminderEnabledIds.has(eventId);
    
    try {
      await toggleEventReminder(eventId, user.id, !hasReminder);
      toast.success(hasReminder ? 'Reminder disabled' : 'Reminder enabled');
    } catch (error) {
      console.error('Reminder error:', error);
      toast.error('Failed to update reminder');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await deleteEvent(eventId);
      toast.success('Event deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const selectedSociety = userSocieties.find(s => s.id === formData.societyId);
      
      await createEvent({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        endTime: formData.endTime || undefined,
        location: formData.location,
        category: formData.category,
        organizerId: user.id,
        organizerName: selectedSociety ? selectedSociety.name : user.name,
        organizerSociety: selectedSociety?.name,
        societyId: formData.societyId || undefined,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        registrationLink: formData.registrationLink || undefined,
      });

      toast.success('Event created successfully!');
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        endTime: '',
        location: '',
        category: 'Seminar',
        maxAttendees: '',
        registrationLink: '',
        societyId: '',
      });
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create event');
    } finally {
      setIsCreating(false);
    }
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

  const renderEventCard = (event: Event) => {
    const isRegistered = registeredEventIds.has(event.id);
    const hasReminder = reminderEnabledIds.has(event.id);
    const isOrganizer = event.organizerId === user.id;
    const isUpcoming = isEventUpcoming(event.date);

    return (
      <div 
        key={event.id} 
        className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-white font-semibold group-hover:text-indigo-400 transition-colors truncate">{event.title}</h3>
            {event.organizerSociety && (
              <p className="text-xs text-indigo-400 mt-1">by {event.organizerSociety}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getCategoryColor(event.category)} text-white border-0 text-xs font-medium shrink-0 rounded-lg`}>
              {event.category}
            </Badge>
            {isOrganizer && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                onClick={() => handleDelete(event.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <CalendarIcon className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{formatEventDate(event.date)}</span>
            <Badge variant="outline" className="ml-auto text-xs border-indigo-500/30 text-indigo-400">
              {getEventCountdown(event.date)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{event.time}{event.endTime ? ` - ${event.endTime}` : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{event.organizerName}</span>
            {event.attendeeCount > 0 && (
              <span className="text-slate-500">
                · {event.attendeeCount} attending
                {event.maxAttendees && ` / ${event.maxAttendees} max`}
              </span>
            )}
          </div>
        </div>

        {isRegistered && isUpcoming && (
          <div className="mb-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-emerald-500 font-medium">Registered</span>
          </div>
        )}

        <div className="flex gap-3">
          {event.registrationLink ? (
            <Button
              className="flex-1 text-sm h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border-0"
              onClick={() => window.open(event.registrationLink, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Register (Google Form)
            </Button>
          ) : (
            isUpcoming && event.category !== 'Exam' && event.category !== 'Holiday' && (
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
            )
          )}
          {isUpcoming && (
            <Button
              variant="outline"
              className={`${!event.registrationLink && (event.category === 'Exam' || event.category === 'Holiday') ? 'flex-1' : ''} text-sm h-10 rounded-xl bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-indigo-500/50 hover:text-indigo-400 transition-all`}
              onClick={() => handleToggleReminder(event.id)}
            >
              {hasReminder ? <><BellOff className="w-4 h-4 mr-1" />Off</> : <><Bell className="w-4 h-4 mr-1" />Remind</>}
            </Button>
          )}
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
            {canCreate && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 max-w-lg rounded-2xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle className="text-white text-xl">Create Event</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="eventTitle" className="text-slate-400 text-sm font-medium">Title *</Label>
                        <Input 
                          id="eventTitle" 
                          placeholder="Event title" 
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
                        />
                      </div>

                      {userSocieties.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-slate-400 text-sm font-medium">Organize as</Label>
                          <Select 
                            value={formData.societyId} 
                            onValueChange={(value) => setFormData({ ...formData, societyId: value })}
                          >
                            <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl">
                              <SelectValue placeholder="Personal or Society" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800">
                              <SelectItem value="">Personal ({user.name})</SelectItem>
                              {userSocieties.map(society => (
                                <SelectItem key={society.id} value={society.id}>
                                  {society.name} ({society.uniqueId})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-slate-400 text-sm font-medium">Category *</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => setFormData({ ...formData, category: value as EventCategory })}
                        >
                          <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800">
                            {categories.filter(c => c !== 'all').map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="eventDate" className="text-slate-400 text-sm font-medium">Date *</Label>
                          <Input 
                            id="eventDate" 
                            type="date" 
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="eventTime" className="text-slate-400 text-sm font-medium">Start Time *</Label>
                          <Input 
                            id="eventTime" 
                            placeholder="2:00 PM" 
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="eventEndTime" className="text-slate-400 text-sm font-medium">End Time</Label>
                          <Input 
                            id="eventEndTime" 
                            placeholder="4:00 PM" 
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxAttendees" className="text-slate-400 text-sm font-medium">Max Attendees</Label>
                          <Input 
                            id="maxAttendees" 
                            type="number"
                            placeholder="100" 
                            value={formData.maxAttendees}
                            onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                            className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="eventLocation" className="text-slate-400 text-sm font-medium">Location *</Label>
                        <Input 
                          id="eventLocation" 
                          placeholder="Event location" 
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registrationLink" className="text-slate-400 text-sm font-medium">
                          External Registration Link (Google Form)
                        </Label>
                        <Input 
                          id="registrationLink" 
                          placeholder="https://forms.google.com/..." 
                          value={formData.registrationLink}
                          onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                          className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
                        />
                        <p className="text-xs text-slate-500">Leave empty to use in-app registration</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="eventDescription" className="text-slate-400 text-sm font-medium">Description</Label>
                        <Textarea 
                          id="eventDescription" 
                          placeholder="Event description" 
                          rows={3} 
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="bg-slate-950/50 border-slate-800 text-white rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
                        />
                      </div>

                      <div className="flex gap-3 justify-end pt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setCreateDialogOpen(false)} 
                          className="border-slate-700 text-slate-400 hover:bg-slate-800 h-11 px-5 rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateEvent} 
                          disabled={isCreating}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-5 rounded-xl"
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Event'
                          )}
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Active Reminders */}
          {reminderEnabledIds.size > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-md rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-indigo-400" />
                <span className="text-sm text-slate-300">
                  {reminderEnabledIds.size} reminder{reminderEnabledIds.size !== 1 ? 's' : ''} active
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

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : (
            /* Events Tabs */
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
                  Registered ({registeredEvents.length})
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
                    <p className="text-sm text-slate-400">
                      {canCreate ? 'Create an event to get started!' : 'Check back later for new events'}
                    </p>
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
                  {registeredEvents.map(event => renderEventCard(event))}
                </div>
                {registeredEvents.length === 0 && (
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
          )}
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Search,
  Sparkles,
  Send,
  Copy,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import type { Screen, User } from '@/app/page';

interface FacultyContactProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  office: string;
  officeHours: string;
  courses: string[];
}

export function FacultyContact({ user, onNavigate, onLogout, darkMode, toggleTheme }: FacultyContactProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailPurpose, setEmailPurpose] = useState('');

  const facultyMembers: FacultyMember[] = [
    {
      id: '1',
      name: 'Dr. Muhammad Khan',
      designation: 'Professor',
      department: 'Computer Science',
      email: 'muhammad.khan@nu.edu.pk',
      phone: '+92 21 1234 5678',
      office: 'Room 301, CS Building',
      officeHours: 'Mon-Wed 2:00 PM - 4:00 PM',
      courses: ['Data Structures', 'Algorithms']
    },
    {
      id: '2',
      name: 'Dr. Ayesha Ahmed',
      designation: 'Associate Professor',
      department: 'Computer Science',
      email: 'ayesha.ahmed@nu.edu.pk',
      phone: '+92 21 1234 5679',
      office: 'Room 305, CS Building',
      officeHours: 'Tue-Thu 3:00 PM - 5:00 PM',
      courses: ['Database Systems', 'Web Development']
    },
    {
      id: '3',
      name: 'Prof. Ali Hassan',
      designation: 'Professor',
      department: 'Software Engineering',
      email: 'ali.hassan@nu.edu.pk',
      phone: '+92 21 1234 5680',
      office: 'Room 210, SE Building',
      officeHours: 'Mon-Fri 1:00 PM - 3:00 PM',
      courses: ['Software Engineering', 'Requirements Engineering']
    },
    {
      id: '4',
      name: 'Dr. Fatima Malik',
      designation: 'Assistant Professor',
      department: 'Computer Science',
      email: 'fatima.malik@nu.edu.pk',
      phone: '+92 21 1234 5681',
      office: 'Room 308, CS Building',
      officeHours: 'Wed-Fri 10:00 AM - 12:00 PM',
      courses: ['Operating Systems', 'Computer Networks']
    },
    {
      id: '5',
      name: 'Dr. Ahmed Raza',
      designation: 'Assistant Professor',
      department: 'Computer Science',
      email: 'ahmed.raza@nu.edu.pk',
      phone: '+92 21 1234 5682',
      office: 'Room 312, CS Building',
      officeHours: 'Mon-Wed 11:00 AM - 1:00 PM',
      courses: ['Artificial Intelligence', 'Machine Learning']
    },
    {
      id: '6',
      name: 'Dr. Sara Ibrahim',
      designation: 'Associate Professor',
      department: 'Software Engineering',
      email: 'sara.ibrahim@nu.edu.pk',
      phone: '+92 21 1234 5683',
      office: 'Room 215, SE Building',
      officeHours: 'Tue-Thu 2:00 PM - 4:00 PM',
      courses: ['Software Quality Assurance', 'Project Management']
    }
  ];

  const departments = ['all', 'Computer Science', 'Software Engineering', 'Electrical Engineering'];

  const filteredFaculty = facultyMembers.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faculty.courses.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDepartment = selectedDepartment === 'all' || faculty.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleGenerateEmail = () => {
    if (!emailPurpose) {
      toast.error('Please select email purpose');
      return;
    }

    let subject = '';
    let body = '';

    switch (emailPurpose) {
      case 'query':
        subject = 'Query Regarding Course Material';
        body = `Dear ${selectedFaculty?.name},\n\nI hope this email finds you well. I am ${user.name}, a student in your ${selectedFaculty?.courses[0]} course.\n\nI have a query regarding [specific topic]. Could you please help me understand [your question]?\n\nThank you for your time and guidance.\n\nBest regards,\n${user.name}\n${user.fastId}`;
        break;
      case 'appointment':
        subject = 'Request for Appointment';
        body = `Dear ${selectedFaculty?.name},\n\nI hope this email finds you well. I am ${user.name}, enrolled in your ${selectedFaculty?.courses[0]} course.\n\nI would like to schedule an appointment to discuss [topic/concern]. Would it be possible to meet during your office hours or at another convenient time?\n\nThank you for considering my request.\n\nBest regards,\n${user.name}\n${user.fastId}`;
        break;
      case 'assignment':
        subject = 'Query About Assignment Submission';
        body = `Dear ${selectedFaculty?.name},\n\nI hope this email finds you well. I am ${user.name} from your ${selectedFaculty?.courses[0]} class.\n\nI have a question regarding the recent assignment. [Explain your query about the assignment].\n\nI would appreciate your guidance on this matter.\n\nThank you,\n${user.name}\n${user.fastId}`;
        break;
      case 'absence':
        subject = 'Notification of Absence';
        body = `Dear ${selectedFaculty?.name},\n\nI hope this email finds you well. I am ${user.name} from your ${selectedFaculty?.courses[0]} class.\n\nI am writing to inform you that I will be unable to attend class on [date] due to [reason]. I will ensure to catch up on the missed material.\n\nThank you for your understanding.\n\nBest regards,\n${user.name}\n${user.fastId}`;
        break;
      default:
        subject = 'General Inquiry';
        body = `Dear ${selectedFaculty?.name},\n\nI hope this email finds you well. I am ${user.name}, a student in the ${user.department} department.\n\n[Write your message here]\n\nThank you for your time.\n\nBest regards,\n${user.name}\n${user.fastId}`;
    }

    setEmailSubject(subject);
    setEmailBody(body);
    toast.success('Email draft generated by AI!');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    toast.success('Email copied to clipboard!');
  };

  const handleSendEmail = () => {
    toast.success('Email sent successfully!');
    setEmailDialogOpen(false);
    setEmailSubject('');
    setEmailBody('');
    setEmailPurpose('');
    setSelectedFaculty(null);
  };

  const openEmailDialog = (faculty: FacultyMember) => {
    setSelectedFaculty(faculty);
    setEmailDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation
        user={user}
        currentScreen="faculty"
        onNavigate={onNavigate}
        onLogout={onLogout}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-gray-900 dark:text-white mb-2">Faculty Contact</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Find and contact faculty members with AI-powered email assistance
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="p-6 mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by name or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map(faculty => (
            <Card key={faculty.id} className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xl">
                    {getInitials(faculty.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-gray-900 dark:text-white mb-1">{faculty.name}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{faculty.designation}</p>
                  <Badge variant="secondary" className="mt-2">{faculty.department}</Badge>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                  <a href={`mailto:${faculty.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 break-all">
                    {faculty.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{faculty.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>{faculty.office}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>{faculty.officeHours}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-900 dark:text-white mb-2">Courses:</p>
                <div className="flex flex-wrap gap-2">
                  {faculty.courses.map((course, index) => (
                    <Badge key={index} variant="outline">{course}</Badge>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => openEmailDialog(faculty)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Draft Email with AI
              </Button>
            </Card>
          ))}
        </div>

        {filteredFaculty.length === 0 && (
          <Card className="p-12 text-center bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <Mail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-gray-900 dark:text-white mb-2">No faculty found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedDepartment('all');
            }}>
              Clear Filters
            </Button>
          </Card>
        )}

        {/* Email Dialog */}
        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">
                Compose Email to {selectedFaculty?.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-900 dark:text-blue-300 mb-2">AI Email Assistant</h4>
                    <p className="text-blue-800 dark:text-blue-200 mb-3">
                      Select the purpose of your email and let AI generate a professional draft for you.
                    </p>
                    <div className="space-y-2">
                      <Label className="text-blue-900 dark:text-blue-300">Email Purpose</Label>
                      <Select value={emailPurpose} onValueChange={setEmailPurpose}>
                        <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="query">Course Material Query</SelectItem>
                          <SelectItem value="appointment">Request Appointment</SelectItem>
                          <SelectItem value="assignment">Assignment Query</SelectItem>
                          <SelectItem value="absence">Absence Notification</SelectItem>
                          <SelectItem value="general">General Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleGenerateEmail} className="w-full mt-2">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Generate Email Draft
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-gray-900 dark:text-white">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body" className="text-gray-900 dark:text-white">Message</Label>
                <Textarea
                  id="body"
                  placeholder="Email body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={12}
                  className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEmailDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="outline" onClick={handleCopyEmail} className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button onClick={handleSendEmail} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

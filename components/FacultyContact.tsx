// FULL UPDATED FacultyContact.tsx
import { useState } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Mail, Phone, MapPin, Clock, Search, Sparkles, Send, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { Screen, User } from '@/app/page';

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

export function FacultyContact({ user, onNavigate, onLogout, darkMode, toggleTheme }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailPurpose, setEmailPurpose] = useState('');

  const facultyMembers: FacultyMember[] = [
    // ---- AI & DS ----
    { id: '1', name: 'Dr. Hasan Mujtaba', designation: 'Professor, Head of School', department: 'Artificial Intelligence & Data Science', email: 'hasan.mujtaba@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '2', name: 'Dr. Ahmad Din', designation: 'Professor & HOD (AI&DS)', department: 'Artificial Intelligence & Data Science', email: 'ahmad.din@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '3', name: 'Dr. Waseem Shahzad', designation: 'Professor & Director', department: 'Artificial Intelligence & Data Science', email: 'waseem.shahzad@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '4', name: 'Dr. Muhammad Asif Naeem', designation: 'Professor & Director (ORIC)', department: 'Artificial Intelligence & Data Science', email: 'asif.naeem@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '5', name: 'Dr. Mirza Omer Beg', designation: 'Professor (Adjunct)', department: 'Artificial Intelligence & Data Science', email: 'omer.beg@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '6', name: 'Dr. Muhammad Ishtiaq', designation: 'Associate Professor', department: 'Artificial Intelligence & Data Science', email: 'ishtiaq@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '7', name: 'Dr. Muhammad Mateen Yaqoob', designation: 'Assistant Professor', department: 'Artificial Intelligence & Data Science', email: 'mateen.yaqoob@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '8', name: 'Dr. Muhammad Nouman Noor', designation: 'Assistant Professor', department: 'Artificial Intelligence & Data Science', email: 'nouman.noor@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '9', name: 'Dr. Noshina Tariq', designation: 'Assistant Professor', department: 'Artificial Intelligence & Data Science', email: 'noshina.tariq@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },

    // ---- CS ----
    { id: '10', name: 'Dr. Muhammad Arshad Islam', designation: 'Professor & HOD (CS)', department: 'Computer Science', email: 'arshad.islam@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '11', name: 'Dr. Hammad Majeed', designation: 'Professor & Director (IQAE)', department: 'Computer Science', email: 'hammad.majeed@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '12', name: 'Dr. Akhtar Jamil', designation: 'Associate Professor', department: 'Computer Science', email: 'akhtar.jamil@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '13', name: 'Dr. Ahmad Raza Shahid', designation: 'Professor', department: 'Computer Science', email: 'ahmad.shahid@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '14', name: 'Dr. Danish Shehzad', designation: 'Associate Professor', department: 'Computer Science', email: 'danish.shehzad@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '15', name: 'Dr. Ejaz Ahmed', designation: 'Associate Professor', department: 'Computer Science', email: 'ejaz.ahmed@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '16', name: 'Dr. Labiba Fahad', designation: 'Associate Professor', department: 'Computer Science', email: 'labiba.fahad@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },

    // ---- Cyber Security ----
    { id: '17', name: 'Dr. Muhammad Qaisar Shafi', designation: 'Assistant Professor & Incharge (CY)', department: 'Cyber Security', email: 'qaisar.shafi@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '18', name: 'Dr. Muhammad Asim', designation: 'Professor', department: 'Cyber Security', email: 'asim@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '19', name: 'Dr. Zafar Iqbal Abbasi', designation: 'Associate Professor', department: 'Cyber Security', email: 'zafar.abbasi@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '20', name: 'Dr. Subhan Ullah', designation: 'Associate Professor', department: 'Cyber Security', email: 'subhan.ullah@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '21', name: 'Dr. Sana Aurangzeb', designation: 'Assistant Professor', department: 'Cyber Security', email: 'sana.aurangzeb@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },

    // ---- Software Engineering ----
    { id: '22', name: 'Dr. Usman Habib', designation: 'Professor & HOD (SE)', department: 'Software Engineering', email: 'usman.habib@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '23', name: 'Dr. Naveed Ahmad', designation: 'Professor (Adjunct)', department: 'Software Engineering', email: 'naveed.ahmad@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '24', name: 'Dr. Atif Aftab Ahmed Jilani', designation: 'Assistant Professor', department: 'Software Engineering', email: 'atif.jilani@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
  ];

  const departments = ['all', 'Artificial Intelligence & Data Science', 'Computer Science', 'Cyber Security', 'Software Engineering'];

  const filteredFaculty = facultyMembers.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || faculty.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleGenerateEmail = () => {
    if (!emailPurpose) return toast.error('Please select email purpose');

    let subject = '';
    let body = '';

    switch (emailPurpose) {
      case 'query':
        subject = 'Query Regarding Course Material';
        body = `Dear ${selectedFaculty?.name},

I hope this email finds you well. I have a question regarding [topic].

Regards,
${user.name}`;
        break;
      case 'appointment':
        subject = 'Request for Appointment';
        body = `Dear ${selectedFaculty?.name},

I would like to schedule an appointment regarding [topic].

Regards,
${user.name}`;
        break;
      case 'assignment':
        subject = 'Assignment Query';
        body = `Dear ${selectedFaculty?.name},

I have a question about the recent assignment: [details].

Thank you,
${user.name}`;
        break;
      case 'absence':
        subject = 'Absence Notification';
        body = `Dear ${selectedFaculty?.name},

I will be unable to attend class on [date] due to [reason].

Regards,
${user.name}`;
        break;
      default:
        subject = 'General Inquiry';
        body = `Dear ${selectedFaculty?.name},

[Write your message here]

Regards,
${user.name}`;
    }

    setEmailSubject(subject);
    setEmailBody(body);
    toast.success('Email draft generated');
  };

  const handleCopyEmail= () => {
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

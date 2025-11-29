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
import { Mail, Phone, MapPin, Clock, Search, Sparkles, Send, Copy, RefreshCw, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { generateEmailWithAI } from '@/lib/aiQuizGenerator';
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

export function FacultyContact({ user, onNavigate, onLogout, darkMode }: { user: User; onNavigate: (screen: Screen) => void; onLogout: () => void; darkMode: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailPurpose, setEmailPurpose] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const facultyMembers: FacultyMember[] = [
    { id: '1', name: 'Dr. Hasan Mujtaba', designation: 'Professor, Head of School', department: 'Artificial Intelligence & Data Science', email: 'hasan.mujtaba@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '2', name: 'Dr. Ahmad Din', designation: 'Professor & HOD (AI&DS)', department: 'Artificial Intelligence & Data Science', email: 'ahmad.din@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '3', name: 'Dr. Waseem Shahzad', designation: 'Professor & Director', department: 'Artificial Intelligence & Data Science', email: 'waseem.shahzad@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '4', name: 'Dr. Muhammad Asif Naeem', designation: 'Professor & Director (ORIC)', department: 'Artificial Intelligence & Data Science', email: 'asif.naeem@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '5', name: 'Dr. Mirza Omer Beg', designation: 'Professor (Adjunct)', department: 'Artificial Intelligence & Data Science', email: 'omer.beg@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '6', name: 'Dr. Muhammad Ishtiaq', designation: 'Associate Professor', department: 'Artificial Intelligence & Data Science', email: 'ishtiaq@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '7', name: 'Dr. Muhammad Mateen Yaqoob', designation: 'Assistant Professor', department: 'Artificial Intelligence & Data Science', email: 'mateen.yaqoob@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '8', name: 'Dr. Muhammad Nouman Noor', designation: 'Assistant Professor', department: 'Artificial Intelligence & Data Science', email: 'nouman.noor@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '9', name: 'Dr. Noshina Tariq', designation: 'Assistant Professor', department: 'Artificial Intelligence & Data Science', email: 'noshina.tariq@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '10', name: 'Dr. Muhammad Arshad Islam', designation: 'Professor & HOD (CS)', department: 'Computer Science', email: 'arshad.islam@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '11', name: 'Dr. Hammad Majeed', designation: 'Professor & Director (IQAE)', department: 'Computer Science', email: 'hammad.majeed@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '12', name: 'Dr. Akhtar Jamil', designation: 'Associate Professor', department: 'Computer Science', email: 'akhtar.jamil@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '13', name: 'Dr. Ahmad Raza Shahid', designation: 'Professor', department: 'Computer Science', email: 'ahmad.shahid@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '14', name: 'Dr. Danish Shehzad', designation: 'Associate Professor', department: 'Computer Science', email: 'danish.shehzad@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '15', name: 'Dr. Ejaz Ahmed', designation: 'Associate Professor', department: 'Computer Science', email: 'ejaz.ahmed@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '16', name: 'Dr. Labiba Fahad', designation: 'Associate Professor', department: 'Computer Science', email: 'labiba.fahad@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '17', name: 'Dr. Muhammad Qaisar Shafi', designation: 'Assistant Professor & Incharge (CY)', department: 'Cyber Security', email: 'qaisar.shafi@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '18', name: 'Dr. Muhammad Asim', designation: 'Professor', department: 'Cyber Security', email: 'asim@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '19', name: 'Dr. Zafar Iqbal Abbasi', designation: 'Associate Professor', department: 'Cyber Security', email: 'zafar.abbasi@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '20', name: 'Dr. Subhan Ullah', designation: 'Associate Professor', department: 'Cyber Security', email: 'subhan.ullah@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
    { id: '21', name: 'Dr. Sana Aurangzeb', designation: 'Assistant Professor', department: 'Cyber Security', email: 'sana.aurangzeb@isb.edu.pk', phone: '', office: '', officeHours: '', courses: [] },
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

  const handleGenerateEmail = async () => {
    if (!emailPurpose) return toast.error('Please select email purpose');
    if (!selectedFaculty) return;

    setIsGenerating(true);
    try {
      const result = await generateEmailWithAI(
        selectedFaculty.name,
        selectedFaculty.designation,
        emailPurpose,
        user.name
      );
      
      setEmailSubject(result.subject);
      setEmailBody(result.body);
      toast.success('AI generated email draft!');
    } catch (error) {
      console.error('AI generation error:', error);
      // Fallback to simple templates if AI fails
      let subject = '';
      let body = '';

      switch (emailPurpose) {
        case 'query':
          subject = 'Query Regarding Course Material';
          body = `Dear ${selectedFaculty?.name},\n\nI hope this email finds you well. I have a question regarding [topic].\n\nRegards,\n${user.name}`;
          break;
        case 'appointment':
          subject = 'Request for Appointment';
          body = `Dear ${selectedFaculty?.name},\n\nI would like to schedule an appointment regarding [topic].\n\nRegards,\n${user.name}`;
          break;
        case 'assignment':
          subject = 'Assignment Query';
          body = `Dear ${selectedFaculty?.name},\n\nI have a question about the recent assignment: [details].\n\nThank you,\n${user.name}`;
          break;
        case 'absence':
          subject = 'Absence Notification';
          body = `Dear ${selectedFaculty?.name},\n\nI will be unable to attend class on [date] due to [reason].\n\nRegards,\n${user.name}`;
          break;
        case 'recommendation':
          subject = 'Request for Recommendation Letter';
          body = `Dear ${selectedFaculty?.name},\n\nI am writing to request a recommendation letter for [purpose].\n\nThank you for your consideration.\n\nRegards,\n${user.name}`;
          break;
        case 'feedback':
          subject = 'Request for Feedback';
          body = `Dear ${selectedFaculty?.name},\n\nI would appreciate your feedback on [topic/project].\n\nThank you,\n${user.name}`;
          break;
        default:
          subject = 'General Inquiry';
          body = `Dear ${selectedFaculty?.name},\n\n[Write your message here]\n\nRegards,\n${user.name}`;
      }

      setEmailSubject(subject);
      setEmailBody(body);
      toast.info('Using template (AI unavailable)');
    } finally {
      setIsGenerating(false);
    }
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
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navigation
          user={user}
          currentScreen="faculty"
          onNavigate={onNavigate}
          onLogout={onLogout}
          darkMode={darkMode}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 sm:pt-24">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Faculty Contact</h1>
            <p className="text-slate-400">
              Find and contact faculty members with AI-powered email assistance
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 h-11 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="bg-slate-950/50 border-slate-800 text-slate-300 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 rounded-xl">
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept} className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-white">
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Faculty Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredFaculty.map(faculty => (
              <div key={faculty.id} className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-14 h-14 border border-slate-700">
                    <AvatarFallback className="bg-slate-800 text-indigo-400 text-lg font-semibold">
                      {getInitials(faculty.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm mb-1 truncate group-hover:text-indigo-400 transition-colors">{faculty.name}</h4>
                    <p className="text-slate-400 text-xs mb-2">{faculty.designation}</p>
                    <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs truncate max-w-full rounded-lg">
                      {faculty.department}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-slate-400">
                    <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                    <a href={`mailto:${faculty.email}`} className="hover:text-indigo-400 break-all text-xs transition-colors duration-150">
                      {faculty.email}
                    </a>
                  </div>
                  {faculty.phone && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>{faculty.phone}</span>
                    </div>
                  )}
                  {faculty.office && (
                    <div className="flex items-start gap-2 text-slate-400 text-xs">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{faculty.office}</span>
                    </div>
                  )}
                  {faculty.officeHours && (
                    <div className="flex items-start gap-2 text-slate-400 text-xs">
                      <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{faculty.officeHours}</span>
                    </div>
                  )}
                </div>

                {faculty.courses.length > 0 && (
                  <div className="mb-4">
                    <p className="text-slate-500 text-xs mb-2">Courses:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {faculty.courses.map((course, index) => (
                        <Badge key={index} className="bg-slate-950/50 text-slate-400 border border-slate-800 text-xs rounded-lg">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all" 
                  onClick={() => openEmailDialog(faculty)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Draft Email with AI
                </Button>
              </div>
            ))}
          </div>

          {filteredFaculty.length === 0 && (
            <div className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-md rounded-2xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">No faculty found</h3>
              <p className="text-sm text-slate-400 mb-6">
                Try adjusting your search or filters
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDepartment('all');
                }} 
                className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white border-0 text-sm rounded-xl shadow-lg shadow-indigo-500/20"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Email Dialog */}
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl w-[95vw] max-h-[90vh] rounded-2xl flex flex-col p-0 overflow-hidden [&>button]:hidden">
              {/* Fixed Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 shrink-0">
                <DialogHeader className="p-0 space-y-0">
                  <DialogTitle className="text-white text-lg sm:text-xl">
                    Compose Email to {selectedFaculty?.name}
                  </DialogTitle>
                </DialogHeader>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEmailDialogOpen(false)}
                  className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-indigo-400 font-semibold text-sm mb-2">AI Email Assistant</h4>
                      <p className="text-slate-400 text-xs mb-3">
                        Select the purpose of your email and let AI generate a professional draft for you.
                      </p>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm font-medium">Email Purpose</Label>
                        <Select value={emailPurpose} onValueChange={setEmailPurpose}>
                          <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl">
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 rounded-xl">
                            <SelectItem value="query" className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-white">Course Material Query</SelectItem>
                            <SelectItem value="appointment" className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-white">Request Appointment</SelectItem>
                            <SelectItem value="assignment" className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-white">Assignment Query</SelectItem>
                            <SelectItem value="absence" className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-white">Absence Notification</SelectItem>
                            <SelectItem value="recommendation" className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-white">Recommendation Letter</SelectItem>
                            <SelectItem value="feedback" className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-white">Request Feedback</SelectItem>
                            <SelectItem value="general" className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-white">General Inquiry</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={handleGenerateEmail}
                          disabled={isGenerating || !emailPurpose}
                          className="w-full h-10 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0 text-sm rounded-xl disabled:opacity-50"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating with AI...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate with AI
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-slate-300 text-sm font-medium">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Email subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 h-11 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body" className="text-slate-300 text-sm font-medium">Message</Label>
                  <Textarea
                    id="body"
                    placeholder="Email body"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={8}
                    className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 font-mono text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[200px] resize-y"
                  />
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="border-t border-slate-800 p-4 sm:p-6 shrink-0 bg-slate-900">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setEmailDialogOpen(false)} 
                    className="sm:flex-1 h-10 bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white text-sm rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCopyEmail} 
                    className="sm:flex-1 h-10 bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white text-sm rounded-xl"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    onClick={handleSendEmail} 
                    className="sm:flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold border-0 text-sm rounded-xl shadow-lg shadow-indigo-500/20"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}

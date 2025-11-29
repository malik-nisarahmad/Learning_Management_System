import { useState } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Upload, 
  Search, 
  Filter, 
  ThumbsUp, 
  Eye, 
  Download, 
  FileText,
  Image as ImageIcon,
  File,
  Users,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { DocumentUpload } from './DocumentUpload';
import type { Screen, User } from '@/app/page';

interface StudyMaterialsProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
}

interface Material {
  id: string;
  title: string;
  course: string;
  type: 'PDF' | 'Image' | 'Document';
  description: string;
  uploadedBy: string;
  uploadDate: string;
  likes: number;
  views: number;
  downloads: number;
  category: string;
  documentUrl?: string;
}

export function StudyMaterials({ user, onNavigate, onLogout, darkMode }: StudyMaterialsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('likes');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [likedMaterials, setLikedMaterials] = useState<Set<string>>(new Set());

  const [uploadForm, setUploadForm] = useState({
    title: '',
    course: '',
    category: '',
    description: '',
    type: 'PDF' as 'PDF' | 'Image' | 'Document',
    documentUrl: '',
    documentPublicId: ''
  });

  const [materials, setMaterials] = useState<Material[]>([
    {
      id: '1',
      title: 'Data Structures Final Paper 2023',
      course: 'CS-201',
      type: 'PDF',
      description: 'Complete final examination paper with solutions',
      uploadedBy: 'Sarah Ahmed',
      uploadDate: '2 days ago',
      likes: 156,
      views: 892,
      downloads: 234,
      category: 'Past Papers'
    },
    {
      id: '2',
      title: 'OOP Lab Manual Complete',
      course: 'CS-102',
      type: 'PDF',
      description: 'All lab exercises and solutions for Object Oriented Programming',
      uploadedBy: 'Ali Hassan',
      uploadDate: '1 week ago',
      likes: 143,
      views: 756,
      downloads: 198,
      category: 'Lab Materials'
    },
    {
      id: '3',
      title: 'Database ER Diagram Examples',
      course: 'CS-301',
      type: 'Image',
      description: 'Collection of Entity-Relationship diagrams for practice',
      uploadedBy: 'Fatima Khan',
      uploadDate: '3 days ago',
      likes: 128,
      views: 654,
      downloads: 145,
      category: 'Lecture Notes'
    },
    {
      id: '4',
      title: 'Algorithms Midterm Solutions',
      course: 'CS-401',
      type: 'PDF',
      description: 'Detailed solutions for midterm examination',
      uploadedBy: 'Ahmed Raza',
      uploadDate: '5 days ago',
      likes: 112,
      views: 543,
      downloads: 167,
      category: 'Past Papers'
    },
    {
      id: '5',
      title: 'Web Development Project Guide',
      course: 'CS-305',
      type: 'Document',
      description: 'Complete guide for semester project development',
      uploadedBy: 'Ayesha Malik',
      uploadDate: '1 week ago',
      likes: 98,
      views: 421,
      downloads: 123,
      category: 'Projects'
    },
    {
      id: '6',
      title: 'Operating Systems Lecture Slides',
      course: 'CS-302',
      type: 'PDF',
      description: 'Complete lecture slides from Dr. Khan',
      uploadedBy: 'Hassan Ali',
      uploadDate: '4 days ago',
      likes: 87,
      views: 398,
      downloads: 109,
      category: 'Lecture Notes'
    },
  ]);

  const categories = ['all', 'Past Papers', 'Lecture Notes', 'Lab Materials', 'Projects', 'Study Guides'];
  const types = ['all', 'PDF', 'Image', 'Document'];

  const filteredMaterials = materials
    .filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           m.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           m.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const matchesType = selectedType === 'all' || m.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'recent') return 0; // Would use actual dates
      return 0;
    });

  const handleDocumentUploadSuccess = (url: string, publicId: string) => {
    setUploadForm({
      ...uploadForm,
      documentUrl: url,
      documentPublicId: publicId
    });
    toast.success('Document uploaded to Cloudinary!');
  };

  const handleUpload = async () => {
    if (!uploadForm.documentUrl) {
      toast.error('Please upload a document first');
      return;
    }

    if (!uploadForm.title || !uploadForm.course || !uploadForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Get Firebase auth token
      const { auth } = await import('@/lib/firebase');
      if (!auth?.currentUser) {
        toast.error('Please log in to upload documents');
        return;
      }

      const token = await auth.currentUser.getIdToken();

      // Determine file type from URL
      const fileType = uploadForm.documentUrl.includes('.pdf') ? 'PDF' :
                      uploadForm.documentUrl.includes('image') ? 'Image' : 'Document';

      // Create new material object (add to list even if backend fails)
      const newMaterial: Material = {
        id: `doc_${Date.now()}`,
        title: uploadForm.title,
        course: uploadForm.course,
        type: fileType,
        description: uploadForm.description || '',
        uploadedBy: user.name,
        uploadDate: 'Just now',
        likes: 0,
        views: 0,
        downloads: 0,
        category: uploadForm.category,
        documentUrl: uploadForm.documentUrl
      };

      // Try to save to backend (but don't fail if it doesn't work)
      try {
        const response = await fetch('http://localhost:3001/documents', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: uploadForm.title,
            course: uploadForm.course,
            category: uploadForm.category,
            description: uploadForm.description,
            documentUrl: uploadForm.documentUrl,
            documentPublicId: uploadForm.documentPublicId,
            type: fileType
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.document?.id) {
            newMaterial.id = data.document.id;
          }
        } else {
          console.warn('Backend save failed, but file is uploaded to Cloudinary');
        }
      } catch (backendError: any) {
        console.warn('Backend save error (file still uploaded):', backendError);
        // Don't throw - file is already uploaded to Cloudinary
      }
      
      // Add to materials list (at the beginning for "recent" sort)
      setMaterials(prevMaterials => [newMaterial, ...prevMaterials]);
      
      toast.success('Material uploaded successfully!');
      setUploadDialogOpen(false);
      setUploadForm({
        title: '',
        course: '',
        category: '',
        description: '',
        type: 'PDF',
        documentUrl: '',
        documentPublicId: ''
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload material');
    }
  };

  const toggleLike = (materialId: string) => {
    setLikedMaterials(prev => {
      const newSet = new Set(prev);
      if (newSet.has(materialId)) {
        newSet.delete(materialId);
        toast.info('Like removed');
      } else {
        newSet.add(materialId);
        toast.success('Material liked!');
      }
      return newSet;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return FileText;
      case 'Image':
        return ImageIcon;
      default:
        return File;
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <Navigation user={user} currentScreen="materials" onNavigate={onNavigate} onLogout={onLogout} darkMode={darkMode} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 sm:pt-24 sm:pb-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">Study Materials</h1>
            <p className="text-slate-400">Access and share resources with your peers</p>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-glow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5">
                <Upload className="w-4 h-4 mr-2" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900/95 border-slate-800 backdrop-blur-xl text-white sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">Upload Material</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Title</Label>
                  <Input 
                    placeholder="e.g., Data Structures Final Paper 2023" 
                    className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Course Code</Label>
                    <Input 
                      placeholder="e.g., CS-201" 
                      className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      value={uploadForm.course}
                      onChange={(e) => setUploadForm({...uploadForm, course: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Category</Label>
                    <Select 
                      value={uploadForm.category} 
                      onValueChange={(value) => setUploadForm({...uploadForm, category: value})}
                    >
                      <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 rounded-xl">
                        {categories.filter(c => c !== 'all').map(category => (
                          <SelectItem key={category} value={category} className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Description</Label>
                  <Textarea 
                    placeholder="Brief description of the material..." 
                    className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[100px]"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Document File</Label>
                  <DocumentUpload 
                    onUploadSuccess={handleDocumentUploadSuccess}
                    className="w-full"
                  />
                  {uploadForm.documentUrl && (
                    <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
                      <ThumbsUp className="w-3 h-3" />
                      File uploaded successfully
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 mt-4"
                  onClick={handleUpload}
                >
                  Upload Material
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters & Search */}
        <div className="bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm rounded-2xl p-4 mb-8 shadow-lg shadow-indigo-500/5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input 
                placeholder="Search by title, course, or description..." 
                className="pl-11 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 h-11 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px] bg-slate-950/50 border-slate-800 text-white rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 h-11">
                  <Filter className="w-4 h-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 rounded-xl">
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px] bg-slate-950/50 border-slate-800 text-white rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 h-11">
                  <FileText className="w-4 h-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 rounded-xl">
                  {types.map(type => (
                    <SelectItem key={type} value={type} className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                      {type === 'all' ? 'All Types' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-slate-950/50 border-slate-800 text-white rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 h-11">
                  <Clock className="w-4 h-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 rounded-xl">
                  <SelectItem value="likes" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Most Liked</SelectItem>
                  <SelectItem value="views" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Most Viewed</SelectItem>
                  <SelectItem value="recent" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Most Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => {
            const TypeIcon = getTypeIcon(material.type);
            const isLiked = likedMaterials.has(material.id);
            
            return (
              <div 
                key={material.id} 
                className="group bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                      <TypeIcon className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div>
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30 mb-1">
                        {material.course}
                      </Badge>
                      <p className="text-xs text-slate-500 font-medium">{material.category}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-full hover:bg-slate-700/50 ${isLiked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}
                    onClick={() => toggleLike(material.id)}
                  >
                    <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                  {material.title}
                </h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">
                  {material.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-800/50">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {material.uploadedBy}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {material.uploadDate}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded-md">
                      <ThumbsUp className="w-3 h-3" />
                      {material.likes + (isLiked ? 1 : 0)}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded-md">
                      <Eye className="w-3 h-3" />
                      {material.views}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-slate-800 hover:bg-indigo-600 text-white border border-slate-700 hover:border-indigo-500 transition-all shadow-sm hover:shadow-indigo-500/25"
                    onClick={() => {
                      if (material.documentUrl) {
                        window.open(material.documentUrl, '_blank');
                      } else {
                        toast.info('Preview not available');
                      }
                    }}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMaterials.length === 0 && (
          <div className="bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">No materials found</h3>
            <p className="text-sm text-slate-400 mb-6">Try adjusting your search or filters</p>
            <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedType('all'); }} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white h-10 px-6 rounded-xl shadow-lg shadow-indigo-500/25">
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

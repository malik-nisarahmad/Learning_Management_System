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
  toggleTheme: () => void;
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

export function StudyMaterials({ user, onNavigate, onLogout, darkMode, toggleTheme }: StudyMaterialsProps) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation
        user={user}
        currentScreen="materials"
        onNavigate={onNavigate}
        onLogout={onLogout}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-gray-900 dark:text-white mb-2">Study Materials</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Browse, upload, and access study materials
            </p>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">Upload Study Material</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="uploadTitle" className="text-gray-900 dark:text-white">
                    Title
                  </Label>
                  <Input
                    id="uploadTitle"
                    placeholder="Enter material title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="uploadCourse" className="text-gray-900 dark:text-white">
                      Course Code
                    </Label>
                    <Input
                      id="uploadCourse"
                      placeholder="e.g., CS-201"
                      value={uploadForm.course}
                      onChange={(e) => setUploadForm({ ...uploadForm, course: e.target.value })}
                      className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Category</Label>
                    <Select value={uploadForm.category} onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}>
                      <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== 'all').map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uploadDescription" className="text-gray-900 dark:text-white">
                    Description
                  </Label>
                  <Textarea
                    id="uploadDescription"
                    placeholder="Describe the material"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    rows={3}
                    className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-white">File Upload</Label>
                  <DocumentUpload
                    onUploadSuccess={handleDocumentUploadSuccess}
                    onUploadError={(error) => toast.error(error)}
                    maxSizeMB={10}
                    folder="fast-connect/documents"
                  />
                  {uploadForm.documentUrl && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      ✓ Document uploaded successfully
                    </p>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    disabled={!uploadForm.documentUrl || !uploadForm.title || !uploadForm.course || !uploadForm.category}
                  >
                    Upload Material
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="likes">Most Liked</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 mt-4">
            {types.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type === 'all' ? 'All Types' : type}
              </Button>
            ))}
          </div>
        </Card>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map(material => {
            const TypeIcon = getTypeIcon(material.type);
            const isLiked = likedMaterials.has(material.id);
            
            return (
              <Card key={material.id} className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center`}>
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary">{material.type}</Badge>
                </div>
                
                <h4 className="text-gray-900 dark:text-white mb-2">{material.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-3">{material.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">{material.course}</Badge>
                  <Badge variant="outline">{material.category}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{material.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{material.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{material.downloads}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{material.uploadedBy}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{material.uploadDate}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant={isLiked ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleLike(material.id)}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {isLiked ? 'Liked' : 'Like'}
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      if (material.documentUrl) {
                        window.open(material.documentUrl, '_blank');
                        // Update download count
                        setMaterials(prevMaterials =>
                          prevMaterials.map(m =>
                            m.id === material.id
                              ? { ...m, downloads: m.downloads + 1 }
                              : m
                          )
                        );
                      } else {
                        toast.error('Document URL not available');
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredMaterials.length === 0 && (
          <Card className="p-12 text-center bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-gray-900 dark:text-white mb-2">No materials found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedType('all');
            }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}

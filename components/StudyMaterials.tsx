'use client';

import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
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
  Clock,
  MessageSquare,
  Send,
  Trash2,
  MoreVertical,
  X,
  Loader2,
  ExternalLink,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner';
import { DocumentUpload } from './DocumentUpload';
import {
  Material,
  MaterialComment,
  subscribeToMaterials,
  createMaterial,
  deleteMaterial,
  toggleMaterialLike,
  incrementDownloads,
  incrementViews,
  subscribeToMaterialComments,
  createMaterialComment,
  deleteMaterialComment,
  toggleCommentLike,
  formatTimeAgo,
} from '@/lib/studyMaterialsSystem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { Screen, User } from '@/app/page';

interface StudyMaterialsProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
}

export function StudyMaterials({ user, onNavigate, onLogout, darkMode }: StudyMaterialsProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Detail view state
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [comments, setComments] = useState<MaterialComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    course: '',
    category: '',
    description: '',
    documentUrl: '',
    documentPublicId: ''
  });

  const categories = ['all', 'Past Papers', 'Lecture Notes', 'Lab Materials', 'Projects', 'Study Guides', 'Assignments'];
  const types = ['all', 'PDF', 'Image', 'Document'];

  // Subscribe to materials
  useEffect(() => {
    const unsubscribe = subscribeToMaterials((fetchedMaterials) => {
      setMaterials(fetchedMaterials);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to comments when material is selected
  useEffect(() => {
    if (!selectedMaterial) return;

    const unsubscribe = subscribeToMaterialComments(selectedMaterial.id, (fetchedComments) => {
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [selectedMaterial?.id]);

  // Filter and sort materials
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
      if (sortBy === 'downloads') return b.downloads - a.downloads;
      // Recent - sort by createdAt
      const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
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

    setIsUploading(true);
    try {
      // Determine file type from URL
      const fileType: 'PDF' | 'Image' | 'Document' = 
        uploadForm.documentUrl.toLowerCase().includes('.pdf') ? 'PDF' :
        uploadForm.documentUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)/) ? 'Image' : 'Document';

      await createMaterial({
        title: uploadForm.title,
        course: uploadForm.course.toUpperCase(),
        type: fileType,
        description: uploadForm.description || '',
        category: uploadForm.category,
        documentUrl: uploadForm.documentUrl,
        documentPublicId: uploadForm.documentPublicId,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
      });
      
      toast.success('Material uploaded successfully!');
      setUploadDialogOpen(false);
      setUploadForm({
        title: '',
        course: '',
        category: '',
        description: '',
        documentUrl: '',
        documentPublicId: ''
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload material');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLike = async (material: Material, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isLiked = material.likedBy?.includes(user.id);
    try {
      await toggleMaterialLike(material.id, user.id, isLiked);
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to update like');
    }
  };

  const handleDownload = async (material: Material, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      // Extract filename from URL or use title
      const urlParts = material.documentUrl.split('/');
      let filename = urlParts[urlParts.length - 1] || `${material.title}`;
      // Remove any query parameters from filename
      filename = filename.split('?')[0];
      // Decode URL-encoded characters
      filename = decodeURIComponent(filename);
      // Add extension if missing
      if (!filename.includes('.')) {
        const ext = material.type === 'PDF' ? '.pdf' : material.type === 'Image' ? '.png' : '.doc';
        filename = `${filename}${ext}`;
      }
      
      let downloadUrl = material.documentUrl;
      
      // Fix Cloudinary URLs: PDFs uploaded via /image/upload need to be accessed via /raw/upload
      if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/image/upload/')) {
        const isPdf = filename.toLowerCase().endsWith('.pdf') || material.type === 'PDF';
        const isDoc = filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx') || material.type === 'Document';
        
        if (isPdf || isDoc) {
          // Change /image/upload/ to /raw/upload/ for raw files
          downloadUrl = downloadUrl.replace('/image/upload/', '/raw/upload/');
        }
      }
      
      // Increment download count
      await incrementDownloads(material.id);
      
      // Open in new window/tab - browser will handle download based on content-type
      window.open(downloadUrl, '_blank');
      toast.success(`Opening ${filename}`);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to opening original URL
      window.open(material.documentUrl, '_blank');
      toast.info('Opening file in new tab');
    }
  };

  const handleView = async (material: Material) => {
    setSelectedMaterial(material);
    setDetailDialogOpen(true);
    try {
      await incrementViews(material.id);
    } catch (error) {
      console.error('View count error:', error);
    }
  };

  const handleDelete = async (material: Material, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (material.authorId !== user.id) {
      toast.error('You can only delete your own materials');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await deleteMaterial(material.id);
      toast.success('Material deleted');
      if (detailDialogOpen && selectedMaterial?.id === material.id) {
        setDetailDialogOpen(false);
        setSelectedMaterial(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete material');
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedMaterial) return;

    setIsSendingComment(true);
    try {
      await createMaterialComment({
        materialId: selectedMaterial.id,
        content: newComment.trim(),
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
      });
      setNewComment('');
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleDeleteComment = async (comment: MaterialComment) => {
    if (comment.authorId !== user.id) return;
    
    try {
      await deleteMaterialComment(comment.id, comment.materialId);
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Delete comment error:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleLikeComment = async (comment: MaterialComment) => {
    const isLiked = comment.likedBy?.includes(user.id);
    try {
      await toggleCommentLike(comment.id, user.id, isLiked);
    } catch (error) {
      console.error('Like comment error:', error);
    }
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'Image':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      default:
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
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
            <p className="text-slate-400">Upload, share, and download resources with your peers</p>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-glow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5">
                <Upload className="w-4 h-4 mr-2" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900/95 border-slate-800 backdrop-blur-xl text-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">Upload Material</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Title *</Label>
                  <Input 
                    placeholder="e.g., Data Structures Final Paper 2023" 
                    className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Course Code *</Label>
                    <Input 
                      placeholder="e.g., CS-201" 
                      className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      value={uploadForm.course}
                      onChange={(e) => setUploadForm({...uploadForm, course: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Category *</Label>
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
                  <Label className="text-slate-300">Document File *</Label>
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
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Material'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{materials.length}</p>
            <p className="text-xs text-slate-400">Total Materials</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-400">{materials.filter(m => m.authorId === user.id).length}</p>
            <p className="text-xs text-slate-400">Your Uploads</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{materials.reduce((sum, m) => sum + m.downloads, 0)}</p>
            <p className="text-xs text-slate-400">Total Downloads</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-rose-400">{materials.reduce((sum, m) => sum + m.likes, 0)}</p>
            <p className="text-xs text-slate-400">Total Likes</p>
          </div>
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
                  <SelectItem value="recent" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Most Recent</SelectItem>
                  <SelectItem value="likes" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Most Liked</SelectItem>
                  <SelectItem value="views" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Most Viewed</SelectItem>
                  <SelectItem value="downloads" className="text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">Most Downloaded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        )}

        {/* Materials Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => {
              const TypeIcon = getTypeIcon(material.type);
              const isLiked = material.likedBy?.includes(user.id);
              const isOwner = material.authorId === user.id;
              
              return (
                <div 
                  key={material.id} 
                  className="group bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col cursor-pointer"
                  onClick={() => handleView(material)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getTypeColor(material.type)}`}>
                        <TypeIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30 mb-1">
                          {material.course}
                        </Badge>
                        <p className="text-xs text-slate-500 font-medium">{material.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full hover:bg-slate-700/50 ${isLiked ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'}`}
                        onClick={(e) => handleLike(material, e)}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      </Button>
                      {isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-700/50 text-slate-500">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-900 border-slate-800 rounded-xl">
                            <DropdownMenuItem 
                              className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                              onClick={(e) => handleDelete(material, e as any)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                    {material.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">
                    {material.description || 'No description provided'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-800/50">
                    <span className="flex items-center gap-1.5">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={material.authorAvatar} />
                        <AvatarFallback className="bg-slate-700 text-[8px]">
                          {material.authorName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {material.authorName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTimeAgo(material.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-md">
                        <Heart className="w-3 h-3" />
                        {material.likes}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-md">
                        <Eye className="w-3 h-3" />
                        {material.views}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-md">
                        <MessageSquare className="w-3 h-3" />
                        {material.commentCount || 0}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-slate-800 hover:bg-indigo-600 text-white border border-slate-700 hover:border-indigo-500 transition-all shadow-sm hover:shadow-indigo-500/25"
                      onClick={(e) => handleDownload(material, e)}
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      {material.downloads}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredMaterials.length === 0 && (
          <div className="bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">No materials found</h3>
            <p className="text-sm text-slate-400 mb-6">
              {materials.length === 0 
                ? 'Be the first to upload study materials!' 
                : 'Try adjusting your search or filters'}
            </p>
            <div className="flex gap-3 justify-center">
              {materials.length > 0 && (
                <Button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedType('all'); }} 
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Clear Filters
                </Button>
              )}
              <Button 
                onClick={() => setUploadDialogOpen(true)} 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/25"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Material
              </Button>
            </div>
          </div>
        )}

        {/* Detail Dialog with Comments */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="bg-slate-900/95 border-slate-800 backdrop-blur-xl text-white sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
            {selectedMaterial && (
              <>
                <DialogHeader className="pb-4 border-b border-slate-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getTypeColor(selectedMaterial.type)}`}>
                        {(() => {
                          const Icon = getTypeIcon(selectedMaterial.type);
                          return <Icon className="w-6 h-6" />;
                        })()}
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold text-white">
                          {selectedMaterial.title}
                        </DialogTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                            {selectedMaterial.course}
                          </Badge>
                          <Badge variant="outline" className="text-slate-400 border-slate-700">
                            {selectedMaterial.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-6 py-4">
                    {/* Description */}
                    <div>
                      <p className="text-slate-300">{selectedMaterial.description || 'No description provided'}</p>
                    </div>

                    {/* Author & Stats */}
                    <div className="flex items-center justify-between py-4 border-y border-slate-800">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedMaterial.authorAvatar} />
                          <AvatarFallback className="bg-slate-700">
                            {selectedMaterial.authorName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">{selectedMaterial.authorName}</p>
                          <p className="text-xs text-slate-500">{formatTimeAgo(selectedMaterial.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" /> {selectedMaterial.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" /> {selectedMaterial.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" /> {selectedMaterial.downloads}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        className={`flex-1 ${selectedMaterial.likedBy?.includes(user.id) ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-800 hover:bg-slate-700'}`}
                        onClick={() => handleLike(selectedMaterial)}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${selectedMaterial.likedBy?.includes(user.id) ? 'fill-current' : ''}`} />
                        {selectedMaterial.likedBy?.includes(user.id) ? 'Liked' : 'Like'}
                      </Button>
                      <Button
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => handleDownload(selectedMaterial)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                        onClick={() => window.open(selectedMaterial.documentUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Comments Section */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Comments ({comments.length})
                      </h4>

                      {/* Comment Input */}
                      <div className="flex gap-3 mb-6">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-slate-700 text-xs">
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                          <Input
                            placeholder="Write a comment..."
                            className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 rounded-xl"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                          />
                          <Button
                            size="icon"
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                            onClick={handleSendComment}
                            disabled={!newComment.trim() || isSendingComment}
                          >
                            {isSendingComment ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-4">
                        {comments.length === 0 ? (
                          <p className="text-center text-slate-500 py-8">No comments yet. Be the first to comment!</p>
                        ) : (
                          comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 p-3 bg-slate-800/30 rounded-xl">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={comment.authorAvatar} />
                                <AvatarFallback className="bg-slate-700 text-xs">
                                  {comment.authorName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">{comment.authorName}</span>
                                    <span className="text-xs text-slate-500">{formatTimeAgo(comment.createdAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`h-7 px-2 ${comment.likedBy?.includes(user.id) ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'}`}
                                      onClick={() => handleLikeComment(comment)}
                                    >
                                      <Heart className={`w-3 h-3 mr-1 ${comment.likedBy?.includes(user.id) ? 'fill-current' : ''}`} />
                                      {comment.likes || 0}
                                    </Button>
                                    {comment.authorId === user.id && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-slate-500 hover:text-red-400"
                                        onClick={() => handleDeleteComment(comment)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-slate-300 mt-1">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Search,
  Plus,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  MoreVertical,
  Loader2,
  Trash2,
  X,
  Newspaper,
  Tag,
  HelpCircle,
  Megaphone,
  BookOpen,
  MessageCircle,
} from 'lucide-react';
import {
  Post,
  Comment,
  subscribeToPosts,
  createPost,
  createComment,
  votePost,
  deletePost,
  deleteComment,
  subscribeToComments,
} from '@/lib/discussionSystem';
import { toast } from 'sonner';

// Type for comment with nested replies (recursive)
interface CommentNode extends Comment {
  replies: CommentNode[];
}

interface DiscussionFeedProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    department?: string;
  };
  darkMode: boolean;
}

type PostCategory = 'general' | 'question' | 'discussion' | 'announcement' | 'help' | 'resource';

const POST_CATEGORIES: { value: PostCategory; label: string; icon: any; color: string }[] = [
  { value: 'discussion', label: 'Discussion', icon: MessageCircle, color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30' },
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  { value: 'announcement', label: 'Announcement', icon: Megaphone, color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' },
  { value: 'resource', label: 'Resource', icon: BookOpen, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  { value: 'help', label: 'Help Needed', icon: HelpCircle, color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' },
  { value: 'general', label: 'General', icon: Newspaper, color: 'text-slate-400 bg-slate-400/10 border-slate-400/30' },
];

const POPULAR_TAGS = [
  'programming', 'web-dev', 'ai-ml', 'database', 'networking',
  'oop', 'algorithms', 'data-structures', 'os', 'security',
  'exam-prep', 'project', 'career', 'internship', 'study-tips'
];

export function DiscussionFeed({ currentUser, darkMode }: DiscussionFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<PostCategory>('discussion');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; authorName: string } | null>(null);

  useEffect(() => {
    const unsub = subscribeToPosts((data) => {
      setPosts(data);
    });
    return () => unsub();
  }, []);

  // Subscribe to comments for expanded post
  useEffect(() => {
    if (!expandedPost) return;
    
    const unsub = subscribeToComments(expandedPost, (data) => {
      setComments(prev => ({ ...prev, [expandedPost]: data }));
    });
    return () => unsub();
  }, [expandedPost]);

  const filteredPosts = posts
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        p.authorName.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'new':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'top':
          return ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0));
        case 'hot':
        default:
          // Hot = combination of votes and recency
          const aScore = ((a.upvotes || 0) - (a.downvotes || 0)) + (a.commentCount || 0);
          const bScore = ((b.upvotes || 0) - (b.downvotes || 0)) + (b.commentCount || 0);
          const aAge = (Date.now() - new Date(a.createdAt).getTime()) / 3600000; // hours
          const bAge = (Date.now() - new Date(b.createdAt).getTime()) / 3600000;
          return (bScore / Math.pow(bAge + 2, 1.5)) - (aScore / Math.pow(aAge + 2, 1.5));
      }
    });

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    const postId = await createPost({
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorDepartment: currentUser.department,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      tags: newTags,
    });
    setIsCreating(false);

    if (postId) {
      toast.success('Post created');
      setShowCreateDialog(false);
      setNewCategory('discussion');
      setNewTags([]);
      setTagInput('');
      setNewTitle('');
      setNewContent('');
    } else {
      toast.error('Failed to create post');
    }
  };

  const handleVote = async (post: Post, voteType: 'up' | 'down') => {
    setLoading(`vote-${post.id}`, true);
    const success = await votePost(post.id, currentUser.id, voteType);
    setLoading(`vote-${post.id}`, false);

    if (!success) {
      toast.error('Failed to update vote');
    }
  };

  const handleAddComment = async (postId: string, parentId?: string) => {
    if (!newComment.trim()) return;

    setIsSendingComment(true);
    const commentId = await createComment({
      postId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      ...(currentUser.avatar && { authorAvatar: currentUser.avatar }),
      content: newComment.trim(),
      ...(parentId && { parentId }),
    });
    setIsSendingComment(false);

    if (commentId) {
      setNewComment('');
      setReplyingTo(null);
    } else {
      toast.error('Failed to add comment');
    }
  };

  const handleDeletePost = async (post: Post) => {
    if (post.authorId !== currentUser.id) return;

    setLoading(`delete-${post.id}`, true);
    const success = await deletePost(post.id);
    setLoading(`delete-${post.id}`, false);

    if (success) {
      toast.success('Post deleted');
      setExpandedPost(null);
    } else {
      toast.error('Failed to delete post');
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    setLoading(`delete-comment-${commentId}`, true);
    const success = await deleteComment(commentId, postId);
    setLoading(`delete-comment-${commentId}`, false);

    if (!success) {
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getCategoryInfo = (category: string) => {
    return POST_CATEGORIES.find(c => c.value === category) || POST_CATEGORIES[5]; // default to general
  };

  // Build nested comment tree from flat comments
  const buildCommentTree = (flatComments: Comment[]): CommentNode[] => {
    const commentMap = new Map<string, CommentNode>();
    const rootComments: CommentNode[] = [];

    // First pass: create map with empty replies array
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree structure
    flatComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies.push(commentWithReplies);
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    // Sort replies by date (oldest first)
    const sortReplies = (comments: CommentNode[]) => {
      comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      comments.forEach(c => sortReplies(c.replies));
    };
    sortReplies(rootComments);

    return rootComments;
  };

  // Recursive comment component for Reddit-style threading
  const CommentThread = ({ 
    comment, 
    depth = 0, 
    postId 
  }: { 
    comment: CommentNode; 
    depth?: number; 
    postId: string;
  }) => {
    const maxDepth = 4; // Max nesting level
    const isCollapsed = depth > maxDepth;
    const depthColors = [
      'border-indigo-500/40',
      'border-purple-500/40', 
      'border-pink-500/40',
      'border-amber-500/40',
      'border-emerald-500/40',
    ];
    const borderColor = depthColors[depth % depthColors.length];

    return (
      <div className={`${depth > 0 ? 'ml-4 mt-2' : ''}`}>
        <div className={`${depth > 0 ? `pl-3 border-l-2 ${borderColor}` : ''}`}>
          {/* Comment Content */}
          <div className="group hover:bg-slate-900/40 rounded-lg transition-colors">
            <div className="flex py-2">
              {/* Vote Column */}
              <div className="flex flex-col items-center px-2 gap-0.5">
                <button className="p-1 rounded hover:bg-slate-800/50 text-slate-500 hover:text-indigo-400 transition-colors">
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-medium text-slate-400">
                  {(comment.upvotes || 0) - (comment.downvotes || 0)}
                </span>
                <button className="p-1 rounded hover:bg-slate-800/50 text-slate-500 hover:text-red-400 transition-colors">
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Comment Body */}
              <div className="flex-1 pr-2">
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-5 w-5 border border-slate-800">
                    <AvatarImage src={comment.authorAvatar} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 text-indigo-400 text-[9px] font-semibold">
                      {comment.authorName?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-xs text-indigo-400 hover:underline cursor-pointer">
                    {comment.authorName}
                  </span>
                  <span className="text-slate-600 text-xs">•</span>
                  <span className="text-[10px] text-slate-500">
                    {formatDate(comment.createdAt)}
                  </span>
                  {comment.isEdited && (
                    <span className="text-[10px] text-slate-500 italic">(edited)</span>
                  )}
                </div>

                {/* Content */}
                <p className="text-sm text-slate-200 leading-relaxed mb-1.5">
                  {comment.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-0.5">
                  <button 
                    onClick={() => setReplyingTo({ commentId: comment.id, authorName: comment.authorName })}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-colors"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Reply
                  </button>
                  {comment.replies.length > 0 && (
                    <span className="text-[10px] text-slate-500 ml-1">
                      {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </span>
                  )}
                  {comment.authorId === currentUser.id && (
                    <button
                      onClick={() => handleDeleteComment(postId, comment.id)}
                      disabled={loadingStates[`delete-comment-${comment.id}`]}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors ml-1"
                    >
                      {loadingStates[`delete-comment-${comment.id}`] ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nested Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-1">
              {comment.replies.map((reply) => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  postId={postId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPostCard = (post: Post) => {
    const isExpanded = expandedPost === post.id;
    const hasUpvoted = post.upvotedBy?.includes(currentUser.id);
    const hasDownvoted = post.downvotedBy?.includes(currentUser.id);
    const isOwner = post.authorId === currentUser.id;
    const postComments = comments[post.id] || [];
    const categoryInfo = getCategoryInfo(post.category);
    const CategoryIcon = categoryInfo.icon;

    return (
      <div
        key={post.id}
        className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-md rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all duration-200"
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-slate-800">
                <AvatarImage src={post.authorAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 text-indigo-400 font-semibold">
                  {post.authorName?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-white">{post.authorName}</p>
                  <Badge className={`${categoryInfo.color} border text-xs px-2 py-0.5 rounded-md`}>
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    {categoryInfo.label}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{formatDate(post.createdAt)}</p>
              </div>
            </div>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800/50"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 rounded-xl">
                  <DropdownMenuItem
                    onClick={() => handleDeletePost(post)}
                    className="text-red-400 hover:bg-slate-800 focus:bg-slate-800 rounded-lg"
                    disabled={loadingStates[`delete-${post.id}`]}
                  >
                    {loadingStates[`delete-${post.id}`] ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Content */}
          <h3 className="font-semibold text-white mb-2">{post.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">{post.content}</p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-md bg-slate-800/50 text-slate-400 border border-slate-700/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(post, 'up')}
                disabled={loadingStates[`vote-${post.id}`]}
                className={`h-8 px-2 ${
                  hasUpvoted
                    ? 'text-emerald-400 hover:text-emerald-400 hover:bg-emerald-400/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <ThumbsUp className={`h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />
              </Button>
              <span className="text-sm font-medium text-slate-300 min-w-[24px] text-center">
                {(post.upvotes || 0) - (post.downvotes || 0)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(post, 'down')}
                disabled={loadingStates[`vote-${post.id}`]}
                className={`h-8 px-2 ${
                  hasDownvoted
                    ? 'text-red-400 hover:text-red-400 hover:bg-red-400/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <ThumbsDown className={`h-4 w-4 ${hasDownvoted ? 'fill-current' : ''}`} />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedPost(isExpanded ? null : post.id)}
              className="h-8 px-3 text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <MessageSquare className="h-4 w-4 mr-1.5" />
              {post.commentCount || 0}
            </Button>
          </div>
        </div>

        {/* Comments Section - Reddit Style */}
        {isExpanded && (
          <div className="border-t border-slate-800/60 bg-slate-950/30">
            {/* Comments Header */}
            <div className="px-4 py-3 border-b border-slate-800/40 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">
                {postComments.length} {postComments.length === 1 ? 'Comment' : 'Comments'}
              </span>
            </div>

            {/* Add Comment Input - Reddit style at top */}
            <div className="p-4 border-b border-slate-800/40">
              {replyingTo && (
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <span className="text-slate-400">Replying to</span>
                  <span className="text-indigo-400 font-medium">{replyingTo.authorName}</span>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <Avatar className="h-8 w-8 border border-slate-800">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 text-indigo-400 text-xs font-semibold">
                      {currentUser.name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder={replyingTo ? `Reply to ${replyingTo.authorName}...` : "What are your thoughts?"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="bg-slate-900/60 border-slate-800 text-white text-sm placeholder:text-slate-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    {replyingTo && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReplyingTo(null);
                          setNewComment('');
                        }}
                        className="h-8 px-4 text-slate-400 hover:text-white hover:bg-slate-800/50"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(post.id, replyingTo?.commentId)}
                      disabled={!newComment.trim() || isSendingComment}
                      className="h-8 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium border-0 rounded-full"
                    >
                      {isSendingComment ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        replyingTo ? 'Reply' : 'Comment'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List - Reddit Thread Style */}
            <div className="max-h-[400px] overflow-y-auto px-3 py-2">
              {postComments.length > 0 ? (
                <div className="space-y-1">
                  {buildCommentTree(postComments).map((comment) => (
                    <CommentThread
                      key={comment.id}
                      comment={comment}
                      depth={0}
                      postId={post.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 text-slate-700" />
                  <p className="text-sm text-slate-400 font-medium">No comments yet</p>
                  <p className="text-xs text-slate-500 mt-1">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#030712]">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/60 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30">
              <Newspaper className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Discussions</h2>
              <p className="text-xs text-slate-400">{posts.length} posts</p>
            </div>
          </div>

          <Button
            onClick={() => setShowCreateDialog(true)}
            className="h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg shadow-indigo-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          
          {/* Sort Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/60 border border-slate-800/60 rounded-xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortBy('hot')}
              className={`h-8 px-4 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'hot'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              🔥 Hot
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortBy('new')}
              className={`h-8 px-4 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'new'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              ✨ New
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortBy('top')}
              className={`h-8 px-4 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'top'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              🏆 Top
            </Button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Newspaper className="h-8 w-8 text-indigo-400" />
              </div>
              <p className="font-semibold text-white">
                {searchQuery ? 'No discussions found' : 'No discussions yet'}
              </p>
              <p className="text-sm mt-1 text-slate-400">
                {searchQuery ? 'Try a different search term' : 'Be the first to start a discussion!'}
              </p>
              {!searchQuery && (
                <Button
                  className="mt-4 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg shadow-indigo-500/25"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Discussion
                </Button>
              )}
            </div>
          ) : (
            filteredPosts.map(renderPostCard)
          )}
        </div>
      </ScrollArea>

      {/* Create Discussion Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] bg-slate-900 border-slate-800 rounded-2xl flex flex-col p-0 overflow-hidden [&>button]:hidden">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 shrink-0">
            <DialogHeader className="p-0 space-y-0">
              <DialogTitle className="flex items-center gap-2 text-white">
                <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30">
                  <Plus className="h-4 w-4 text-indigo-400" />
                </div>
                New Discussion
              </DialogTitle>
            </DialogHeader>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCreateDialog(false)}
              className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Post Type Selection */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Post Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {POST_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = newCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setNewCategory(cat.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                        isSelected
                          ? `${cat.color} border-current`
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                Title
              </label>
              <Input
                placeholder="What's on your mind?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-10 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                Content
              </label>
              <Textarea
                placeholder="Share your thoughts, questions, or ideas..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-y min-h-[100px]"
              />
            </div>

            {/* Tags Section */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              
              {/* Selected Tags */}
              {newTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {newTags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-2.5 py-1 text-xs rounded-lg cursor-pointer hover:bg-indigo-500/30"
                      onClick={() => setNewTags(newTags.filter(t => t !== tag))}
                    >
                      #{tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Tag Input */}
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && tagInput.trim() && !newTags.includes(tagInput.trim())) {
                      e.preventDefault();
                      setNewTags([...newTags, tagInput.trim()]);
                      setTagInput('');
                    }
                  }}
                  className="h-9 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (tagInput.trim() && !newTags.includes(tagInput.trim())) {
                      setNewTags([...newTags, tagInput.trim()]);
                      setTagInput('');
                    }
                  }}
                  disabled={!tagInput.trim() || newTags.includes(tagInput.trim())}
                  className="h-9 px-3 bg-slate-800 hover:bg-slate-700 text-white border-0 rounded-lg"
                >
                  Add
                </Button>
              </div>

              {/* Popular Tags */}
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TAGS.filter(tag => !newTags.includes(tag)).slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setNewTags([...newTags, tag])}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300 border border-slate-700/50 transition-all"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t border-slate-800 p-4 sm:p-6 shrink-0 bg-slate-900">
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowCreateDialog(false)}
                className="h-10 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={!newTitle.trim() || !newContent.trim() || isCreating}
                className="h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg shadow-indigo-500/25"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

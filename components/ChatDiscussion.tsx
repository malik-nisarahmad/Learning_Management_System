import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  MessageSquare,
  Send,
  Users,
  Hash,
  Plus,
  Sparkles,
  Search,
  MoreVertical,
  Pin,
  ThumbsUp,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Reply,
  Clock,
  Bookmark,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Screen, User } from '@/app/page';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
  doc,
  increment,
  setDoc,
  getDocs,
  where,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/* ---------- TYPES ---------- */
interface Message {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  timestamp: Timestamp;
  isCurrentUser?: boolean;
}

interface Thread {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  replies: number;
  likes: number;
  timestamp: string;
  category: string;
  isPinned?: boolean;
  lastReply: string;
  createdAt: Timestamp;
}

interface RedditPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  subreddit: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timestamp: string;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
  isSaved?: boolean;
  createdAt: Timestamp;
}

interface RedditComment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  upvotes: number;
  downvotes: number;
  timestamp: Timestamp;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
  parentId?: string;
  postId: string;
}

interface ChatDiscussionProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
}

/* ---------- COMPONENT ---------- */
export function ChatDiscussion({ user, onNavigate, onLogout, darkMode }: ChatDiscussionProps) {
  const [selectedChat, setSelectedChat] = useState<string>('general');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIAssist, setShowAIAssist] = useState(false);

  /* ---------- GROUP CHATS (STATIC) ---------- */
  const groupChats = [
    { id: 'general', name: 'General Discussion', members: 234, unread: 5 },
    { id: 'cs201', name: 'Data Structures - CS201', members: 89, unread: 12 },
    { id: 'cs102', name: 'OOP Lab - CS102', members: 67, unread: 0 },
    { id: 'projects', name: 'Project Collaboration', members: 45, unread: 3 },
    { id: 'studygroup', name: 'Study Group', members: 23, unread: 8 }
  ];

  /* ---------- REAL-TIME CHAT ---------- */
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!selectedChat || !db) return;
    const q = query(
      collection(db, 'chats', selectedChat, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs: Message[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as Message[];
      setMessages(msgs);
    });
    return () => unsub();
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !db) return;
    await addDoc(collection(db, 'chats', selectedChat, 'messages'), {
      sender: user.name,
      avatar: user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      content: message.trim(),
      timestamp: serverTimestamp(),
      isCurrentUser: true
    });
    setMessage('');
  };

  /* ---------- REAL-TIME THREADS ---------- */
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: Thread[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as Thread[];
      setThreads(list);
    });
    return () => unsub();
  }, []);

  const handleCreateThread = async () => {
    const title = prompt('Thread title:');
    if (!title || !title.trim()) return;
    const category = prompt('Category (General, Data Structures, etc.):') || 'General';
    await addDoc(collection(db, 'threads'), {
      title: title.trim(),
      author: user.name,
      authorAvatar: getInitials(user.name),
      replies: 0,
      likes: 0,
      category,
      isPinned: false,
      lastReply: 'just now',
      createdAt: serverTimestamp()
    });
    toast.success('Thread created!');
  };

  /* ---------- REAL-TIME POSTS (REDDIT STYLE) ---------- */
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<RedditComment[]>([]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: RedditPost[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as RedditPost[];
      setPosts(list);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedPost || !db) return;
    const q = query(
      collection(db, 'posts', selectedPost, 'comments'),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: RedditComment[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as RedditComment[];
      setComments(list);
    });
    return () => unsub();
  }, [selectedPost]);

  const handleCreatePost = async () => {
    const title = prompt('Post title:');
    if (!title || !title.trim()) return;
    const content = prompt('Post content (optional):') || '';
    const subreddit = prompt('Sub-reddit (general, cs201, etc.):') || 'general';
    await addDoc(collection(db, 'posts'), {
      title: title.trim(),
      content: content.trim(),
      author: user.name,
      authorAvatar: getInitials(user.name),
      subreddit,
      upvotes: 0,
      downvotes: 0,
      comments: 0,
      timestamp: 'just now',
      isUpvoted: false,
      isDownvoted: false,
      isSaved: false,
      createdAt: serverTimestamp()
    });
    toast.success('Post created!');
  };

  const handleSendComment = async (content: string, parentId?: string) => {
    if (!content.trim() || !selectedPost || !db) return;
    await addDoc(collection(db, 'posts', selectedPost, 'comments'), {
      author: user.name,
      authorAvatar: getInitials(user.name),
      content: content.trim(),
      upvotes: 0,
      downvotes: 0,
      timestamp: serverTimestamp(),
      parentId: parentId || null,
      isUpvoted: false,
      isDownvoted: false
    });
    await updateDoc(doc(db, 'posts', selectedPost), { comments: increment(1) });
    setNewComment('');
  };

  const handleVotePost = async (postId: string, dir: 1 | -1) => {
    if (!db) return;
    const ref = doc(db, 'posts', postId);
    await updateDoc(ref, {
      upvotes: increment(dir === 1 ? 1 : 0),
      downvotes: increment(dir === -1 ? 1 : 0)
    });
  };

  const handleVoteComment = async (commentId: string, dir: 1 | -1) => {
    if (!db || !selectedPost) return;
    const ref = doc(db, 'posts', selectedPost, 'comments', commentId);
    await updateDoc(ref, {
      upvotes: increment(dir === 1 ? 1 : 0),
      downvotes: increment(dir === -1 ? 1 : 0)
    });
  };

  /* ---------- UTILS ---------- */
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const formatTime = (t?: Timestamp) => (t ? t.toDate().toLocaleString() : '');

  /* ---------- SEARCH ---------- */
  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ---------- RENDER ---------- */
  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navigation
          user={user}
          currentScreen="chat"
          onNavigate={onNavigate}
          onLogout={onLogout}
          darkMode={true}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 sm:pt-24">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Chat & Discussions</h2>
            <p className="text-slate-400">Connect with peers and participate in discussions</p>
          </div>

          <Tabs defaultValue="chat" className="space-y-6">
            <TabsList className="bg-slate-900/60 border border-slate-800/60 p-1 backdrop-blur-md">
              <TabsTrigger 
                value="chat"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200 transition-all"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Real-time Chat
              </TabsTrigger>
              <TabsTrigger 
                value="threads"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200 transition-all"
              >
                <Hash className="w-4 h-4 mr-2" />
                Discussion Threads
              </TabsTrigger>
              <TabsTrigger 
                value="posts"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200 transition-all"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Reddit Posts
              </TabsTrigger>
            </TabsList>

            {/* ---------- REAL-TIME CHAT ---------- */}
            <TabsContent value="chat">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 p-4 bg-slate-900/60 border-slate-800/60 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Channels</h3>
                    <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {groupChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all border ${
                          selectedChat === chat.id 
                            ? 'bg-indigo-600/20 border-indigo-500/50 text-white' 
                            : 'border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Hash className={`w-4 h-4 ${selectedChat === chat.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                            <span className="font-medium">{chat.name}</span>
                          </div>
                          {chat.unread > 0 && (
                            <Badge className="bg-indigo-500 text-white border-none text-xs">
                              {chat.unread}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs opacity-70 ml-6">
                          <Users className="w-3 h-3" />
                          <span>{chat.members}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="lg:col-span-3 flex flex-col h-[600px] bg-slate-900/60 border-slate-800/60 backdrop-blur-md overflow-hidden">
                  <div className="p-4 border-b border-slate-800/60 bg-slate-900/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          <Hash className="w-4 h-4 text-indigo-400" />
                          {groupChats.find((c) => c.id === selectedChat)?.name}
                        </h3>
                        <p className="text-slate-400 text-sm">{groupChats.find((c) => c.id === selectedChat)?.members} members</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.isCurrentUser ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="w-10 h-10 border-2 border-slate-800">
                            <AvatarFallback
                              className={`${
                                msg.isCurrentUser 
                                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600' 
                                  : 'bg-gradient-to-br from-slate-700 to-slate-600'
                              } text-white`}
                            >
                              {msg.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex-1 max-w-[75%] ${msg.isCurrentUser ? 'text-right' : ''}`}>
                            <div className="flex items-center gap-2 mb-1 justify-end">
                              {!msg.isCurrentUser && <span className="text-slate-300 text-sm font-medium">{msg.sender}</span>}
                              <span className="text-slate-500 text-xs">{formatTime(msg.timestamp)}</span>
                            </div>
                            <div
                              className={`inline-block p-3 rounded-2xl text-sm ${
                                msg.isCurrentUser 
                                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                                  : 'bg-slate-800 text-slate-200 rounded-tl-none'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t border-slate-800/60 bg-slate-900/40">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                      <Button onClick={handleSendMessage} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* ---------- REAL-TIME THREADS ---------- */}
            <TabsContent value="threads">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <Card className="p-4 bg-slate-900/60 border-slate-800/60 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative flex-1 mr-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <Input
                          placeholder="Search threads..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
                        />
                      </div>
                      <Button onClick={handleCreateThread} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        New Thread
                      </Button>
                    </div>
                  </Card>

                  {filteredThreads.map((thread) => (
                    <Card
                      key={thread.id}
                      className="p-6 bg-slate-900/60 border-slate-800/60 backdrop-blur-md hover:border-indigo-500/30 transition-all cursor-pointer group"
                      onClick={() => setSelectedThread(thread)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {thread.isPinned && <Pin className="w-4 h-4 text-indigo-400" />}
                            <h4 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">{thread.title}</h4>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <span className="text-indigo-400">{thread.author}</span>
                            <span>•</span>
                            <span>{thread.timestamp}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">{thread.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-slate-500 text-sm">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{thread.replies} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{thread.likes} likes</span>
                        </div>
                        <div className="ml-auto text-xs">Last reply {thread.lastReply}</div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <Card className="p-6 bg-slate-900/60 border-slate-800/60 backdrop-blur-md">
                    <h3 className="text-white font-semibold mb-4">Categories</h3>
                    <div className="space-y-2">
                      {['General', 'Data Structures', 'Algorithms', 'Databases', 'Web Development', 'Help Needed'].map((category) => (
                        <button
                          key={category}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-sm"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 bg-slate-900/60 border-slate-800/60 backdrop-blur-md">
                    <h3 className="text-white font-semibold mb-4">Active Users</h3>
                    <div className="space-y-3">
                      {['Sarah Ahmed', 'Ali Hassan', 'Fatima Khan', 'Ahmed Raza'].map((name) => (
                        <div key={name} className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-8 h-8 border border-slate-700">
                              <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">
                                {getInitials(name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                          </div>
                          <span className="text-slate-300 text-sm">{name}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* ---------- REDDIT-STYLE POSTS ---------- */}
            <TabsContent value="posts">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Search + Create */}
                  <Card className="p-4 bg-slate-900/60 border-slate-800/60 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative flex-1 mr-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <Input
                          placeholder="Search posts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
                        />
                      </div>
                      <Button onClick={handleCreatePost} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        New Post
                      </Button>
                    </div>
                  </Card>

                  {/* Posts List or Selected Post */}
                  {!selectedPost ? (
                    <div className="space-y-4">
                      {filteredPosts.map((post) => (
                        <Card
                          key={post.id}
                          className="bg-slate-900/60 border-slate-800/60 backdrop-blur-md hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden"
                          onClick={() => setSelectedPost(post.id)}
                        >
                          <div className="flex">
                            {/* Vote Column */}
                            <div className="flex flex-col items-center p-3 bg-slate-950/30 border-r border-slate-800/60">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 hover:bg-slate-800 ${post.isUpvoted ? 'text-orange-500' : 'text-slate-500'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVotePost(post.id, 1);
                                }}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <span
                                className={`text-sm font-bold py-1 ${
                                  post.upvotes - post.downvotes > 0 ? 'text-orange-500' : post.upvotes - post.downvotes < 0 ? 'text-indigo-500' : 'text-slate-500'
                                }`}
                              >
                                {post.upvotes - post.downvotes}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 hover:bg-slate-800 ${post.isDownvoted ? 'text-indigo-500' : 'text-slate-500'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVotePost(post.id, -1);
                                }}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Post Content */}
                            <div className="flex-1 p-4">
                              <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                                <span className="font-bold text-slate-300">r/{post.subreddit}</span>
                                <span>•</span>
                                <span>Posted by u/{post.author}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{post.timestamp}</span>
                                </div>
                              </div>
                              <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
                              {post.content && <p className="text-slate-400 mb-3 whitespace-pre-wrap line-clamp-3">{post.content}</p>}
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <Button variant="ghost" size="sm" className="gap-2 hover:bg-slate-800 hover:text-slate-300">
                                  <MessageCircle className="h-4 w-4" />
                                  <span>{post.comments} Comments</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="gap-2 hover:bg-slate-800 hover:text-slate-300">
                                  <Share2 className="h-4 w-4" />
                                  <span>Share</span>
                                </Button>
                                <Button variant="ghost" size="sm" className={`gap-2 hover:bg-slate-800 hover:text-slate-300 ${post.isSaved ? 'text-indigo-400' : ''}`}>
                                  <Bookmark className="h-4 w-4" />
                                  <span>Save</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Back Button */}
                      <Button variant="ghost" onClick={() => setSelectedPost(null)} className="mb-2 text-slate-400 hover:text-white hover:bg-slate-800">
                        ← Back to Posts
                      </Button>

                      {/* Selected Post */}
                      {(() => {
                        const post = posts.find((p) => p.id === selectedPost);
                        if (!post) return null;
                        return (
                          <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-md overflow-hidden">
                            <div className="flex">
                              {/* Vote Column */}
                              <div className="flex flex-col items-center p-3 bg-slate-950/30 border-r border-slate-800/60">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 hover:bg-slate-800 ${post.isUpvoted ? 'text-orange-500' : 'text-slate-500'}`}
                                  onClick={() => handleVotePost(post.id, 1)}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <span
                                  className={`text-sm font-bold py-1 ${
                                    post.upvotes - post.downvotes > 0 ? 'text-orange-500' : post.upvotes - post.downvotes < 0 ? 'text-indigo-500' : 'text-slate-500'
                                  }`}
                                >
                                  {post.upvotes - post.downvotes}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 hover:bg-slate-800 ${post.isDownvoted ? 'text-indigo-500' : 'text-slate-500'}`}
                                  onClick={() => handleVotePost(post.id, -1)}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Post Content */}
                              <div className="flex-1 p-4">
                                <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                                  <span className="font-bold text-slate-300">r/{post.subreddit}</span>
                                  <span>•</span>
                                  <span>Posted by u/{post.author}</span>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{post.timestamp}</span>
                                  </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{post.title}</h3>
                                {post.content && <p className="text-slate-300 mb-6 whitespace-pre-wrap leading-relaxed">{post.content}</p>}
                              </div>
                            </div>
                          </Card>
                        );
                      })()}

                      {/* Comments Section */}
                      <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-md p-4">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-white mb-4">Comments ({comments.length})</h3>
                          <div className="flex items-center gap-2 mb-6">
                            <Input
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="flex-1 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
                            />
                            <Button onClick={() => handleSendComment(newComment)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Comment</Button>
                          </div>
                        </div>

                        <ScrollArea className="h-[600px]">
                          <div className="space-y-6">
                            {comments.map((comment) => (
                              <div key={comment.id} className="border-l-2 border-slate-800 pl-4">
                                <div className="flex gap-3">
                                  {/* Vote Column */}
                                  <div className="flex flex-col items-center">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-6 w-6 hover:bg-slate-800 ${comment.isUpvoted ? 'text-orange-500' : 'text-slate-500'}`}
                                      onClick={() => handleVoteComment(comment.id, 1)}
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <span
                                      className={`text-xs font-medium py-0.5 ${
                                        comment.upvotes - comment.downvotes > 0 ? 'text-orange-500' : comment.upvotes - comment.downvotes < 0 ? 'text-indigo-500' : 'text-slate-500'
                                      }`}
                                    >
                                      {comment.upvotes - comment.downvotes}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-6 w-6 hover:bg-slate-800 ${comment.isDownvoted ? 'text-indigo-500' : 'text-slate-500'}`}
                                      onClick={() => handleVoteComment(comment.id, -1)}
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  {/* Comment Content */}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
                                      <Avatar className="h-5 w-5 border border-slate-700">
                                        <AvatarFallback className="text-[10px] bg-slate-800 text-slate-300">{comment.authorAvatar}</AvatarFallback>
                                      </Avatar>
                                      <span className="font-semibold text-slate-300">u/{comment.author}</span>
                                      <span>•</span>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatTime(comment.timestamp)}</span>
                                      </div>
                                    </div>
                                    <p className="text-slate-300 mb-2 whitespace-pre-wrap text-sm leading-relaxed">{comment.content}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                      <Button variant="ghost" size="sm" className="h-6 px-2 gap-1 hover:bg-slate-800 hover:text-slate-300">
                                        <Reply className="h-3 w-3" />
                                        <span>Reply</span>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  <Card className="p-4 bg-slate-900/60 border-slate-800/60 backdrop-blur-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
                      />
                    </div>
                  </Card>

                  <Card className="p-4 bg-slate-900/60 border-slate-800/60 backdrop-blur-md">
                    <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleCreatePost}>
                      <Plus className="h-4 w-4" />
                      Create Post
                    </Button>
                  </Card>

                  <Card className="p-4 bg-slate-900/60 border-slate-800/60 backdrop-blur-md">
                    <h3 className="font-semibold text-white mb-3">Community Rules</h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-center gap-2"><span className="w-1 h-1 bg-indigo-500 rounded-full"></span> Be respectful and kind</li>
                      <li className="flex items-center gap-2"><span className="w-1 h-1 bg-indigo-500 rounded-full"></span> Stay on topic</li>
                      <li className="flex items-center gap-2"><span className="w-1 h-1 bg-indigo-500 rounded-full"></span> No spam or self-promotion</li>
                      <li className="flex items-center gap-2"><span className="w-1 h-1 bg-indigo-500 rounded-full"></span> Follow academic integrity</li>
                      <li className="flex items-center gap-2"><span className="w-1 h-1 bg-indigo-500 rounded-full"></span> Help others learn</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
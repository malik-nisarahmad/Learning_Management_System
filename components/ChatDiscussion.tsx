import { useState } from 'react';
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
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import type { Screen, User } from '@/app/page';

interface ChatDiscussionProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

interface Message {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  isCurrentUser?: boolean;
}

interface Thread {
  id: string;
  title: string;
  author: string;
  replies: number;
  likes: number;
  timestamp: string;
  category: string;
  isPinned?: boolean;
  lastReply: string;
}

export function ChatDiscussion({ user, onNavigate, onLogout, darkMode, toggleTheme }: ChatDiscussionProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>('general');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIAssist, setShowAIAssist] = useState(false);

  const groupChats = [
    { id: 'general', name: 'General Discussion', members: 234, unread: 5 },
    { id: 'cs201', name: 'Data Structures - CS201', members: 89, unread: 12 },
    { id: 'cs102', name: 'OOP Lab - CS102', members: 67, unread: 0 },
    { id: 'projects', name: 'Project Collaboration', members: 45, unread: 3 },
    { id: 'studygroup', name: 'Study Group', members: 23, unread: 8 }
  ];

  const threads: Thread[] = [
    {
      id: '1',
      title: 'Best approach for implementing Binary Search Trees?',
      author: 'Sarah Ahmed',
      replies: 24,
      likes: 15,
      timestamp: '2 hours ago',
      category: 'Data Structures',
      isPinned: true,
      lastReply: '30 min ago'
    },
    {
      id: '2',
      title: 'Help needed with Recursion assignment',
      author: 'Ali Hassan',
      replies: 18,
      likes: 12,
      timestamp: '5 hours ago',
      category: 'Algorithms',
      lastReply: '1 hour ago'
    },
    {
      id: '3',
      title: 'Database normalization explanation',
      author: 'Fatima Khan',
      replies: 32,
      likes: 28,
      timestamp: '1 day ago',
      category: 'Databases',
      lastReply: '3 hours ago'
    },
    {
      id: '4',
      title: 'Tips for Final Exam preparation',
      author: 'Ahmed Raza',
      replies: 45,
      likes: 67,
      timestamp: '2 days ago',
      category: 'General',
      isPinned: true,
      lastReply: '5 hours ago'
    }
  ];

  const messages: Message[] = [
    {
      id: '1',
      sender: 'Sarah Ahmed',
      avatar: 'SA',
      content: 'Has anyone finished the Data Structures assignment?',
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      sender: 'Ali Hassan',
      avatar: 'AH',
      content: 'Yes! The BST implementation was tricky but I got it working.',
      timestamp: '10:32 AM'
    },
    {
      id: '3',
      sender: user.name,
      avatar: user.name.split(' ').map(n => n[0]).join(''),
      content: 'Can you share your approach? I\'m stuck on the delete function.',
      timestamp: '10:35 AM',
      isCurrentUser: true
    },
    {
      id: '4',
      sender: 'Fatima Khan',
      avatar: 'FK',
      content: 'I can help! The key is to handle three cases: node with no children, one child, or two children.',
      timestamp: '10:38 AM'
    }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    toast.success('Message sent!');
    setMessage('');
  };

  const handleAIExplain = (content: string) => {
    setShowAIAssist(true);
    toast.info('AI is analyzing the discussion...');
    setTimeout(() => {
      toast.success('AI explanation generated!');
    }, 1500);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation
        user={user}
        currentScreen="chat"
        onNavigate={onNavigate}
        onLogout={onLogout}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-gray-900 dark:text-white mb-2">Chat & Discussions</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with peers and participate in discussions
          </p>
        </div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <TabsTrigger value="chat">
              <MessageSquare className="w-4 h-4 mr-2" />
              Real-time Chat
            </TabsTrigger>
            <TabsTrigger value="threads">
              <Hash className="w-4 h-4 mr-2" />
              Discussion Threads
            </TabsTrigger>
          </TabsList>

          {/* Real-time Chat */}
          <TabsContent value="chat">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chat List */}
              <Card className="lg:col-span-1 p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 dark:text-white">Channels</h3>
                  <Button size="icon" variant="ghost">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {groupChats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChat === chat.id
                          ? 'bg-blue-100 dark:bg-blue-950/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{chat.name}</span>
                        </div>
                        {chat.unread > 0 && (
                          <Badge variant="default" className="text-xs">
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 ml-6">
                        <Users className="w-3 h-3" />
                        <span>{chat.members}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Chat Area */}
              <Card className="lg:col-span-3 flex flex-col h-[600px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-900 dark:text-white">
                        {groupChats.find(c => c.id === selectedChat)?.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {groupChats.find(c => c.id === selectedChat)?.members} members
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.isCurrentUser ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className={`${
                            msg.isCurrentUser 
                              ? 'bg-gradient-to-br from-blue-600 to-indigo-600' 
                              : 'bg-gradient-to-br from-gray-600 to-gray-700'
                          } text-white`}>
                            {msg.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex-1 ${msg.isCurrentUser ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            {!msg.isCurrentUser && (
                              <span className="text-gray-900 dark:text-white">{msg.sender}</span>
                            )}
                            <span className="text-gray-500 dark:text-gray-500">
                              {msg.timestamp}
                            </span>
                          </div>
                          <div className={`inline-block p-3 rounded-lg ${
                            msg.isCurrentUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}>
                            {msg.content}
                          </div>
                          {!msg.isCurrentUser && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleAIExplain(msg.content)}
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Explain
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* AI Assistant */}
                {showAIAssist && (
                  <div className="p-4 border-t border-b border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-950/30">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-blue-900 dark:text-blue-300 mb-2">AI Explanation</h4>
                        <p className="text-blue-800 dark:text-blue-200">
                          The delete operation in a Binary Search Tree involves three cases: 
                          1) Deleting a leaf node (no children), 
                          2) Deleting a node with one child, and 
                          3) Deleting a node with two children (use in-order successor or predecessor).
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => setShowAIAssist(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Discussion Threads */}
          <TabsContent value="threads">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Threads List */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="relative flex-1 mr-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search discussions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Thread
                    </Button>
                  </div>
                </Card>

                {threads.map(thread => (
                  <Card
                    key={thread.id}
                    className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedThread(thread)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {thread.isPinned && (
                            <Pin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                          <h4 className="text-gray-900 dark:text-white">{thread.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span>{thread.author}</span>
                          <span>•</span>
                          <span>{thread.timestamp}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">{thread.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{thread.replies} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{thread.likes} likes</span>
                      </div>
                      <div className="ml-auto">
                        Last reply {thread.lastReply}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Thread Categories */}
              <div className="space-y-4">
                <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <h3 className="text-gray-900 dark:text-white mb-4">Categories</h3>
                  <div className="space-y-2">
                    {['General', 'Data Structures', 'Algorithms', 'Databases', 'Web Development', 'Help Needed'].map(category => (
                      <button
                        key={category}
                        className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <h3 className="text-gray-900 dark:text-white mb-4">Active Users</h3>
                  <div className="space-y-3">
                    {['Sarah Ahmed', 'Ali Hassan', 'Fatima Khan', 'Ahmed Raza'].map(name => (
                      <div key={name} className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-white">
                              {getInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                        </div>
                        <span className="text-gray-900 dark:text-white">{name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

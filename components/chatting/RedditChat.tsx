import { useState } from 'react';
import { Navigation } from '../Navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { RedditPost } from './RedditPost';
import { RedditComment } from './RedditComment';
import { 
  Home,
  TrendingUp,
  Clock,
  Star,
  Search,
  Plus,
  Filter,
  MessageSquare
} from 'lucide-react';
import type { Screen, User } from '@/app/page';

interface RedditChatProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

type SortOption = 'hot' | 'new' | 'top' | 'rising';

export function RedditChat({ user, onNavigate, onLogout, darkMode, toggleTheme }: RedditChatProps) {
  const [selectedSubreddit, setSelectedSubreddit] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const subreddits = [
    { id: 'all', name: 'All', members: '2.5M' },
    { id: 'cs201', name: 'Data Structures', members: '12.3k' },
    { id: 'cs102', name: 'OOP Lab', members: '8.7k' },
    { id: 'projects', name: 'Projects', members: '5.2k' },
    { id: 'studygroup', name: 'Study Group', members: '3.1k' },
    { id: 'exams', name: 'Exam Prep', members: '9.8k' },
  ];

  const posts = [
    {
      id: '1',
      title: 'Best approach for implementing Binary Search Trees?',
      content: 'I\'ve been struggling with BST implementation. Can anyone share their approach or resources that helped them understand it better?',
      author: 'Sarah Ahmed',
      subreddit: 'cs201',
      upvotes: 245,
      downvotes: 12,
      comments: 34,
      timestamp: '2 hours ago',
      isUpvoted: false,
      isDownvoted: false,
      isSaved: false,
    },
    {
      id: '2',
      title: 'Help needed with Recursion assignment',
      content: 'Stuck on the recursive backtracking problem. Any hints would be appreciated!',
      author: 'Ali Hassan',
      subreddit: 'cs201',
      upvotes: 189,
      downvotes: 5,
      comments: 28,
      timestamp: '5 hours ago',
      isUpvoted: true,
      isDownvoted: false,
      isSaved: false,
    },
    {
      id: '3',
      title: 'Database normalization explanation',
      content: 'Can someone explain 3NF with a simple example? I\'m preparing for my database exam.',
      author: 'Fatima Khan',
      subreddit: 'projects',
      upvotes: 312,
      downvotes: 8,
      comments: 45,
      timestamp: '1 day ago',
      isUpvoted: false,
      isDownvoted: false,
      isSaved: true,
    },
    {
      id: '4',
      title: 'Tips for Final Exam preparation',
      content: 'Share your study strategies and resources that helped you ace the finals!',
      author: 'Ahmed Raza',
      subreddit: 'exams',
      upvotes: 567,
      downvotes: 15,
      comments: 89,
      timestamp: '2 days ago',
      isUpvoted: false,
      isDownvoted: false,
      isSaved: false,
    },
    {
      id: '5',
      title: 'Project collaboration platform recommendations?',
      content: 'Looking for tools to collaborate on our group project. What do you use?',
      author: 'Hassan Ali',
      subreddit: 'projects',
      upvotes: 123,
      downvotes: 3,
      comments: 21,
      timestamp: '3 days ago',
      isUpvoted: false,
      isDownvoted: false,
      isSaved: false,
    },
  ];

  const comments = [
    {
      id: 'c1',
      author: 'John Doe',
      content: 'Great question! I found this approach helpful: start with the base case, then build up. Here\'s a simple example...',
      upvotes: 45,
      downvotes: 2,
      timestamp: '1 hour ago',
      isUpvoted: false,
      isDownvoted: false,
      replies: [
        {
          id: 'c1-1',
          author: 'Sarah Ahmed',
          content: 'Thanks! This really helps clarify things.',
          upvotes: 12,
          downvotes: 0,
          timestamp: '45 min ago',
          isUpvoted: true,
          isDownvoted: false,
          replies: [],
        },
        {
          id: 'c1-2',
          author: 'Mike Johnson',
          content: 'I agree, but I think there\'s a better way to handle edge cases...',
          upvotes: 8,
          downvotes: 1,
          timestamp: '30 min ago',
          isUpvoted: false,
          isDownvoted: false,
          replies: [],
        },
      ],
    },
    {
      id: 'c2',
      author: 'Jane Smith',
      content: 'Check out this resource: [link]. It has great visualizations that helped me understand BSTs.',
      upvotes: 67,
      downvotes: 1,
      timestamp: '2 hours ago',
      isUpvoted: false,
      isDownvoted: false,
      replies: [],
    },
    {
      id: 'c3',
      author: 'Alex Brown',
      content: 'I struggled with this too! The key is understanding the recursive structure. Practice with small examples first.',
      upvotes: 34,
      downvotes: 0,
      timestamp: '3 hours ago',
      isUpvoted: false,
      isDownvoted: false,
      replies: [
        {
          id: 'c3-1',
          author: 'Chris Lee',
          content: 'Exactly! Start with 3 nodes, then 5, then 7. Build up gradually.',
          upvotes: 15,
          downvotes: 0,
          timestamp: '2 hours ago',
          isUpvoted: false,
          isDownvoted: false,
          replies: [],
        },
      ],
    },
  ];

  const selectedPostData = posts.find(p => p.id === selectedPost);

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Reddit-Style Discussions
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Browse posts, upvote content, and join discussions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Sort Options */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={sortBy === 'hot' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('hot')}
                  className="gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Hot
                </Button>
                <Button
                  variant={sortBy === 'new' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('new')}
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  New
                </Button>
                <Button
                  variant={sortBy === 'top' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('top')}
                  className="gap-2"
                >
                  <Star className="h-4 w-4" />
                  Top
                </Button>
                <Button
                  variant={sortBy === 'rising' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('rising')}
                >
                  Rising
                </Button>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>

            {/* Posts List */}
            {!selectedPost ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post.id)}
                    className="cursor-pointer"
                  >
                    <RedditPost {...post} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Back Button */}
                <Button
                  variant="ghost"
                  onClick={() => setSelectedPost(null)}
                  className="mb-2"
                >
                  ← Back to Posts
                </Button>

                {/* Selected Post */}
                {selectedPostData && (
                  <RedditPost {...selectedPostData} />
                )}

                {/* Comments Section */}
                <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Comments ({comments.length})
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Input
                        placeholder="Add a comment..."
                        className="flex-1"
                      />
                      <Button>Comment</Button>
                    </div>
                  </div>

                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <RedditComment key={comment.id} {...comment} />
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Search */}
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </Card>

            {/* Create Post */}
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Create Post
              </Button>
            </Card>

            {/* Subreddits */}
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Communities
              </h3>
              <div className="space-y-2">
                {subreddits.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubreddit(sub.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedSubreddit === sub.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                          r/
                        </div>
                        <div>
                          <p className="font-medium">r/{sub.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {sub.members} members
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Rules/Info */}
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Community Rules
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Be respectful and kind</li>
                <li>• Stay on topic</li>
                <li>• No spam or self-promotion</li>
                <li>• Follow academic integrity</li>
                <li>• Help others learn</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

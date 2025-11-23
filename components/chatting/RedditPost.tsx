import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  Clock
} from 'lucide-react';

interface RedditPostProps {
  id: string;
  title: string;
  content?: string;
  author: string;
  authorAvatar?: string;
  subreddit: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timestamp: string;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
  isSaved?: boolean;
  imageUrl?: string;
  linkUrl?: string;
}

export function RedditPost({
  id,
  title,
  content,
  author,
  authorAvatar,
  subreddit,
  upvotes,
  downvotes,
  comments,
  timestamp,
  isUpvoted = false,
  isDownvoted = false,
  isSaved = false,
  imageUrl,
  linkUrl
}: RedditPostProps) {
  const score = upvotes - downvotes;
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      <div className="flex">
        {/* Vote Section */}
        <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isUpvoted ? 'text-orange-500' : 'text-gray-500'}`}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span className={`text-sm font-semibold py-1 ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-blue-500' : 'text-gray-500'}`}>
            {score > 0 ? '+' : ''}{score}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isDownvoted ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="flex-1 p-4">
          {/* Post Header */}
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-gray-100">r/{subreddit}</span>
            <span>•</span>
            <span>Posted by</span>
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-xs">
                  {authorAvatar ? '' : getInitials(author)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">u/{author}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{timestamp}</span>
            </div>
          </div>

          {/* Post Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
            {title}
          </h3>

          {/* Post Content */}
          {content && (
            <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
              {content}
            </p>
          )}

          {/* Post Image */}
          {imageUrl && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img 
                src={imageUrl} 
                alt={title}
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Post Link */}
          {linkUrl && (
            <a 
              href={linkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Link</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 truncate">{linkUrl}</p>
                </div>
              </div>
            </a>
          )}

          {/* Post Actions */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>{comments} Comments</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-2 ${isSaved ? 'text-blue-500' : ''}`}
            >
              <Bookmark className="h-4 w-4" />
              <span>Save</span>
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

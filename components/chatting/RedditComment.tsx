import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { 
  ArrowUp, 
  ArrowDown, 
  Reply,
  MoreHorizontal,
  Clock
} from 'lucide-react';

interface RedditCommentProps {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  timestamp: string;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
  replies?: RedditCommentProps[];
  level?: number;
}

export function RedditComment({
  id,
  author,
  authorAvatar,
  content,
  upvotes,
  downvotes,
  timestamp,
  isUpvoted = false,
  isDownvoted = false,
  replies = [],
  level = 0
}: RedditCommentProps) {
  const score = upvotes - downvotes;
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const maxLevel = 5;
  const isNested = level > 0;
  const shouldShowReplies = level < maxLevel;

  return (
    <div className={`${isNested ? 'ml-8 mt-3' : ''}`}>
      <div className="flex gap-3">
        {/* Vote Section */}
        <div className="flex flex-col items-center pt-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 ${isUpvoted ? 'text-orange-500' : 'text-gray-500'}`}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <span className={`text-xs font-medium py-0.5 ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-blue-500' : 'text-gray-500'}`}>
            {score > 0 ? '+' : ''}{score}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 ${isDownvoted ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 dark:text-gray-400">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs">
                {authorAvatar ? '' : getInitials(author)}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-gray-900 dark:text-gray-100">u/{author}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{timestamp}</span>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap text-sm">
            {content}
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <Button variant="ghost" size="sm" className="h-6 px-2 gap-1">
              <Reply className="h-3 w-3" />
              <span>Reply</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <span>Give Award</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <span>Share</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>

          {/* Nested Replies */}
          {shouldShowReplies && replies.length > 0 && (
            <div className="mt-3 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {replies.map((reply) => (
                <RedditComment
                  key={reply.id}
                  {...reply}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


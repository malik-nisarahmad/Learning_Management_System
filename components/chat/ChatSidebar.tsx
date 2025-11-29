'use client';

import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Search,
  Plus,
  Users,
  MessageCircle,
} from 'lucide-react';
import {
  Conversation,
  subscribeToConversations,
  getConversationName,
  getConversationAvatar,
  formatMessageTime,
} from '@/lib/chatSystem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ChatSidebarProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewChat: () => void;
  onNewGroup: () => void;
  onOpenFriends: () => void;
  userPresence: { [userId: string]: { isOnline: boolean; lastSeen: Date } };
  darkMode: boolean;
}

export function ChatSidebar({
  currentUser,
  selectedConversation,
  onSelectConversation,
  onNewChat,
  onNewGroup,
  onOpenFriends,
  userPresence,
  darkMode,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'private' | 'group'>('all');

  useEffect(() => {
    const unsub = subscribeToConversations(currentUser.id, setConversations);
    return () => unsub();
  }, [currentUser.id]);

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'private' && conv.type !== 'private') return false;
    if (filter === 'group' && conv.type !== 'group') return false;

    if (searchQuery) {
      const name = getConversationName(conv, currentUser.id).toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    }

    return true;
  });

  const getOnlineStatus = (conversation: Conversation) => {
    if (conversation.type !== 'private') return null;

    const otherMemberId = conversation.members.find(id => id !== currentUser.id);
    if (otherMemberId && userPresence[otherMemberId]) {
      return userPresence[otherMemberId].isOnline;
    }
    return false;
  };

  const totalUnread = conversations.reduce((total, conv) => {
    return total + (conv.unreadCount[currentUser.id] || 0);
  }, 0);

  return (
    <div className="h-full flex flex-col bg-[#0f1222]">
      {/* Header */}
      <div className="p-4 border-b border-[#1e2545]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border border-[#2a3358]">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe] font-semibold">
                  {currentUser.name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00cec9] rounded-full border-2 border-[#0f1222]" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Chats</h2>
              <p className="text-xs">
                {totalUnread > 0 ? (
                  <span className="text-[#a29bfe]">{totalUnread} unread</span>
                ) : (
                  <span className="text-[#8892b3]">All caught up</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#8892b3] hover:text-white hover:bg-[#171d36]"
              onClick={onOpenFriends}
            >
              <Users className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8892b3] hover:text-white hover:bg-[#171d36]">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#171d36] border-[#2a3358] rounded-xl">
                <DropdownMenuItem onClick={onNewChat} className="text-white hover:bg-[#1e2545] focus:bg-[#1e2545] rounded-lg">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  New Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onNewGroup} className="text-white hover:bg-[#1e2545] focus:bg-[#1e2545] rounded-lg">
                  <Users className="h-4 w-4 mr-2" />
                  New Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5a6587]" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-[#0c0f1a] border-[#2a3358] text-white placeholder:text-[#5a6587] rounded-xl focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mt-3">
          {(['all', 'private', 'group'] as const).map((f) => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(f)}
              className={`text-xs capitalize h-8 px-3 rounded-lg ${
                filter === f
                  ? 'bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white hover:from-[#5b4cdb] hover:to-[#9645e5]'
                  : 'text-[#8892b3] hover:text-[#b8c0e0] hover:bg-[#171d36]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'private' ? 'Direct' : 'Groups'}
            </Button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-[#171d36] border border-[#2a3358]">
              <MessageCircle className="h-7 w-7 text-[#5a6587]" />
            </div>
            <p className="font-semibold text-white">No conversations yet</p>
            <p className="text-sm mt-1 text-[#8892b3]">
              Start by adding friends!
            </p>
            <Button
              className="mt-4 h-10 bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] hover:from-[#5b4cdb] hover:to-[#9645e5] text-white border-0 rounded-xl shadow-lg shadow-purple-500/25"
              onClick={onOpenFriends}
            >
              <Users className="h-4 w-4 mr-2" />
              Find Friends
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map(conversation => {
              const name = getConversationName(conversation, currentUser.id);
              const avatar = getConversationAvatar(conversation, currentUser.id);
              const isOnline = getOnlineStatus(conversation);
              const unreadCount = conversation.unreadCount[currentUser.id] || 0;
              const isSelected = selectedConversation?.id === conversation.id;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#6c5ce7]/20 to-[#a855f7]/10 border border-[#6c5ce7]/40'
                      : 'hover:bg-[#171d36] border border-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-11 w-11 border border-[#2a3358]">
                      <AvatarImage src={avatar} />
                      <AvatarFallback
                        className={`${
                          conversation.type === 'group'
                            ? 'bg-gradient-to-br from-[#a855f7]/20 to-[#fd79a8]/20 text-[#dbb2ff]'
                            : 'bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe]'
                        } font-semibold`}
                      >
                        {conversation.type === 'group' ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          name?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.type === 'private' && (
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f1222] ${
                          isOnline ? 'bg-[#00cec9]' : 'bg-[#5a6587]'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`font-medium text-sm truncate ${
                        unreadCount > 0 ? 'text-white' : 'text-[#b8c0e0]'
                      }`}>
                        {name}
                      </p>
                      {conversation.lastMessageTime && (
                        <span className="text-xs flex-shrink-0 ml-2 text-[#5a6587]">
                          {formatMessageTime(conversation.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${
                        unreadCount > 0 ? 'text-[#b8c0e0] font-medium' : 'text-[#8892b3]'
                      }`}>
                        {conversation.lastMessageSender && conversation.type === 'group'
                          ? `${conversation.lastMessageSender}: `
                          : ''}
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      {unreadCount > 0 && (
                        <Badge className="ml-2 h-5 min-w-[20px] px-1.5 bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] hover:from-[#6c5ce7] hover:to-[#a855f7] border-0 text-white text-xs">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                    {conversation.type === 'group' && (
                      <p className="text-xs mt-0.5 text-[#5a6587]">
                        {conversation.members.length} members
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

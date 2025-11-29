'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import {
  ArrowLeft,
  Send,
  Info,
  Paperclip,
  Smile,
  MoreVertical,
  Check,
  CheckCheck,
  Image as ImageIcon,
  File,
  X,
  Users,
  Loader2,
  Reply,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Conversation,
  Message,
  getConversationName,
  getConversationAvatar,
  subscribeToMessages,
  sendMessage,
  markAsRead,
  setTypingStatus,
  uploadFile,
  deleteMessage,
  formatMessageTime,
} from '@/lib/chatSystem';
import { toast } from 'sonner';

interface ConversationWindowProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  conversation: Conversation;
  userPresence: { [userId: string]: { isOnline: boolean; lastSeen: Date } };
  onBack: () => void;
  onViewInfo: () => void;
  darkMode: boolean;
  isMobile: boolean;
}

export function ConversationWindow({
  currentUser,
  conversation,
  userPresence,
  onBack,
  onViewInfo,
  darkMode,
  isMobile,
}: ConversationWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversationName = getConversationName(conversation, currentUser.id);
  const conversationAvatar = getConversationAvatar(conversation, currentUser.id);

  // Get online status for private chats
  const getOnlineStatus = () => {
    if (conversation.type !== 'private') return null;
    const otherMemberId = conversation.members.find(id => id !== currentUser.id);
    if (otherMemberId && userPresence[otherMemberId]) {
      return userPresence[otherMemberId];
    }
    return null;
  };

  const onlineStatus = getOnlineStatus();

  // Subscribe to messages
  useEffect(() => {
    const unsub = subscribeToMessages(conversation.id, (msgs) => {
      setMessages(msgs);
      // Mark messages as read
      markAsRead(conversation.id, currentUser.id);
    });
    return () => unsub();
  }, [conversation.id, currentUser.id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle typing status
  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      setTypingStatus(conversation.id, currentUser.id, currentUser.name, false);
    }, 2000);

    return () => clearTimeout(typingTimeout);
  }, [newMessage, conversation.id, currentUser.id, currentUser.name]);

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (value.trim()) {
      setTypingStatus(conversation.id, currentUser.id, currentUser.name, true);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');
    setTypingStatus(conversation.id, currentUser.id, currentUser.name, false);

    const success = await sendMessage(
      conversation.id,
      currentUser,
      messageContent,
      'text',
      undefined,
      replyingTo ? {
        messageId: replyingTo.id,
        senderName: replyingTo.senderName,
        content: replyingTo.content,
      } : undefined
    );

    setIsSending(false);
    setReplyingTo(null);

    if (!success) {
      toast.error('Failed to send message');
      setNewMessage(messageContent);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const fileData = await uploadFile(file, conversation.id, currentUser.id);
      if (fileData) {
        const fileType = file.type.startsWith('image/') ? 'image' : 'file';
        await sendMessage(
          conversation.id,
          currentUser,
          file.name,
          fileType,
          fileData
        );
      }
    } catch (error) {
      toast.error('Failed to upload file');
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteMessage = async (message: Message) => {
    const success = await deleteMessage(conversation.id, message.id);
    if (!success) {
      toast.error('Failed to delete message');
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderDateSeparator = (date: Date, prevDate?: Date) => {
    const dateStr = formatDate(date);
    const prevDateStr = prevDate ? formatDate(prevDate) : null;

    if (dateStr !== prevDateStr) {
      return (
        <div className="flex items-center justify-center py-4">
          <div className="px-3 py-1 rounded-lg bg-[#171d36] border border-[#2a3358]">
            <span className="text-xs font-medium text-[#8892b3]">{dateStr}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.senderId === currentUser.id;
    const prevMessage = messages[index - 1];
    const showAvatar = !isOwn && (!prevMessage || prevMessage.senderId !== message.senderId);

    return (
      <div key={message.id}>
        {renderDateSeparator(message.createdAt, prevMessage?.createdAt)}

        {message.type === 'system' ? (
          <div className="flex justify-center py-2">
            <span className="text-xs text-[#8892b3] bg-[#171d36] px-3 py-1 rounded-lg">
              {message.content}
            </span>
          </div>
        ) : (
          <div className={`flex gap-2 px-4 py-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            {!isOwn && conversation.type === 'group' && (
              <div className="w-8 flex-shrink-0">
                {showAvatar && (
                  <Avatar className="h-8 w-8 border border-[#2a3358]">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback className="bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe] text-xs font-semibold">
                      {message.senderName?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )}

            {/* Message Content */}
            <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
              {/* Sender name for groups */}
              {!isOwn && conversation.type === 'group' && showAvatar && (
                <span className="text-xs font-medium mb-1 text-[#b8c0e0]">
                  {message.senderName}
                </span>
              )}

              {/* Reply preview */}
              {message.replyTo && (
                <div className="mb-1 px-2 py-1 rounded-lg bg-[#171d36] border-l-2 border-[#6c5ce7]">
                  <p className="text-xs font-medium text-[#b8c0e0]">{message.replyTo.senderName}</p>
                  <p className="text-xs truncate text-[#8892b3]">{message.replyTo.content}</p>
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`group relative px-3 py-2 rounded-xl ${
                  isOwn
                    ? 'bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white rounded-br-sm shadow-lg shadow-purple-500/20'
                    : 'bg-[#171d36] text-white rounded-bl-sm border border-[#2a3358]'
                } ${message.isDeleted ? 'opacity-60 italic' : ''}`}
              >
                {message.isDeleted ? (
                  <p className="text-sm text-[#8892b3]">Message deleted</p>
                ) : message.type === 'image' ? (
                  <div>
                    <img
                      src={message.fileUrl}
                      alt={message.fileName || 'Image'}
                      className="max-w-full rounded-lg max-h-60 object-cover"
                    />
                    {message.content && message.content !== message.fileName && (
                      <p className="text-sm mt-1">{message.content}</p>
                    )}
                  </div>
                ) : message.type === 'file' ? (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <div className={`p-2 rounded-lg ${isOwn ? 'bg-white/20' : 'bg-[#1e2545]'}`}>
                      <File className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{message.fileName}</p>
                      {message.fileSize && (
                        <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-[#8892b3]'}`}>
                          {(message.fileSize / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                  </a>
                ) : (
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                )}

                {/* Message actions */}
                {!message.isDeleted && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 bg-[#111629] border border-[#2a3358] hover:bg-[#171d36] rounded-lg"
                        >
                          <MoreVertical className="h-3 w-3 text-[#b8c0e0]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#171d36] border-[#2a3358] rounded-xl">
                        <DropdownMenuItem
                          onClick={() => setReplyingTo(message)}
                          className="text-white hover:bg-[#1e2545] focus:bg-[#1e2545] rounded-lg"
                        >
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </DropdownMenuItem>
                        {isOwn && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteMessage(message)}
                            className="text-[#fd79a8] hover:bg-[#1e2545] focus:bg-[#1e2545] rounded-lg"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Time and status */}
              <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] text-[#5a6587]">
                  {formatMessageTime(message.createdAt)}
                </span>
                {isOwn && !message.isDeleted && (
                  <span className="text-[10px]">
                    {message.readBy && message.readBy.length > 1 ? (
                      <CheckCheck className="h-3 w-3 text-[#00cec9]" />
                    ) : (
                      <Check className="h-3 w-3 text-[#5a6587]" />
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0f1a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#1e2545] bg-[#0f1222]">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-9 w-9 text-[#b8c0e0] hover:text-white hover:bg-[#171d36]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <div className="relative">
            <Avatar className="h-10 w-10 border border-[#2a3358]">
              <AvatarImage src={conversationAvatar} />
              <AvatarFallback
                className={`font-semibold ${
                  conversation.type === 'group'
                    ? 'bg-gradient-to-br from-[#a855f7]/20 to-[#fd79a8]/20 text-[#dbb2ff]'
                    : 'bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe]'
                }`}
              >
                {conversation.type === 'group' ? (
                  <Users className="h-5 w-5" />
                ) : (
                  conversationName?.charAt(0)?.toUpperCase() || '?'
                )}
              </AvatarFallback>
            </Avatar>
            {conversation.type === 'private' && onlineStatus && (
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f1222] ${
                  onlineStatus.isOnline ? 'bg-[#00cec9]' : 'bg-[#5a6587]'
                }`}
              />
            )}
          </div>

          <div>
            <h3 className="font-semibold text-white">{conversationName}</h3>
            <p className="text-xs text-[#8892b3]">
              {conversation.type === 'group' ? (
                `${conversation.members.length} members`
              ) : onlineStatus?.isOnline ? (
                <span className="text-[#00cec9]">Online</span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onViewInfo}
            className="h-9 w-9 text-[#8892b3] hover:text-white hover:bg-[#171d36]"
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 border border-[#6c5ce7]/30 flex items-center justify-center mb-4">
                <Send className="h-7 w-7 text-[#a29bfe]" />
              </div>
              <p className="font-semibold text-white">No messages yet</p>
              <p className="text-sm text-[#8892b3] mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#6c5ce7] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#a855f7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#00cec9] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-[#8892b3]">
                  {typingUsers.length === 1 ? 'typing...' : 'are typing...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Reply preview */}
      {replyingTo && (
        <div className="px-4 py-2 border-t border-[#1e2545] bg-[#0f1222]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Reply className="h-4 w-4 flex-shrink-0 text-[#a29bfe]" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#b8c0e0]">
                  Replying to {replyingTo.senderName}
                </p>
                <p className="text-xs truncate text-[#8892b3]">{replyingTo.content}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReplyingTo(null)}
              className="h-6 w-6 flex-shrink-0 text-[#8892b3] hover:text-white hover:bg-[#171d36]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[#1e2545] bg-[#0f1222]">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-10 w-10 flex-shrink-0 text-[#8892b3] hover:text-white hover:bg-[#171d36] rounded-xl"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </Button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="pr-10 h-10 bg-[#111629] border-[#2a3358] text-white placeholder:text-[#5a6587] rounded-xl focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="h-10 w-10 flex-shrink-0 bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] hover:from-[#5b4cdb] hover:to-[#9645e5] text-white border-0 rounded-xl shadow-lg shadow-purple-500/25"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

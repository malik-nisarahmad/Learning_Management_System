'use client';

import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Search,
  UserPlus,
  Users,
  Clock,
  Check,
  X,
  MessageCircle,
  Loader2,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  ChatUser,
  Friend,
  FriendRequest,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  subscribeToFriends,
  subscribeToFriendRequests,
} from '@/lib/chatSystem';
import { toast } from 'sonner';

interface FriendSystemProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  onStartChat: (friendId: string) => void;
  darkMode: boolean;
}

type Tab = 'friends' | 'requests' | 'search';

export function FriendSystem({ currentUser, onStartChat, darkMode }: FriendSystemProps) {
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Subscribe to friends
  useEffect(() => {
    const unsub = subscribeToFriends(currentUser.id, setFriends);
    return () => unsub();
  }, [currentUser.id]);

  // Subscribe to friend requests
  useEffect(() => {
    const unsub = subscribeToFriendRequests(
      currentUser.id,
      (incoming) => setIncomingRequests(incoming),
      (outgoing) => setOutgoingRequests(outgoing)
    );
    return () => unsub();
  }, [currentUser.id]);

  // Search users
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchUsers(searchQuery, currentUser.id);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery, currentUser.id]);

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  const handleSendRequest = async (user: ChatUser) => {
    setLoading(`send-${user.id}`, true);
    const success = await sendFriendRequest(currentUser, {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
    setLoading(`send-${user.id}`, false);

    if (success) {
      toast.success(`Friend request sent to ${user.name}`);
    } else {
      toast.error('Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    setLoading(`accept-${request.id}`, true);
    const success = await acceptFriendRequest(request.id, request.receiverId, request.senderId);
    setLoading(`accept-${request.id}`, false);

    if (success) {
      toast.success(`You are now friends with ${request.senderName}`);
    } else {
      toast.error('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (request: FriendRequest) => {
    setLoading(`decline-${request.id}`, true);
    const success = await declineFriendRequest(request.id);
    setLoading(`decline-${request.id}`, false);

    if (success) {
      toast.success('Request declined');
    } else {
      toast.error('Failed to decline request');
    }
  };

  const handleCancelRequest = async (request: FriendRequest) => {
    setLoading(`cancel-${request.id}`, true);
    const success = await cancelFriendRequest(request.id);
    setLoading(`cancel-${request.id}`, false);

    if (success) {
      toast.success('Request cancelled');
    } else {
      toast.error('Failed to cancel request');
    }
  };

  const handleRemoveFriend = async (friend: Friend) => {
    setLoading(`remove-${friend.id}`, true);
    const success = await removeFriend(currentUser.id, friend.odone || friend.id);
    setLoading(`remove-${friend.id}`, false);

    if (success) {
      toast.success(`Removed ${friend.name} from friends`);
    } else {
      toast.error('Failed to remove friend');
    }
  };

  const getUserStatus = (userId: string) => {
    // Check if already friends
    const isFriend = friends.some(f => f.id === userId || f.odone === userId);
    if (isFriend) return 'friend';

    // Check if request pending (incoming)
    const hasIncoming = incomingRequests.some(r => r.senderId === userId);
    if (hasIncoming) return 'incoming';

    // Check if request pending (outgoing)
    const hasOutgoing = outgoingRequests.some(r => r.receiverId === userId);
    if (hasOutgoing) return 'outgoing';

    return 'none';
  };

  const totalRequests = incomingRequests.length;

  return (
    <div className="h-full flex flex-col bg-[#0f1222]">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)} className="flex-1 flex flex-col">
        <div className="px-4 pt-3 pb-2 border-b border-[#1e2545]">
          <TabsList className="w-full grid grid-cols-3 p-1 rounded-xl bg-[#111629] border border-[#1e2545]">
            <TabsTrigger
              value="friends"
              className="flex items-center justify-center gap-1.5 text-xs rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6c5ce7] data-[state=active]:to-[#a855f7] data-[state=active]:text-white text-[#8892b3]"
            >
              <Users className="h-3.5 w-3.5" />
              Friends
              {friends.length > 0 && (
                <span className="text-[10px]">({friends.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="flex items-center justify-center gap-1.5 text-xs rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6c5ce7] data-[state=active]:to-[#a855f7] data-[state=active]:text-white text-[#8892b3] relative"
            >
              <Clock className="h-3.5 w-3.5" />
              Requests
              {totalRequests > 0 && (
                <Badge className="ml-1 h-4 min-w-[16px] px-1 bg-[#fd79a8] hover:bg-[#fd79a8] text-white text-[10px] border-0">
                  {totalRequests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="flex items-center justify-center gap-1.5 text-xs rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6c5ce7] data-[state=active]:to-[#a855f7] data-[state=active]:text-white text-[#8892b3]"
            >
              <Search className="h-3.5 w-3.5" />
              Find
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Friends Tab */}
        <TabsContent value="friends" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            {friends.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-[#171d36] border border-[#2a3358]">
                  <Users className="h-7 w-7 text-[#5a6587]" />
                </div>
                <p className="font-semibold text-white">No friends yet</p>
                <p className="text-sm mt-1 text-[#8892b3]">
                  Search for users to add friends
                </p>
                <Button
                  className="mt-4 h-10 bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] hover:from-[#5b4cdb] hover:to-[#9645e5] text-white border-0 rounded-xl shadow-lg shadow-purple-500/25"
                  onClick={() => setActiveTab('search')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find Friends
                </Button>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {friends.map(friend => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#111629] border border-[#1e2545] hover:border-[#6c5ce7]/50 transition-all duration-200"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 border border-[#2a3358]">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe] font-semibold">
                          {friend.name?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111629] ${
                          friend.isOnline ? 'bg-[#00cec9]' : 'bg-[#5a6587]'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-white">
                        {friend.name}
                      </p>
                      <p className={`text-xs ${friend.isOnline ? 'text-[#00cec9]' : 'text-[#8892b3]'}`}>
                        {friend.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#a29bfe] hover:text-white hover:bg-[#6c5ce7]/20"
                        onClick={() => onStartChat(friend.odone || friend.id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#8892b3] hover:text-[#fd79a8] hover:bg-[#fd79a8]/20"
                        onClick={() => handleRemoveFriend(friend)}
                        disabled={loadingStates[`remove-${friend.id}`]}
                      >
                        {loadingStates[`remove-${friend.id}`] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-4">
              {/* Incoming Requests */}
              <div>
                <h3 className="px-2 mb-2 text-xs font-medium text-[#8892b3] uppercase tracking-wider">
                  Incoming ({incomingRequests.length})
                </h3>
                {incomingRequests.length === 0 ? (
                  <p className="px-2 text-sm text-[#5a6587]">No incoming requests</p>
                ) : (
                  <div className="space-y-1">
                    {incomingRequests.map(request => (
                      <div
                        key={request.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#111629] border border-[#1e2545]"
                      >
                        <Avatar className="h-10 w-10 border border-[#2a3358]">
                          <AvatarImage src={request.senderAvatar} />
                          <AvatarFallback className="bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe] font-semibold">
                            {request.senderName?.charAt(0)?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-white">
                            {request.senderName}
                          </p>
                          <p className="text-xs text-[#8892b3]">
                            Wants to be friends
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#00cec9] hover:text-white hover:bg-[#00cec9]/20"
                            onClick={() => handleAcceptRequest(request)}
                            disabled={loadingStates[`accept-${request.id}`]}
                          >
                            {loadingStates[`accept-${request.id}`] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#fd79a8] hover:text-white hover:bg-[#fd79a8]/20"
                            onClick={() => handleDeclineRequest(request)}
                            disabled={loadingStates[`decline-${request.id}`]}
                          >
                            {loadingStates[`decline-${request.id}`] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Requests */}
              <div>
                <h3 className="px-2 mb-2 text-xs font-medium text-[#8892b3] uppercase tracking-wider">
                  Sent ({outgoingRequests.length})
                </h3>
                {outgoingRequests.length === 0 ? (
                  <p className="px-2 text-sm text-[#5a6587]">No pending requests</p>
                ) : (
                  <div className="space-y-1">
                    {outgoingRequests.map(request => (
                      <div
                        key={request.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#111629] border border-[#1e2545]"
                      >
                        <Avatar className="h-10 w-10 border border-[#2a3358]">
                          <AvatarImage src={request.receiverAvatar} />
                          <AvatarFallback className="bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe] font-semibold">
                            {request.receiverName?.charAt(0)?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-white">
                            {request.receiverName}
                          </p>
                          <p className="text-xs text-[#fdcb6e]">
                            Pending...
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-[#8892b3] hover:text-[#fd79a8] hover:bg-[#171d36]"
                          onClick={() => handleCancelRequest(request)}
                          disabled={loadingStates[`cancel-${request.id}`]}
                        >
                          {loadingStates[`cancel-${request.id}`] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Cancel'
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="flex-1 m-0 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-[#1e2545]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5a6587]" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-[#0c0f1a] border-[#2a3358] text-white placeholder:text-[#5a6587] rounded-xl focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {isSearching ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-[#a29bfe]" />
                <p className="mt-2 text-sm text-[#8892b3]">Searching...</p>
              </div>
            ) : searchQuery.trim().length < 2 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-[#171d36] border border-[#2a3358]">
                  <Search className="h-7 w-7 text-[#5a6587]" />
                </div>
                <p className="font-semibold text-white">Find new friends</p>
                <p className="text-sm mt-1 text-[#8892b3]">
                  Type at least 2 characters to search
                </p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-[#171d36] border border-[#2a3358]">
                  <UserX className="h-7 w-7 text-[#5a6587]" />
                </div>
                <p className="font-semibold text-white">No users found</p>
                <p className="text-sm mt-1 text-[#8892b3]">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {searchResults.map(user => {
                  const status = getUserStatus(user.id);

                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#111629] border border-[#1e2545] hover:border-[#6c5ce7]/50 transition-all duration-200"
                    >
                      <Avatar className="h-10 w-10 border border-[#2a3358]">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe] font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-white">
                          {user.name}
                        </p>
                        <p className="text-xs truncate text-[#8892b3]">
                          {user.department || user.email}
                        </p>
                      </div>
                      {status === 'friend' ? (
                        <Badge className="bg-[#00cec9]/20 text-[#00cec9] border-0 hover:bg-[#00cec9]/20">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Friends
                        </Badge>
                      ) : status === 'incoming' ? (
                        <Badge className="bg-[#81ecec]/20 text-[#81ecec] border-0 hover:bg-[#81ecec]/20">
                          <Clock className="h-3 w-3 mr-1" />
                          Respond
                        </Badge>
                      ) : status === 'outgoing' ? (
                        <Badge className="bg-[#fdcb6e]/20 text-[#fdcb6e] border-0 hover:bg-[#fdcb6e]/20">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-[#a29bfe] hover:text-white hover:bg-[#6c5ce7]/20"
                          onClick={() => handleSendRequest(user)}
                          disabled={loadingStates[`send-${user.id}`]}
                        >
                          {loadingStates[`send-${user.id}`] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

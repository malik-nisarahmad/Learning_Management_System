'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  MessageCircle,
  Users,
  ArrowLeft,
  X,
  Bug,
  Newspaper,
} from 'lucide-react';
import { Navigation } from '../Navigation';
import { ChatSidebar } from './ChatSidebar';
import { ConversationWindow } from './ConversationWindow';
import { FriendSystem } from './FriendSystem';
import { CreateGroupDialog, GroupInfoPanel } from './GroupManagement';
import { DiscussionFeed } from './DiscussionFeed';
import { FirebaseDebug } from '../FirebaseDebug';
import {
  Conversation,
  Friend,
  registerChatUser,
  updateUserPresence,
  subscribeToUserPresence,
  subscribeToFriends,
  subscribeToConversations,
  createPrivateConversation,
  leaveGroup,
} from '@/lib/chatSystem';
import { toast } from 'sonner';
import type { User, Screen } from '@/app/page';

interface ChatAppProps {
  user: User;
  darkMode: boolean;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

type View = 'chats' | 'friends';
type MainTab = 'messages' | 'discussions';

export function ChatApp({ user, darkMode, onNavigate, onLogout }: ChatAppProps) {
  const [mainTab, setMainTab] = useState<MainTab>('messages');
  const [currentView, setCurrentView] = useState<View>('chats');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [userPresence, setUserPresence] = useState<{ [userId: string]: { isOnline: boolean; lastSeen: Date } }>({});
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  const currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    department: user.department,
    semester: user.semester,
    fastId: user.fastId,
  };

  useEffect(() => {
    registerChatUser(currentUser);
    updateUserPresence(user.id, true);

    const handleVisibilityChange = () => {
      updateUserPresence(user.id, !document.hidden);
    };

    const handleBeforeUnload = () => {
      updateUserPresence(user.id, false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      updateUserPresence(user.id, false);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user.id]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const unsub = subscribeToConversations(user.id, setConversations);
    return () => unsub();
  }, [user.id]);

  useEffect(() => {
    const unsub = subscribeToFriends(user.id, setFriends);
    return () => unsub();
  }, [user.id]);

  useEffect(() => {
    const memberIds = new Set<string>();
    conversations.forEach(conv => {
      conv.members.forEach(id => {
        if (id !== user.id) memberIds.add(id);
      });
    });

    if (memberIds.size === 0) return;

    const unsub = subscribeToUserPresence(Array.from(memberIds), setUserPresence);
    return () => unsub();
  }, [conversations, user.id]);

  const handleStartChat = async (friendId: string) => {
    const existingConvo = conversations.find(
      conv => conv.type === 'private' && conv.members.includes(friendId)
    );

    if (existingConvo) {
      setSelectedConversation(existingConvo);
      setCurrentView('chats');
      setShowConversation(true);
      return;
    }

    const friend = friends.find(f => f.id === friendId || f.odone === friendId);
    if (!friend) {
      toast.error('Friend not found');
      return;
    }

    const convoId = await createPrivateConversation(
      currentUser,
      { id: friend.odone || friend.id, name: friend.name, email: friend.email, avatar: friend.avatar }
    );

    if (convoId) {
      setTimeout(() => {
        const newConvo = conversations.find(c => c.id === convoId);
        if (newConvo) {
          setSelectedConversation(newConvo);
        }
        setCurrentView('chats');
        setShowConversation(true);
      }, 500);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversation(true);
  };

  const handleBack = () => {
    setShowConversation(false);
    setSelectedConversation(null);
  };

  const handleGroupCreated = (groupId: string) => {
    setTimeout(() => {
      const newGroup = conversations.find(c => c.id === groupId);
      if (newGroup) {
        setSelectedConversation(newGroup);
        setShowConversation(true);
      }
    }, 500);
  };

  const handleLeaveGroup = async () => {
    if (!selectedConversation || selectedConversation.type !== 'group') return;

    const success = await leaveGroup(selectedConversation.id, { id: user.id, name: user.name });
    if (success) {
      toast.success('Left the group');
      setSelectedConversation(null);
      setShowInfoPanel(false);
      setShowConversation(false);
    } else {
      toast.error('Failed to leave group');
    }
  };

  const renderNewChatDialog = () => (
    <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
      <DialogContent className="sm:max-w-md bg-[#111629] border-[#1e2545] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-xl bg-gradient-to-r from-[#6c5ce7]/20 to-[#a855f7]/20 border border-[#6c5ce7]/30">
              <MessageCircle className="h-4 w-4 text-[#a29bfe]" />
            </div>
            New Chat
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px]">
          {friends.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-[#171d36] border border-[#2a3358]">
                <Users className="h-7 w-7 text-[#5a6587]" />
              </div>
              <p className="font-semibold text-white">No friends yet</p>
              <p className="text-sm mt-1 text-[#8892b3]">Add friends to start chatting</p>
              <Button
                className="mt-4 h-10 bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] hover:from-[#5b4cdb] hover:to-[#9645e5] text-white border-0 rounded-xl shadow-lg shadow-purple-500/25"
                onClick={() => {
                  setShowNewChatDialog(false);
                  setCurrentView('friends');
                }}
              >
                Find Friends
              </Button>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {friends.map(friend => {
                const friendId = friend.odone || friend.id;
                const presence = userPresence[friendId];

                return (
                  <div
                    key={friendId}
                    onClick={() => {
                      handleStartChat(friendId);
                      setShowNewChatDialog(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer bg-[#171d36] border border-[#2a3358] hover:border-[#6c5ce7]/50 transition-all duration-200"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 border border-[#2a3358]">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe] font-semibold">
                          {friend.name?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      {presence?.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00cec9] rounded-full border-2 border-[#171d36]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-white text-sm">
                        {friend.name}
                      </p>
                      <p className={`text-xs ${presence?.isOnline ? 'text-[#00cec9]' : 'text-[#8892b3]'}`}>
                        {presence?.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#030712]">
        <Navigation
          user={user}
          currentScreen="chat"
          onNavigate={onNavigate}
          onLogout={onLogout}
          darkMode={darkMode}
        />
        
        <div className="pt-16 h-screen flex flex-col">
          <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 mx-4 mt-2 p-1 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <TabsTrigger 
                value="messages" 
                className="flex items-center gap-2 rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-400"
              >
                <MessageCircle className="h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger 
                value="discussions" 
                className="flex items-center gap-2 rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-400"
              >
                <Newspaper className="h-4 w-4" />
                Discussions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="flex-1 m-0 mt-2">
              {showConversation && selectedConversation ? (
                <ConversationWindow
                  currentUser={currentUser}
                  conversation={selectedConversation}
                  userPresence={userPresence}
                  onBack={handleBack}
                  onViewInfo={() => setShowInfoPanel(true)}
                  darkMode={darkMode}
                  isMobile={true}
                />
              ) : currentView === 'friends' ? (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b flex items-center gap-3 bg-[#0f1222] border-[#1e2545]">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setCurrentView('chats')}
                      className="text-[#b8c0e0] hover:text-white hover:bg-[#171d36]"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="font-semibold text-white">Friends</h2>
                  </div>
                  <FriendSystem
                    currentUser={currentUser}
                    onStartChat={handleStartChat}
                    darkMode={darkMode}
                  />
                </div>
              ) : (
                <ChatSidebar
                  currentUser={currentUser}
                  selectedConversation={selectedConversation}
                  onSelectConversation={handleSelectConversation}
                  onNewChat={() => setShowNewChatDialog(true)}
                  onNewGroup={() => setShowNewGroupDialog(true)}
                  onOpenFriends={() => setCurrentView('friends')}
                  userPresence={userPresence}
                  darkMode={darkMode}
                />
              )}
            </TabsContent>

            <TabsContent value="discussions" className="flex-1 m-0 mt-2">
              <DiscussionFeed
                currentUser={currentUser}
                darkMode={darkMode}
              />
            </TabsContent>
          </Tabs>
        </div>

        {renderNewChatDialog()}
        <CreateGroupDialog
          open={showNewGroupDialog}
          onOpenChange={setShowNewGroupDialog}
          currentUser={currentUser}
          onGroupCreated={handleGroupCreated}
        />
        {selectedConversation && (
          <GroupInfoPanel
            open={showInfoPanel}
            onOpenChange={setShowInfoPanel}
            conversation={selectedConversation}
            currentUserId={user.id}
            onLeaveGroup={handleLeaveGroup}
            onAddMember={() => {}}
          />
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-[#030712]">
      <Navigation
        user={user}
        currentScreen="chat"
        onNavigate={onNavigate}
        onLogout={onLogout}
        darkMode={darkMode}
      />
      
      <div className="pt-16 h-screen flex flex-col">
        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)} className="flex-1 flex flex-col">
          <div className="border-b px-4 border-slate-800/60 bg-slate-900/60">
            <TabsList className="h-12 bg-transparent">
              <TabsTrigger 
                value="messages" 
                className="flex items-center gap-2 px-6 rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/25 text-slate-400 hover:text-slate-200"
              >
                <MessageCircle className="h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger 
                value="discussions" 
                className="flex items-center gap-2 px-6 rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/25 text-slate-400 hover:text-slate-200"
              >
                <Newspaper className="h-4 w-4" />
                Discussions
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="messages" className="flex-1 m-0">
            <div className="h-full flex">
              {/* Sidebar */}
              <div className="w-80 flex-shrink-0 border-r border-slate-800/60 bg-slate-900/60">
                {currentView === 'friends' ? (
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b flex items-center justify-between bg-slate-900/60 border-slate-800/60">
                      <h2 className="font-semibold flex items-center gap-2 text-white">
                        <div className="p-1.5 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30">
                          <Users className="h-4 w-4 text-indigo-400" />
                        </div>
                        Friends
                      </h2>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setCurrentView('chats')}
                        className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <FriendSystem
                      currentUser={currentUser}
                      onStartChat={(friendId: string) => {
                        handleStartChat(friendId);
                        setCurrentView('chats');
                      }}
                      darkMode={darkMode}
                    />
                  </div>
                ) : (
                  <ChatSidebar
                    currentUser={currentUser}
                    selectedConversation={selectedConversation}
                    onSelectConversation={handleSelectConversation}
                    onNewChat={() => setShowNewChatDialog(true)}
                    onNewGroup={() => setShowNewGroupDialog(true)}
                    onOpenFriends={() => setCurrentView('friends')}
                    userPresence={userPresence}
                    darkMode={darkMode}
                  />
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <ConversationWindow
                    currentUser={currentUser}
                    conversation={selectedConversation}
                    userPresence={userPresence}
                    onBack={() => setSelectedConversation(null)}
                    onViewInfo={() => setShowInfoPanel(true)}
                    darkMode={darkMode}
                    isMobile={false}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-[#030712]">
                    <div className="text-center max-w-md">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center">
                        <MessageCircle className="h-8 w-8 text-indigo-400" />
                      </div>
                      
                      <h2 className="text-2xl font-bold mb-2 text-white">
                        Welcome to FAST Connect
                      </h2>
                      <p className="text-sm mb-8 text-slate-400">
                        Send and receive messages, create groups, and stay connected with your friends and classmates.
                      </p>
                      
                      <div className="flex justify-center gap-3">
                        <Button
                          className="h-10 bg-transparent border border-slate-800/60 text-slate-300 hover:bg-slate-800/50 hover:border-indigo-500/50 rounded-xl"
                          onClick={() => setCurrentView('friends')}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Find Friends
                        </Button>
                        <Button 
                          className="h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg shadow-indigo-500/25"
                          onClick={() => setShowNewGroupDialog(true)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Create Group
                        </Button>
                        <Button 
                          variant="ghost"
                          className="h-10 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl"
                          onClick={() => setShowDebugPanel(!showDebugPanel)}
                        >
                          <Bug className="h-4 w-4 mr-2" />
                          Debug
                        </Button>
                      </div>
                      
                      {showDebugPanel && (
                        <div className="mt-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60">
                          <FirebaseDebug currentUser={currentUser} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="flex-1 m-0">
            <DiscussionFeed
              currentUser={currentUser}
              darkMode={darkMode}
            />
          </TabsContent>
        </Tabs>
      </div>

      {renderNewChatDialog()}
      <CreateGroupDialog
        open={showNewGroupDialog}
        onOpenChange={setShowNewGroupDialog}
        currentUser={currentUser}
        onGroupCreated={handleGroupCreated}
      />
      {selectedConversation && (
        <GroupInfoPanel
          open={showInfoPanel}
          onOpenChange={setShowInfoPanel}
          conversation={selectedConversation}
          currentUserId={user.id}
          onLeaveGroup={handleLeaveGroup}
          onAddMember={() => {}}
        />
      )}
    </div>
  );
}

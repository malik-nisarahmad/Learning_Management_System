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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import {
  Search,
  Users,
  Plus,
  UserPlus,
  Crown,
  LogOut,
  Settings,
  Loader2,
  Check,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  Conversation,
  Friend,
  createGroup,
  updateGroupInfo,
  addGroupMember,
  removeGroupMember,
  promoteToAdmin,
  demoteFromAdmin,
  subscribeToFriends,
} from '@/lib/chatSystem';
import { toast } from 'sonner';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  onGroupCreated: (groupId: string) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  currentUser,
  onGroupCreated,
}: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const unsub = subscribeToFriends(currentUser.id, setFriends);
    return () => unsub();
  }, [currentUser.id]);

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (friendId: string) => {
    setSelectedMembers(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member');
      return;
    }

    setIsCreating(true);

    // Build member details
    const memberDetails: { [key: string]: { name: string; avatar?: string; email?: string } } = {
      [currentUser.id]: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        email: currentUser.email,
      },
    };

    selectedMembers.forEach(memberId => {
      const friend = friends.find(f => (f.odone || f.id) === memberId);
      if (friend) {
        memberDetails[memberId] = {
          name: friend.name,
          avatar: friend.avatar,
          email: friend.email,
        };
      }
    });

    const groupId = await createGroup(
      currentUser,
      groupName.trim(),
      groupDescription.trim(),
      [currentUser.id, ...selectedMembers],
      memberDetails
    );

    setIsCreating(false);

    if (groupId) {
      toast.success('Group created successfully');
      onOpenChange(false);
      setGroupName('');
      setGroupDescription('');
      setSelectedMembers([]);
      onGroupCreated(groupId);
    } else {
      toast.error('Failed to create group');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setGroupName('');
    setGroupDescription('');
    setSelectedMembers([]);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#111629] border-[#1e2545] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-xl bg-gradient-to-r from-[#6c5ce7]/20 to-[#a855f7]/20 border border-[#6c5ce7]/30">
              <Users className="h-4 w-4 text-[#a29bfe]" />
            </div>
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Group Name */}
          <div>
            <label className="text-sm font-medium text-[#b8c0e0] mb-1.5 block">
              Group Name *
            </label>
            <Input
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="h-10 bg-[#0c0f1a] border-[#2a3358] text-white placeholder:text-[#5a6587] rounded-xl focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
            />
          </div>

          {/* Group Description */}
          <div>
            <label className="text-sm font-medium text-[#b8c0e0] mb-1.5 block">
              Description (optional)
            </label>
            <Textarea
              placeholder="What's this group about?"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              rows={2}
              className="bg-[#0c0f1a] border-[#2a3358] text-white placeholder:text-[#5a6587] rounded-xl focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 resize-none"
            />
          </div>

          {/* Members Selection */}
          <div>
            <label className="text-sm font-medium text-[#b8c0e0] mb-1.5 block">
              Add Members *
            </label>

            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedMembers.map(memberId => {
                  const friend = friends.find(f => (f.odone || f.id) === memberId);
                  if (!friend) return null;

                  return (
                    <Badge
                      key={memberId}
                      className="pl-2 pr-1 py-1 bg-gradient-to-r from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe] border border-[#6c5ce7]/30 hover:from-[#6c5ce7]/30 hover:to-[#a855f7]/30 cursor-pointer"
                      onClick={() => toggleMember(memberId)}
                    >
                      {friend.name}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Search Friends */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5a6587]" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-[#0c0f1a] border-[#2a3358] text-white placeholder:text-[#5a6587] rounded-xl focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
              />
            </div>

            {/* Friends List */}
            <ScrollArea className="h-40 rounded-xl border border-[#2a3358] bg-[#0c0f1a]">
              {friends.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-[#8892b3]">No friends to add</p>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-[#8892b3]">No friends match your search</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredFriends.map(friend => {
                    const friendId = friend.odone || friend.id;
                    const isSelected = selectedMembers.includes(friendId);

                    return (
                      <div
                        key={friendId}
                        onClick={() => toggleMember(friendId)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#6c5ce7]/20 to-[#a855f7]/20 border border-[#6c5ce7]/30'
                            : 'hover:bg-[#171d36] border border-transparent'
                        }`}
                      >
                        <Avatar className="h-8 w-8 border border-[#2a3358]">
                          <AvatarImage src={friend.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe] text-xs font-medium">
                            {friend.name?.charAt(0)?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm flex-1 text-white">{friend.name}</span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-[#a29bfe]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="h-10 text-[#b8c0e0] hover:text-white hover:bg-[#171d36] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedMembers.length === 0 || isCreating}
              className="h-10 bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] hover:from-[#5b4cdb] hover:to-[#9645e5] text-white border-0 rounded-xl shadow-lg shadow-purple-500/25"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Create Group
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GroupInfoPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation;
  currentUserId: string;
  onLeaveGroup: () => void;
  onAddMember: () => void;
}

export function GroupInfoPanel({
  open,
  onOpenChange,
  conversation,
  currentUserId,
  onLeaveGroup,
  onAddMember,
}: GroupInfoPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const isAdmin = conversation.admins?.includes(currentUserId) || false;
  const isCreator = conversation.createdBy === currentUserId;

  useEffect(() => {
    if (open) {
      setEditName(conversation.name || '');
      setEditDescription(conversation.description || '');
    }
  }, [open, conversation]);

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      toast.error('Group name cannot be empty');
      return;
    }

    setIsSaving(true);
    const success = await updateGroupInfo(conversation.id, {
      name: editName.trim(),
      description: editDescription.trim(),
    });
    setIsSaving(false);

    if (success) {
      toast.success('Group info updated');
      setIsEditing(false);
    } else {
      toast.error('Failed to update group info');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setLoading(`remove-${memberId}`, true);
    const memberName = conversation.memberDetails[memberId]?.name || 'Member';
    const success = await removeGroupMember(conversation.id, memberId, memberName);
    setLoading(`remove-${memberId}`, false);

    if (success) {
      toast.success(`Removed ${memberName} from group`);
    } else {
      toast.error('Failed to remove member');
    }
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    setLoading(`promote-${memberId}`, true);
    const memberName = conversation.memberDetails[memberId]?.name || 'Member';
    const success = await promoteToAdmin(conversation.id, memberId, memberName);
    setLoading(`promote-${memberId}`, false);

    if (success) {
      toast.success(`${memberName} is now an admin`);
    } else {
      toast.error('Failed to promote member');
    }
  };

  const handleDemoteFromAdmin = async (memberId: string) => {
    setLoading(`demote-${memberId}`, true);
    const memberName = conversation.memberDetails[memberId]?.name || 'Member';
    const success = await demoteFromAdmin(conversation.id, memberId, memberName);
    setLoading(`demote-${memberId}`, false);

    if (success) {
      toast.success(`${memberName} is no longer an admin`);
    } else {
      toast.error('Failed to demote member');
    }
  };

  if (conversation.type !== 'group') {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-80 bg-[#0f1222] border-l border-[#1e2545] p-0">
          <SheetHeader className="p-4 border-b border-[#1e2545]">
            <SheetTitle className="text-white">Contact Info</SheetTitle>
          </SheetHeader>
          
          <div className="p-4">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-20 w-20 border border-[#2a3358] mb-3">
                <AvatarImage src={Object.values(conversation.memberDetails).find(m => m.name !== 'You')?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe] text-2xl font-medium">
                  {Object.values(conversation.memberDetails).find(m => m.name !== 'You')?.name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg text-white">
                {Object.entries(conversation.memberDetails)
                  .find(([id]) => id !== currentUserId)?.[1]?.name || 'Unknown'}
              </h3>
              <p className="text-sm text-[#8892b3]">
                {Object.entries(conversation.memberDetails)
                  .find(([id]) => id !== currentUserId)?.[1]?.email || ''}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-80 bg-[#0f1222] border-l border-[#1e2545] p-0">
        <SheetHeader className="p-4 border-b border-[#1e2545]">
          <SheetTitle className="text-white">Group Info</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="p-4">
            {/* Group Avatar & Name */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 border border-[#6c5ce7]/30 flex items-center justify-center mb-3">
                <Users className="h-10 w-10 text-[#a29bfe]" />
              </div>

              {isEditing ? (
                <div className="w-full space-y-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Group name"
                    className="h-9 bg-[#0c0f1a] border-[#2a3358] text-white placeholder:text-[#5a6587] text-center rounded-xl focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20"
                  />
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className="bg-[#0c0f1a] border-[#2a3358] text-white placeholder:text-[#5a6587] text-center rounded-xl focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 resize-none text-sm"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      className="h-8 text-[#8892b3] hover:text-white hover:bg-[#171d36] rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="h-8 bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] hover:from-[#5b4cdb] hover:to-[#9645e5] text-white border-0 rounded-xl"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-white">{conversation.name}</h3>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditing(true)}
                        className="h-6 w-6 text-[#8892b3] hover:text-white hover:bg-[#171d36] rounded-lg"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {conversation.description && (
                    <p className="text-sm mt-1 text-center text-[#8892b3]">{conversation.description}</p>
                  )}
                </>
              )}
            </div>

            {/* Members */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-[#b8c0e0]">
                  Members ({conversation.members.length})
                </h4>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddMember}
                    className="h-7 text-xs text-[#a29bfe] hover:text-white hover:bg-[#6c5ce7]/20 rounded-lg"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                {conversation.members.map(memberId => {
                  const member = conversation.memberDetails[memberId];
                  const isMemberAdmin = conversation.admins?.includes(memberId);
                  const isMemberCreator = conversation.createdBy === memberId;
                  const isCurrentUser = memberId === currentUserId;

                  return (
                    <div
                      key={memberId}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#171d36] group transition-colors duration-150"
                    >
                      <Avatar className="h-9 w-9 border border-[#2a3358]">
                        <AvatarImage src={member?.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe] text-xs font-medium">
                          {member?.name?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate text-white">
                            {member?.name || 'Unknown'}
                            {isCurrentUser && <span className="text-[#8892b3]"> (You)</span>}
                          </span>
                          {isMemberCreator && (
                            <Crown className="h-3 w-3 flex-shrink-0 text-[#F59E0B]" />
                          )}
                          {isMemberAdmin && !isMemberCreator && (
                            <Badge className="px-1.5 py-0 text-[10px] bg-gradient-to-r from-[#6c5ce7]/20 to-[#a855f7]/20 text-[#a29bfe] border border-[#6c5ce7]/30 hover:from-[#6c5ce7]/20 hover:to-[#a855f7]/20">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Admin Actions */}
                      {isAdmin && !isCurrentUser && !isMemberCreator && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          {isMemberAdmin ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDemoteFromAdmin(memberId)}
                              disabled={loadingStates[`demote-${memberId}`]}
                              className="h-7 w-7 text-[#F59E0B] hover:text-white hover:bg-[#F59E0B]/20 rounded-lg"
                              title="Remove admin"
                            >
                              {loadingStates[`demote-${memberId}`] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Crown className="h-3 w-3" />
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePromoteToAdmin(memberId)}
                              disabled={loadingStates[`promote-${memberId}`]}
                              className="h-7 w-7 text-[#8892b3] hover:text-[#F59E0B] hover:bg-[#F59E0B]/20 rounded-lg"
                              title="Make admin"
                            >
                              {loadingStates[`promote-${memberId}`] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Crown className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(memberId)}
                            disabled={loadingStates[`remove-${memberId}`]}
                            className="h-7 w-7 text-[#8892b3] hover:text-[#EF4444] hover:bg-[#EF4444]/20 rounded-lg"
                            title="Remove member"
                          >
                            {loadingStates[`remove-${memberId}`] ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leave Group */}
            <div className="pt-4 border-t border-[#1e2545]">
              <Button
                variant="ghost"
                onClick={onLeaveGroup}
                className="w-full h-10 text-[#EF4444] hover:text-white hover:bg-[#EF4444]/20 justify-start rounded-xl"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Group
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

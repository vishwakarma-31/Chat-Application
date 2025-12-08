import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GroupService } from '../../services/groupService';
import { UserProfileService } from '../../services/userProfileService';
import { User, Conversation } from '../../types/chat';

/**
 * GroupManagementPage component for managing group chat settings
 * Allows users to create groups, add/remove members, and manage group settings
 */
const GroupManagementPage: React.FC = () => {
  const { groupId } = useParams<{ groupId?: string }>();
  const navigate = useNavigate();
  
  // State for group creation
  const [groupName, setGroupName] = useState('');
  const [groupAvatarUrl, setGroupAvatarUrl] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  
  // State for existing group management
  const [group, setGroup] = useState<Conversation | null>(null);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [newMemberId, setNewMemberId] = useState('');
  
  // General state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Load current user profile
   */
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await UserProfileService.getProfile();
        setCurrentUser(userData);
        // Add current user to selected users by default for group creation
        if (!groupId) {
          setSelectedUsers([userData.id]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load user profile');
      }
    };
    
    loadUserProfile();
  }, [groupId]);

  /**
   * Load group details if editing an existing group
   */
  useEffect(() => {
    const loadGroupDetails = async () => {
      if (!groupId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const groupData = await GroupService.getGroup(groupId);
        setGroup(groupData);
        
        // For simplicity, we're not fetching full user details here
        // In a real app, you'd fetch user details for each participant
        const members: User[] = groupData.participants.map(user => ({
          ...user,
          username: user.username || `User ${user.id}`,
          displayName: user.displayName || `User ${user.id}`,
          status: user.status || 'online'
        }));
        
        setGroupMembers(members);
      } catch (err: any) {
        setError(err.message || 'Failed to load group details');
      } finally {
        setLoading(false);
      }
    };
    
    loadGroupDetails();
  }, [groupId]);

  /**
   * Handle form submission for group creation
   */
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
    
    if (selectedUsers.length === 0) {
      setError('At least one member is required');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      
      const newGroup = await GroupService.createGroup(
        groupName, 
        selectedUsers, 
        groupAvatarUrl || undefined
      );
      
      setSuccess('Group created successfully');
      
      // Navigate to the new group chat
      setTimeout(() => {
        navigate(`/chat/${newGroup.id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle adding a member to an existing group
   */
  const handleAddMember = async () => {
    if (!groupId || !newMemberId) {
      setError('Please enter a user ID');
      return;
    }
    
    const userId = parseInt(newMemberId, 10);
    if (isNaN(userId)) {
      setError('Please enter a valid user ID');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      
      await GroupService.addUserToGroup(groupId, userId);
      
      setSuccess('Member added successfully');
      setNewMemberId('');
      
      // Refresh group details
      const updatedGroup = await GroupService.getGroup(groupId);
      setGroup(updatedGroup);
      
      // Update members list
      const members: User[] = updatedGroup.participants.map(user => ({
        ...user,
        username: user.username || `User ${user.id}`,
        displayName: user.displayName || `User ${user.id}`,
        status: user.status || 'online'
      }));
      
      setGroupMembers(members);
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    }
  };

  /**
   * Handle removing a member from an existing group
   */
  const handleRemoveMember = async (userId: number) => {
    if (!groupId || !currentUser) {
      return;
    }
    
    // Prevent removing oneself unless it's the last member
    if (userId === currentUser.id && groupMembers.length > 1) {
      setError('You cannot remove yourself from the group');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      
      await GroupService.removeUserFromGroup(groupId, userId);
      
      setSuccess('Member removed successfully');
      
      // Refresh group details
      const updatedGroup = await GroupService.getGroup(groupId);
      setGroup(updatedGroup);
      
      // Update members list
      const members: User[] = updatedGroup.participants.map(user => ({
        ...user,
        username: user.username || `User ${user.id}`,
        displayName: user.displayName || `User ${user.id}`,
        status: user.status || 'online'
      }));
      
      setGroupMembers(members);
    } catch (err: any) {
      setError(err.message || 'Failed to remove member');
    }
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  if (loading && groupId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading group details...</div>
      </div>
    );
  }

  if (error && error.includes('404')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
          <div className="text-red-500 text-center mb-4">Group not found</div>
          <button
            onClick={() => navigate('/chat')}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {groupId ? 'Manage Group' : 'Create New Group'}
              </h1>
              <button
                onClick={handleLogout}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {groupId ? (
              // Group Management View
              group && (
                <div>
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{group.name}</h2>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">Group Members</h3>
                      <div className="space-y-3">
                        {groupMembers.map(member => (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-medium">
                                  {member.displayName?.charAt(0) || member.username.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{member.displayName || member.username}</div>
                                <div className="text-sm text-gray-500">User ID: {member.id}</div>
                              </div>
                            </div>
                            {currentUser && member.id !== currentUser.id && (
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium mb-3">Add Member</h3>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMemberId}
                          onChange={(e) => setNewMemberId(e.target.value)}
                          placeholder="Enter user ID"
                          className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          onClick={handleAddMember}
                          className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate(-1)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )
            ) : (
              // Group Creation View
              <form onSubmit={handleCreateGroup}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">
                      Group Name
                    </label>
                    <input
                      type="text"
                      id="groupName"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter group name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="groupAvatarUrl" className="block text-sm font-medium text-gray-700">
                      Group Avatar URL (Optional)
                    </label>
                    <input
                      type="url"
                      id="groupAvatarUrl"
                      value={groupAvatarUrl}
                      onChange={(e) => setGroupAvatarUrl(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Members
                    </label>
                    <div className="text-sm text-gray-500 mb-2">
                      You will be automatically added to the group. Enter additional member IDs below.
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={selectedUsers.filter(id => currentUser && id !== currentUser.id).join(', ')}
                        readOnly
                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100"
                        placeholder="Selected member IDs will appear here"
                      />
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Note: In a real application, you would have a user search feature here.
                      For now, enter user IDs separated by commas.
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate('/chat')}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Group'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupManagementPage;
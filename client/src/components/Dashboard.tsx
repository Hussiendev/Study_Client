import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  LogOut, 
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../service/api';
import { User } from '../types/auth.types';
import AddUserForm from './forms/AddUserForm';
import UpdateUserForm from './forms/UpdateUserForm';

// Extended User interface for dashboard display
interface DashboardUser extends User {
  status?: string;
  lastActive?: string;
  avatar?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: string, email: string, name: string} | null>(null);
  const [userToUpdate, setUserToUpdate] = useState<{id: string, name: string, email: string, role: string} | null>(null);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Check if user is authenticated and is admin
  useEffect(() => {
    console.log('Auth check - isAuthenticated:', isAuthenticated, 'user:', user);
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (user?.role?.toLowerCase() !== 'admin') {
      navigate('/unauthorized', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch users from database
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching users with cookie auth...');
      
      const response = await api.get('/users/');
      console.log('API Response:', response.data);
      
      // Transform the data to match DashboardUser interface
      if (response.data && response.data.users) {
        const transformedUsers: DashboardUser[] = response.data.users.map((dbUser: any) => {
          console.log('Raw user data from DB:', dbUser);
          
          // Get the ID - check different possible field names
          const userId = dbUser._id || dbUser.id || dbUser.userId;
          console.log('Extracted user ID:', userId);
          
          return {
            id: userId,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role === 'admin' ? 'Admin' : 
                  dbUser.role === 'user' ? 'User' : 
                  dbUser.role || 'User',
            status: 'Active',
            lastActive: new Date().toLocaleDateString(),
            avatar: dbUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
            createdAt: dbUser.createdAt ? new Date(dbUser.createdAt) : undefined
          };
        });
        console.log('Transformed users:', transformedUsers);
        setUsers(transformedUsers);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      console.log('Logging out via AuthContext...');
      await logout();
      console.log('Logout successful');
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  const handleDeleteClick = (userId: string, userEmail: string, userName: string) => {
    console.log('Delete clicked - received values:', { 
      userId, 
      userEmail, 
      userName,
      userIdType: typeof userId,
      userIdLength: userId?.length,
      userIdValue: userId
    });
    
    // Check if this is the main admin
    if (userEmail === 'hussienzoughaib@gmail.com') {
      console.log('Cannot delete main admin');
      alert('Cannot delete the main admin user');
      return;
    }
    
    if (!userId) {
      console.error('User ID is missing or undefined!');
      alert('Error: User ID is missing');
      return;
    }
    
    // Store user data
    const userData = { id: userId, email: userEmail, name: userName };
    console.log('Setting userToDelete state:', userData);
    setUserToDelete(userData);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    console.log('Delete confirm clicked');
    console.log('Current userToDelete state:', userToDelete);
    
    if (!userToDelete) {
      console.log('No user to delete - userToDelete is null');
      alert('No user selected for deletion');
      return;
    }

    console.log('userToDelete object:', userToDelete);
    console.log('userToDelete.id value:', userToDelete.id);
    console.log('userToDelete.id type:', typeof userToDelete.id);
    
    const idToDelete = userToDelete.id;
    
    if (!idToDelete || idToDelete === 'undefined' || idToDelete === 'null') {
      console.log('Invalid ID found:', idToDelete);
      alert('Invalid user ID: ' + (idToDelete || 'empty'));
      return;
    }
    
    try {
      setDeleteLoading(true);
      console.log('Making delete request to:', `/users/${idToDelete}`);
      
      const response = await api.delete(`/users/${idToDelete}`, {
        withCredentials: true
      });
      
      console.log('Delete response:', response.data);
      
      // Remove from local state after successful deletion
      setUsers(users.filter(u => u.id !== idToDelete));
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      console.log('User deleted successfully');
      
    } catch (err: any) {
      console.error('Error deleting user:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to delete user';
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    console.log('Delete cancelled');
    setShowDeleteModal(false);
    setTimeout(() => setUserToDelete(null), 300);
  };

  const handleAddUser = () => {
    console.log('Add user clicked');
    setShowAddUserModal(true);
  };

  const handleEditClick = (userId: string, userName: string, userEmail: string, userRole: string) => {
    console.log('Edit clicked for user:', { userId, userName, userEmail, userRole });
    
    setUserToUpdate({
      id: userId,
      name: userName,
      email: userEmail,
      role: userRole
    });
    setShowUpdateModal(true);
  };

  const handleUpdateUser = async (userId: string, updatedData: { name?: string; email?: string; role?: string; password?: string }) => {
    try {
      console.log('Preparing update request for user:', userId);
      console.log('Update data:', updatedData);
      
      // Format the data with ALL fields the backend expects
      const userDataToSend = {
        name: updatedData.name,
        email: updatedData.email,
        role: updatedData.role?.toLowerCase() || 'user', // Always include role
        ...(updatedData.password && updatedData.password.trim() !== '' ? { password: updatedData.password } : {})
      };
      
      console.log('Sending to AuthContext:', userDataToSend);
      
      // Call the update function from AuthContext
      await updateUser(userId, userDataToSend);
      
      // Refresh the users list
      await fetchUsers();
      
      console.log('User updated successfully');
      
    } catch (error: any) {
      console.error('Error in handleUpdateUser:', error);
      throw error;
    }
  };

  const handleUserAdded = () => {
    console.log('User added, refreshing list');
    fetchUsers();
  };

  const handleUserUpdated = () => {
    console.log('User updated, refreshing list');
    fetchUsers();
    setShowUpdateModal(false);
    setUserToUpdate(null);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen w-full bg-gray-50 items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Users</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={{ width: sidebarOpen ? 280 : 80 }}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-2xl h-full relative overflow-hidden"
        style={{ boxShadow: '4px 0 20px rgba(0,0,0,0.08)' }}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">
                  Admin Panel
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && user && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Menu */}
        <div className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  selectedUser === null 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => setSelectedUser(null)}
              >
                <Users size={20} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      All Users ({users.length})
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
            <li>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-all"
                onClick={handleAddUser}
              >
                <UserPlus size={20} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Add User
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
            <li className="pt-4 mt-4 border-t border-gray-100">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                onClick={handleLogout}
              >
                <LogOut size={20} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Logout
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">
                User Management
              </h1>
              <p className="text-gray-500 mt-1">
                Manage your users and their permissions • {users.length} total users
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
          </div>

          {/* Add User Button (Mobile/Tablet) */}
          <div className="md:hidden mb-4">
            <button
              onClick={handleAddUser}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-cyan-600 transition-all"
            >
              <Plus size={20} />
              Add New User
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Last Active</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {user.id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-semibold">
                            {user.avatar || user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'Editor' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.lastActive || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(user.id, user.name, user.email, user.role)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user.id, user.email, user.name)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No users found</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search' : 'Add a new user to get started'}
                </p>
              </div>
            )}

            {/* Table Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Showing {filteredUsers.length} of {users.length} users</span>
                <button
                  onClick={handleAddUser}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all text-sm"
                >
                  <Plus size={16} />
                  Add New User
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && userToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleDeleteCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Delete User</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold">{userToDelete.name}</span> ({userToDelete.email})? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AddUserForm 
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserAdded={handleUserAdded}
      />

      {/* Update User Modal */}
      <UpdateUserForm
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setUserToUpdate(null);
        }}
        onUserUpdated={handleUserUpdated}
        userData={userToUpdate}
        onUpdate={handleUpdateUser}
      />
    </div>
  );
};

export default Dashboard;
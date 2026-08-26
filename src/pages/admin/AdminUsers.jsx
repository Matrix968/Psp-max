import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Mail, 
  Calendar, 
  Crown, 
  User,
  Loader,
  Search,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContexts';
import { db } from '../../firebase/config';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';

const AdminUsers = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const usersData = [];
        querySnapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() });
        });
        setUsers(usersData);
        setError('');
      } catch (err) {
        console.error("Error fetching users:", err);
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  // Toggle admin role
  const toggleAdmin = async (userId, currentRole) => {
    if (!confirm(`Toggle admin role for this user?`)) return;
    setUpdating(userId);
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (err) {
      console.error("Error updating role:", err);
      alert('Failed to update role.');
    }
    setUpdating(null);
  };

  // Filter users by search
  const filteredUsers = users.filter(u => {
    const searchLower = search.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower) ||
      u.uid?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center px-6">
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-lg text-center">
          <p className="font-semibold">⚠️ {error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" /> Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" /> Users
            </h1>
            <p className="text-gray-400 mt-1">{users.length} total users</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#131b2e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-[#131b2e] rounded-2xl border border-white/10">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-lg">No users found</p>
          </div>
        ) : (
          <div className="bg-[#131b2e] rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0f1e] border-b border-white/5">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">User</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Email</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Role</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Premium</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Joined</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid || user.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-white font-medium">{user.displayName || 'User'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{user.email || 'No email'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-300' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isPremium ? (
                          <span className="text-xs text-amber-400 flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Premium
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Free</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleAdmin(user.uid || user.id, user.role)}
                          disabled={updating === (user.uid || user.id)}
                          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition ${
                            user.role === 'admin'
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                              : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                          }`}
                        >
                          {updating === (user.uid || user.id) ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <Shield className="w-3 h-3" />
                          )}
                          {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
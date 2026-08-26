import React from 'react';
import { useAuth } from '../contexts/AuthContexts';
import { User, Mail, Crown, Calendar } from 'lucide-react';

const Profile = () => {
  const { user, userRole, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-8">Your Profile</h1>

        <div className="bg-[#131b2e] rounded-2xl border border-white/10 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.displayName || 'User'}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 bg-[#0a0f1e] rounded-xl">
              <span className="text-gray-300">Role</span>
              <span className={`font-semibold ${isAdmin ? 'text-blue-400' : 'text-gray-400'}`}>
                {isAdmin ? 'Administrator' : 'User'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0a0f1e] rounded-xl">
              <span className="text-gray-300">Premium Status</span>
              <span className="font-semibold text-yellow-400">Not Subscribed</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0a0f1e] rounded-xl">
              <span className="text-gray-300">Member Since</span>
              <span className="text-gray-400">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {!isAdmin && (
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-purple-400">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">Go Premium</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Unlock all lessons and premium content</p>
              <button className="mt-3 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition">
                Subscribe Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { updatePassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { userData } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password should be at least 6 characters.');
      return;
    }

    if (!auth.currentUser) {
      toast.error('You must be logged in.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      toast.success('Password updated successfully! You can now log in using your email and this new password.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please re-login to update your password.');
      } else {
        toast.error(error.message || 'Error updating password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col space-y-6">
      <div className="flex items-end justify-between mb-2">
        <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-800">Settings</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profile Configuration</p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Change Password</h3>
        <p className="text-slate-500 font-semibold mb-8">
          If you signed up with Google, setting a password here will allow you to optionally log in using your email ({userData?.email}) and this password next time.
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-2xl py-5 font-black text-sm uppercase tracking-widest hover:bg-indigo-700 hover:scale-[1.02] transition-all focus:ring-4 focus:ring-indigo-500/30 mt-4 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Updating...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

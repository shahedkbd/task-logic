import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast.success('Role updated successfully');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  // Warning: deleting a user doc won't delete their Firebase Auth account unless we use Admin SDK on the backend.
  // For the scope of this project, deleting user doc is standard.
  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast.success('User removed');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to remove user');
    }
  };

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-800">Directory</h2>
        <p className="text-xs font-bold text-slate-400">Manage Users</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Photo</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Name</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Email</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Role</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Coin</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-6">
                    <img src={user.photoURL || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  </td>
                  <td className="px-4 py-6 font-bold text-slate-800">{user.displayName}</td>
                  <td className="px-4 py-6 font-semibold text-slate-600">{user.email}</td>
                  <td className="px-4 py-6">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border border-slate-200 rounded-lg p-2 text-sm font-bold bg-slate-50 text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 uppercase tracking-wide"
                    >
                      <option value="Worker">Worker</option>
                      <option value="Buyer">Buyer</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-6 font-black text-emerald-500 text-lg">{user.coin}</td>
                  <td className="px-4 py-6 text-right">
                    <button onClick={() => handleRemove(user.id)} className="text-red-500 hover:text-red-700 font-black text-xs uppercase tracking-widest bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

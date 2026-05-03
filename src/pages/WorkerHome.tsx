import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function WorkerHome() {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ totalSubmissions: 0, pending: 0, earnings: 0 });
  const [approvedSubmissions, setApprovedSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData) return;
      try {
        const q = query(collection(db, 'submissions'), where('worker_email', '==', userData.email));
        const snap = await getDocs(q);
        let total = 0;
        let pending = 0;
        let earnings = 0;
        const approved: any[] = [];
        
        snap.forEach(doc => {
          total++;
          const data = doc.data();
          if (data.status === 'pending') pending++;
          if (data.status === 'approved') {
            earnings += data.payable_amount;
            approved.push({ id: doc.id, ...data });
          }
        });
        
        setStats({ totalSubmissions: total, pending, earnings });
        setApprovedSubmissions(approved);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [userData]);

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-800">Overview</h2>
        <p className="text-xs font-bold text-slate-400">Worker Dashboard</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col">
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">Total Submissions</p>
          <p className="text-5xl lg:text-6xl font-black">{stats.totalSubmissions}</p>
        </div>
        <div className="bg-orange-50 rounded-[2.5rem] p-8 border border-orange-100 flex flex-col text-orange-900">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400 mb-2">Pending Review</p>
          <p className="text-5xl lg:text-6xl font-black text-orange-500">{stats.pending}</p>
        </div>
        <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 flex flex-col text-emerald-900">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Total Earnings</p>
          <p className="text-5xl lg:text-6xl font-black text-emerald-500">{stats.earnings} <span className="text-lg">COINS</span></p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 mt-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Approved Submissions</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Task Title</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Buyer</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {approvedSubmissions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-6 font-bold text-slate-800">{sub.task_title}</td>
                  <td className="px-4 py-6 font-black text-emerald-500 text-lg">+{sub.payable_amount}</td>
                  <td className="px-4 py-6 font-semibold text-slate-600">{sub.buyer_name}</td>
                  <td className="px-4 py-6"><span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black uppercase tracking-wider">Approved</span></td>
                </tr>
              ))}
              {approvedSubmissions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-slate-100 rounded-xl mt-4 block">No approved submissions yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

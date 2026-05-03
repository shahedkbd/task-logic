import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function MySubmissions() {
  const { userData } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchSubs = async () => {
      if (!userData) return;
      try {
        const q = query(
          collection(db, 'submissions'), 
          where('worker_email', '==', userData.email)
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetched.sort((a, b) => b.createdAt - a.createdAt);
        setSubmissions(fetched);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubs();
  }, [userData]);

  const totalPages = Math.ceil(submissions.length / itemsPerPage);
  const paginatedSubs = submissions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-800">My Work</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submissions</p>
      </div>
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Task Title</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Buyer</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Reward</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedSubs.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-6 font-bold text-slate-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-6 font-bold text-slate-800">{sub.task_title}</td>
                  <td className="px-4 py-6 font-semibold text-slate-600">{sub.buyer_name}</td>
                  <td className="px-4 py-6 font-black text-emerald-500 text-lg">{sub.payable_amount}</td>
                  <td className="px-4 py-6">
                    <span className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      sub.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      sub.status === 'rejected' ? 'bg-red-50 text-red-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-slate-100 rounded-xl mt-4 block w-full">No submissions yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-8 mt-4 border-t-2 border-slate-50 flex items-center justify-between">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-slate-200 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-slate-200 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

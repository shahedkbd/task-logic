import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function BuyerHome() {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ totalTasks: 0, pendingTasks: 0, totalPayment: 0 });
  const [submissions, setSubmissions] = useState<any[]>([]);

  const fetchData = async () => {
    if (!userData) return;
    try {
      // Fetch tasks to calculate stats
      const tasksQ = query(collection(db, 'tasks'), where('buyer_email', '==', userData.email));
      const tasksSnap = await getDocs(tasksQ);
      let totalTasks = tasksSnap.size;
      let pendingTasks = 0;
      let totalPayment = 0;
      tasksSnap.forEach(t => {
        const d = t.data();
        pendingTasks += d.required_workers;
        // The prompt says "total payment paid by the user" can be just total sum of task costs or actually paid submissions.
        totalPayment += d.required_workers * d.payable_amount;
      });
      setStats({ totalTasks, pendingTasks, totalPayment });

      // Fetch pending submissions
      const subQ = query(collection(db, 'submissions'), where('buyer_email', '==', userData.email), where('status', '==', 'pending'));
      const subSnap = await getDocs(subQ);
      setSubmissions(subSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

  const handleApprove = async (sub: any) => {
    // Increase worker coin, update submission to approved
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'submissions', sub.id), { status: 'approved' });
      
      // Need worker uid. We don't have worker uid on submission, just email. 
      // Let's find worker uid by email.
      const wQ = query(collection(db, 'users'), where('email', '==', sub.worker_email));
      const wSnap = await getDocs(wQ);
      if (!wSnap.empty) {
        const workerDoc = wSnap.docs[0];
        batch.update(doc(db, 'users', workerDoc.id), { coin: increment(sub.payable_amount) });
        
        // Notify worker
        const notifRef = doc(collection(db, 'notifications'));
        batch.set(notifRef, {
          message: `you have earned ${sub.payable_amount} from ${sub.buyer_name} for completing ${sub.task_title}`,
          toEmail: sub.worker_email,
          actionRoute: '/dashboard/worker-home',
          createdAt: Date.now()
        });
      }

      await batch.commit();
      toast.success('Approved successfully');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (sub: any) => {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'submissions', sub.id), { status: 'rejected' });
      batch.update(doc(db, 'tasks', sub.task_id), { required_workers: increment(1) });
      
      // Notify worker
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        message: `${sub.buyer_name} rejected your submission for ${sub.task_title}`,
        toEmail: sub.worker_email,
        actionRoute: '/dashboard/worker-home',
        createdAt: Date.now()
      });

      await batch.commit();
      toast.success('Rejected successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to reject');
    }
  };

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-800">Overview</h2>
        <p className="text-xs font-bold text-slate-400">Buyer Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col">
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">Total Tasks Added</p>
          <p className="text-5xl lg:text-6xl font-black">{stats.totalTasks}</p>
        </div>
        <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 flex flex-col text-emerald-900">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Pending Workers Needed</p>
          <p className="text-5xl lg:text-6xl font-black text-emerald-600">{stats.pendingTasks}</p>
        </div>
        <div className="bg-purple-50 rounded-[2.5rem] p-8 border border-purple-100 flex flex-col text-purple-900">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-2">Total Payment Reserved</p>
          <p className="text-5xl lg:text-6xl font-black text-purple-500">{stats.totalPayment} <span className="text-lg uppercase">Coins</span></p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 mt-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Tasks To Review</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Worker</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Task Title</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-6 font-bold text-slate-800">{sub.worker_name}</td>
                  <td className="px-4 py-6 font-semibold text-slate-600">{sub.task_title}</td>
                  <td className="px-4 py-6 font-black text-slate-900 text-lg">{sub.payable_amount} <span className="text-xs text-slate-400 uppercase">Coins</span></td>
                  <td className="px-4 py-6 space-x-2">
                    <button onClick={() => alert(`Submission Details:\n${sub.submission_details}`)} className="text-indigo-600 hover:text-indigo-800 font-black text-xs uppercase tracking-widest bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors">View</button>
                    <button onClick={() => handleApprove(sub)} className="text-emerald-600 hover:text-emerald-800 font-black text-xs uppercase tracking-widest bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors">Approve</button>
                    <button onClick={() => handleReject(sub)} className="text-red-600 hover:text-red-800 font-black text-xs uppercase tracking-widest bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors">Reject</button>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-slate-100 rounded-xl mt-4 block">No submissions pending review</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, writeBatch, increment, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AdminHome() {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ workers: 0, buyers: 0, totalCoin: 0, totalPayments: 0 });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [seeding, setSeeding] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch users
      const usersSnap = await getDocs(collection(db, 'users'));
      let workers = 0;
      let buyers = 0;
      let totalCoin = 0;
      usersSnap.forEach(doc => {
        const d = doc.data();
        if (d.role === 'Worker') workers++;
        if (d.role === 'Buyer') buyers++;
        if (d.coin) totalCoin += d.coin;
      });

      // Fetch payments
      const paysSnap = await getDocs(collection(db, 'payments'));
      let totalPayments = 0;
      paysSnap.forEach(doc => {
        totalPayments += doc.data().amount || 0;
      });

      setStats({ workers, buyers, totalCoin, totalPayments });

      // Fetch pending withdrawals
      const wdQ = query(collection(db, 'withdrawals'), where('status', '==', 'pending'));
      const wdSnap = await getDocs(wdQ);
      setWithdrawals(wdSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err: any) {
      console.error(err);
      toast.error('AdminHome Data Load Error: ' + err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (wd: any) => {
    try {
      const batch = writeBatch(db);
      
      // Update withdrawal status
      batch.update(doc(db, 'withdrawals', wd.id), { status: 'approved' });

      // Decrease worker coin
      const wQ = query(collection(db, 'users'), where('email', '==', wd.worker_email));
      const wSnap = await getDocs(wQ);
      if (!wSnap.empty) {
        batch.update(doc(db, 'users', wSnap.docs[0].id), { coin: increment(-wd.withdrawal_coin) });
      }

      // Notify Worker
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        message: `Your withdrawal request for $${wd.withdrawal_amount} has been approved`,
        toEmail: wd.worker_email,
        actionRoute: '/dashboard/withdrawals',
        createdAt: Date.now()
      });

      await batch.commit();
      toast.success('Payment approved successfully');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to approve payment: ' + err.message);
    }
  };

  const seedDemoTasks = async () => {
    if (!userData) return;
    setSeeding(true);
    try {
      const demoTasks = [
        {
          task_title: "Watch 5-min YouTube Video & Like",
          task_detail: "Please watch the attached YouTube video in full completely, drop a comment, and like the video. You MUST submit a screenshot showing the play bar at the end and your liked status.",
          required_workers: 100,
          payable_amount: 10,
          completion_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          submission_info: "Include a link to the screenshot.",
          task_image_url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80",
          buyer_email: userData.email,
          buyer_name: "Demo Buyer 1",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          task_title: "Follow Instagram Page",
          task_detail: "Go to @tech_innovators_global on instagram and follow. Do not unfollow within 30 days.",
          required_workers: 50,
          payable_amount: 5,
          completion_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          submission_info: "Screenshot of following status.",
          task_image_url: "https://images.unsplash.com/photo-1611262588024-d12430b98920?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80",
          buyer_email: userData.email,
          buyer_name: "Demo Buyer 2",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          task_title: "Test My New App & Review",
          task_detail: "Download my new habit tracking app from the App Store (link will be provided upon assignment), use it for 2 days, and write a 50+ word honest review. Must include a screenshot of your review.",
          required_workers: 20,
          payable_amount: 50,
          completion_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          submission_info: "Screenshot of your posted review.",
          task_image_url: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80",
          buyer_email: userData.email,
          buyer_name: "Demo Buyer 3",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
      ];

      const batch = writeBatch(db);
      for (const t of demoTasks) {
        batch.set(doc(collection(db, 'tasks')), t);
      }
      await batch.commit();
      toast.success("Demo tasks added successfully!");
    } catch (err: any) {
      toast.error('Failed to seed tasks: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-800">Overview</h2>
          <p className="text-xs font-bold text-slate-400 mt-2">Admin Dashboard</p>
        </div>
        <button
          onClick={seedDemoTasks}
          disabled={seeding}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200"
        >
          {seeding ? 'Adding...' : 'Generate Demo Tasks'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col">
          <div className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-4 whitespace-nowrap">Total Workers</div>
          <div className="text-5xl font-black text-indigo-400 mt-auto">{stats.workers}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 whitespace-nowrap">Total Buyers</div>
          <div className="text-5xl font-black text-slate-800 mt-auto">{stats.buyers}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Total Coins</div>
          <div className="text-5xl font-black text-slate-800 mt-auto">{stats.totalCoin}</div>
        </div>
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col">
          <div className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-4">Total Payments</div>
          <div className="text-5xl font-black mt-auto">${stats.totalPayments}</div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 mt-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Pending Withdrawal Requests</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Worker Name</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">System</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Account</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Coins</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {withdrawals.map(wd => (
                <tr key={wd.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-6 font-bold text-slate-800">{wd.worker_name}</td>
                  <td className="px-4 py-6 font-semibold text-slate-600">{wd.payment_system}</td>
                  <td className="px-4 py-6 font-semibold text-slate-600">{wd.account_number}</td>
                  <td className="px-4 py-6 text-slate-900 font-black text-lg">{wd.withdrawal_coin}</td>
                  <td className="px-4 py-6 text-emerald-500 font-black text-lg">${wd.withdrawal_amount}</td>
                  <td className="px-4 py-6">
                    <button onClick={() => handleApprove(wd)} className="text-indigo-600 hover:text-indigo-800 font-black text-xs uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors border-2 border-transparent hover:border-indigo-200">
                      Payment Success
                    </button>
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-slate-100 rounded-xl mt-4 block w-full">No pending withdrawal requests</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

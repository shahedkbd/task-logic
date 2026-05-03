import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function PaymentHistory() {
  const { userData } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userData) return;
      try {
        const q = query(
          collection(db, 'payments'), 
          where('buyer_email', '==', userData.email)
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetched.sort((a, b) => b.createdAt - a.createdAt);
        setPayments(fetched);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [userData]);

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-800">Payments</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">History</p>
      </div>
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Amount Paid</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Coins Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-6 font-bold text-slate-500">{new Date(payment.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-6 font-black text-slate-800 text-lg">${payment.amount}</td>
                  <td className="px-4 py-6 font-black text-emerald-500 text-lg">+{payment.coins}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-slate-100 rounded-xl mt-4 block w-full">No payment history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

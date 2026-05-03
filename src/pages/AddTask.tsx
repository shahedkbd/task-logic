import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, writeBatch, increment } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AddTask() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const requiredWorkers = Number(data.required_workers);
      const payableAmount = Number(data.payable_amount);
      const totalCost = requiredWorkers * payableAmount;
      const isAdmin = userData?.role === 'Admin';

      if (!isAdmin && (!userData || userData.coin < totalCost)) {
        toast.error('Not available Coin. Purchase Coin');
        navigate('/dashboard/purchase-coin');
        return;
      }

      // Add task and reduce buyer coin
      const batch = writeBatch(db);
      
      const taskRef = doc(collection(db, 'tasks'));
      batch.set(taskRef, {
        task_title: data.task_title,
        task_detail: data.task_detail,
        required_workers: requiredWorkers,
        payable_amount: payableAmount,
        completion_date: data.completion_date,
        submission_info: data.submission_info,
        task_image_url: data.task_image_url,
        buyer_name: userData?.displayName || 'Admin',
        buyer_email: userData?.email || '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      if (!isAdmin && userData?.uid) {
        const userRef = doc(db, 'users', userData.uid);
        batch.update(userRef, { coin: increment(-totalCost) });
      }

      await batch.commit();
      toast.success('Task Added successfully!');
      navigate('/dashboard/my-tasks');
    } catch (err: any) {
      toast.error('Failed to add task: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-6">
      <div className="flex items-end justify-between mb-2">
        <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-800">New Task</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Creation</p>
      </div>
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Task Title</label>
              <input {...register('task_title', { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all" placeholder="e.g. Watch my YouTube video" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Task Detail</label>
              <textarea {...register('task_detail', { required: true })} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all resize-none" placeholder="Detail description" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Workers limit</label>
              <input type="number" {...register('required_workers', { required: true, min: 1 })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-black focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-xl" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Reward/Worker (Coins)</label>
              <input type="number" {...register('payable_amount', { required: true, min: 1 })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-emerald-500 font-black focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-xl" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Deadline</label>
              <input type="date" {...register('completion_date', { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Instructions</label>
              <input type="text" {...register('submission_info', { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all" placeholder="What to submit (e.g. screenshot)" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Image URL (Optional)</label>
              <input type="url" {...register('task_image_url')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all" placeholder="Secure image link to attract workers" />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white rounded-2xl py-5 font-black text-sm uppercase tracking-widest hover:bg-indigo-700 hover:scale-[1.02] transition-all focus:ring-4 focus:ring-indigo-500/30 mt-8">
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
}

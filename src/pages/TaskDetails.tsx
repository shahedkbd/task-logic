import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, writeBatch, increment } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function TaskDetails() {
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const { userData } = useAuth();
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        if (!id) return;
        const snap = await getDoc(doc(db, 'tasks', id));
        if (snap.exists()) {
          setTask({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTask();
  }, [id]);

  const onSubmit = async (data: any) => {
    if (!task || !userData) return;
    try {
      const batch = writeBatch(db);
      
      const subRef = doc(collection(db, 'submissions'));
      batch.set(subRef, {
        task_id: task.id,
        task_title: task.task_title,
        payable_amount: task.payable_amount,
        worker_email: userData.email,
        worker_name: userData.displayName,
        buyer_name: task.buyer_name,
        buyer_email: task.buyer_email,
        submission_details: data.submission_details,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Notify Buyer
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        message: `${userData.displayName} submitted proof for ${task.task_title}`,
        toEmail: task.buyer_email,
        actionRoute: '/dashboard/buyer-home',
        createdAt: Date.now()
      });

      // Decrease required_workers implicitly handled by reject or by counting submissions? 
      // The instruction says "Decrease required_workers by 1 when rejected" - Wait, no. "If rejected, increase required_workers by 1". That means on submission, we should *decrease* required_workers by 1.
      const taskRef = doc(db, 'tasks', task.id);
      batch.update(taskRef, { required_workers: increment(-1) });

      await batch.commit();
      toast.success('Submitted successfully!');
      navigate('/dashboard/my-submissions');
    } catch (err: any) {
      toast.error('Failed to submit: ' + err.message);
    }
  };

  if (!task) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 flex flex-col">
      <div className="flex items-end justify-between mb-2">
        <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-800">Task Overview</h2>
        <button onClick={() => navigate(-1)} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Back</button>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center space-x-6 mb-8 border-b-2 border-slate-50 pb-8">
          {task.task_image_url ? (
            <img src={task.task_image_url} alt="Task" className="w-24 h-24 rounded-3xl object-cover shadow-md" />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center text-4xl">⚡</div>
          )}
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-1">{task.task_title}</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">By {task.buyer_name}</p>
          </div>
        </div>
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Description</p>
          <p className="text-slate-600 font-semibold leading-relaxed text-lg">{task.task_detail}</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-3xl mb-10 border border-indigo-100">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Instructions</p>
          <p className="text-indigo-900 font-bold leading-relaxed">{task.submission_info}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Reward</div>
            <div className="font-black text-emerald-500 text-2xl leading-none">{task.payable_amount}</div>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Spaces</div>
            <div className="font-black text-slate-700 text-2xl leading-none">{task.required_workers}</div>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 col-span-2 md:col-span-2">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Deadline</div>
            <div className="font-black text-red-500 text-2xl leading-none">{new Date(task.completion_date).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 mt-8">
        <h3 className="text-3xl font-black tracking-tighter mb-8 text-slate-900">Submit Work</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Proof Details / Link</label>
            <textarea {...register('submission_details', { required: true })} rows={6} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-700 font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all resize-none" placeholder="Enter your proof details exactly as requested..." />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white rounded-2xl py-5 font-black text-sm uppercase tracking-widest hover:bg-indigo-700 hover:scale-[1.02] transition-all focus:ring-4 focus:ring-indigo-500/30">
            Submit Proof
          </button>
        </form>
      </div>
    </div>
  );
}

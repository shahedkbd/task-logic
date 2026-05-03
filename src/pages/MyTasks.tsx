import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, writeBatch, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function MyTasks() {
  const { userData } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchTasks = async () => {
    if (!userData) return;
    try {
      const q = query(collection(db, 'tasks'), where('buyer_email', '==', userData.email));
      const snap = await getDocs(q);
      const fetchedTasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedTasks.sort((a, b) => b.completion_date.localeCompare(a.completion_date));
      setTasks(fetchedTasks);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userData]);

  const handleDelete = async (task: any) => {
    if (!confirm('Are you sure you want to delete this task? Unused coins will be refunded.')) return;
    try {
      const refundAmount = task.required_workers * task.payable_amount;
      const batch = writeBatch(db);
      
      batch.delete(doc(db, 'tasks', task.id));
      if (refundAmount > 0) {
        batch.update(doc(db, 'users', userData!.uid), { coin: increment(refundAmount) });
      }

      await batch.commit();
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (err: any) {
      toast.error('Failed to delete task: ' + err.message);
    }
  };

  const handleUpdate = async (task: any) => {
    const newTitle = prompt('New Task Title:', task.task_title);
    if (!newTitle) return;
    const newDetail = prompt('New Task Detail:', task.task_detail);
    if (!newDetail) return;

    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        task_title: newTitle,
        task_detail: newDetail,
        updatedAt: Date.now()
      });
      toast.success('Task updated successfully');
      fetchTasks();
    } catch (err: any) {
      toast.error('Failed to update task: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-800">My Tasks</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Listings</p>
      </div>
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Task Title</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Workers Needed</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Reward/Worker</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Completion Date</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-6 font-bold text-slate-800">{task.task_title}</td>
                  <td className="px-4 py-6 font-black text-slate-600 text-lg">{task.required_workers}</td>
                  <td className="px-4 py-6 font-black text-emerald-500 text-lg">{task.payable_amount}</td>
                  <td className="px-4 py-6 font-bold text-slate-500">{new Date(task.completion_date).toLocaleDateString()}</td>
                  <td className="px-4 py-6 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handleUpdate(task)} className="text-indigo-600 hover:text-indigo-800 font-black text-xs uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">Update</button>
                    <button onClick={() => handleDelete(task)} className="text-red-500 hover:text-red-700 font-black text-xs uppercase tracking-widest bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors ml-2">Delete</button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-slate-100 rounded-xl mt-4 block w-full">You haven't created any tasks yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

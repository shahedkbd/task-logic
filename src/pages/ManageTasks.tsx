import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function ManageTasks() {
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchTasks = async () => {
    try {
      const snap = await getDocs(collection(db, 'tasks'));
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-800">Directory</h2>
        <p className="text-xs font-bold text-slate-400">Manage Tasks</p>
      </div>
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Task Title</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Buyer</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Workers Needed</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-6 font-bold text-slate-800">{task.task_title}</td>
                  <td className="px-4 py-6 font-semibold text-slate-600">{task.buyer_email}</td>
                  <td className="px-4 py-6 font-black text-indigo-500 text-lg">{task.required_workers}</td>
                  <td className="px-4 py-6 text-right">
                    <button onClick={() => handleDelete(task.id)} className="text-red-500 hover:text-red-700 font-black text-xs uppercase tracking-widest bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors">
                      Delete Task
                    </button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-slate-100 rounded-xl mt-4 block w-full">No tasks found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

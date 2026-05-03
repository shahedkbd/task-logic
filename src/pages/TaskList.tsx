import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function TaskList() {
  const [tasks, setTasks] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const q = query(collection(db, 'tasks'), where('required_workers', '>', 0));
        const snap = await getDocs(q);
        setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching tasks", err);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-800">Active Tasks</h2>
        <p className="text-xs font-bold text-slate-400">Showing {tasks.length} available jobs</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.map(task => (
          <div key={task.id} onClick={() => navigate(`/dashboard/task-details/${task.id}`)} className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer flex flex-col justify-between">
            <div>
              <div className="flex gap-4 items-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl font-black text-indigo-500">⚡</div>
                <div>
                  <h3 className="font-black text-lg text-slate-800 line-clamp-1">{task.task_title}</h3>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">By {task.buyer_name}</p>
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 font-medium">{task.task_detail}</p>
            </div>
            <div className="flex items-end justify-between mt-auto">
              <div>
                <p className="text-xl font-black text-slate-900">{task.payable_amount} <span className="text-xs text-slate-400 uppercase">Coins</span></p>
                <p className="text-[10px] font-black text-indigo-500 uppercase mt-1">Slots: {task.required_workers}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase">Deadline</p>
                 <p className="text-sm font-black text-red-500">{new Date(task.completion_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200 font-bold uppercase tracking-widest text-sm">
            No tasks available right now. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, Menu, X, Coins, PlusCircle, CheckSquare, ListTodo, CreditCard, History, Users, Layers } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function DashboardLayout() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!userData) return;
    const q = query(
      collection(db, 'notifications'), 
      where('toEmail', '==', userData.email),
      // order by createdAt desc handled client side for now to avoid needing index
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      notifs.sort((a: any, b: any) => b.createdAt - a.createdAt);
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [userData]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navLinkClass = "flex items-center px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors";

  const NavLinks = () => {
    if (!userData) return null;
    
    if (userData.role === 'Worker') {
      return (
        <>
          <Link to="/dashboard/worker-home" className={navLinkClass}><span>Worker Home</span></Link>
          <Link to="/dashboard/task-list" className={navLinkClass}><span>Task Marketplace</span></Link>
          <Link to="/dashboard/my-submissions" className={navLinkClass}><span>My Submissions</span></Link>
          <Link to="/dashboard/withdrawals" className={navLinkClass}><span>Wallet & Payout</span></Link>
          <Link to="/dashboard/settings" className={navLinkClass}><span>Profile Settings</span></Link>
        </>
      );
    }
    
    if (userData.role === 'Buyer') {
      return (
        <>
          <Link to="/dashboard/buyer-home" className={navLinkClass}><span>Buyer Home</span></Link>
          <Link to="/dashboard/add-task" className={navLinkClass}><span>Add new Tasks</span></Link>
          <Link to="/dashboard/my-tasks" className={navLinkClass}><span>My Tasks</span></Link>
          <Link to="/dashboard/purchase-coin" className={navLinkClass}><span>Purchase Coin</span></Link>
          <Link to="/dashboard/payment-history" className={navLinkClass}><span>Payment history</span></Link>
          <Link to="/dashboard/settings" className={navLinkClass}><span>Profile Settings</span></Link>
        </>
      );
    }
    
    if (userData.role === 'Admin') {
      return (
        <>
          <Link to="/dashboard/admin-home" className={navLinkClass}><span>Admin Home</span></Link>
          <Link to="/dashboard/add-task" className={navLinkClass}><span>Add new Tasks</span></Link>
          <Link to="/dashboard/manage-users" className={navLinkClass}><span>Manage Users</span></Link>
          <Link to="/dashboard/manage-tasks" className={navLinkClass}><span>Manage Tasks</span></Link>
          <Link to="/dashboard/settings" className={navLinkClass}><span>Profile Settings</span></Link>
        </>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-slate-900 bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col justify-between p-6`}>
        <div className="flex flex-col h-full">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link to="/" className="text-2xl font-black tracking-tighter uppercase italic text-slate-900">MicroTasker</Link>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Earning Engine v2.4</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            <NavLinks />
          </nav>

          <div className="p-4 bg-slate-900 rounded-2xl text-white mt-6">
            <div className="flex items-center gap-3 mb-4">
              <img src={userData?.photoURL || 'https://via.placeholder.com/50'} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-slate-700" />
              <div>
                <p className="text-xs font-bold leading-none">{userData?.displayName || 'User'}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{userData?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center justify-center w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors uppercase tracking-widest space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dashboard Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex gap-6">
               <span className="text-xs font-black uppercase tracking-widest border-b-2 border-indigo-600 pb-1 text-slate-900">{userData?.role} Portal</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 relative">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Current Balance</p>
              <p className="text-2xl font-black text-emerald-500 leading-none">{userData?.coin || 0} <span className="text-xs">COINS</span></p>
            </div>
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-black leading-none text-white bg-indigo-600 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-12 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 z-50 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 font-black text-xs uppercase tracking-widest text-slate-600">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No new notifications</div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="p-4 border-b border-slate-100 hover:bg-slate-50 text-sm font-semibold text-slate-700 cursor-pointer transition-colors" onClick={() => {
                        setShowNotifications(false);
                        navigate(notif.actionRoute);
                      }}>
                        {notif.message}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

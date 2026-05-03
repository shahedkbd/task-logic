import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';

const Navbar = () => {
  const { user, userData } = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-black tracking-tighter uppercase italic text-slate-900">TaskLogic</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {!user ? (
              <>
                <Link to="/login" className="text-slate-500 hover:text-slate-900 px-4 py-2 font-bold text-sm tracking-wide transition-colors">Login</Link>
                <Link to="/register" className="px-6 py-3 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:scale-105 transition-transform active:scale-95">Register</Link>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 px-4 py-2 font-bold text-sm tracking-wide transition-colors border-2 border-slate-200 rounded-full hover:border-slate-300">Join as Developer</a>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-slate-500 hover:text-slate-900 px-4 py-2 font-black text-xs uppercase tracking-widest transition-colors">Dashboard</Link>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Balance</p>
                  <p className="text-lg font-black text-emerald-500 leading-none">{userData?.coin || 0} <span className="text-[10px]">COINS</span></p>
                </div>
                <div className="flex items-center space-x-3 bg-slate-50 p-1 pr-4 rounded-full border border-slate-100">
                  <img src={userData?.photoURL || 'https://via.placeholder.com/40'} alt="Profile" className="h-10 w-10 rounded-full" />
                  <button onClick={handleLogout} className="text-slate-400 hover:text-slate-700 transition-colors">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 px-4 py-2 font-bold text-sm tracking-wide transition-colors border-2 border-slate-200 rounded-full hover:border-slate-300 hidden sm:block">Join as Developer</a>
              </>
            )}
           </div>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-[#0F172A] text-slate-400 text-center py-12">
    <div className="flex justify-center space-x-6 mb-8">
      <a href="https://github.com/mdshahedulalamk" className="text-slate-500 hover:text-white font-bold uppercase text-xs tracking-widest transition-colors">GitHub</a>
      <a href="https://linkedin.com" className="text-slate-500 hover:text-white font-bold uppercase text-xs tracking-widest transition-colors">LinkedIn</a>
    </div>
    <div className="mb-4">
      <span className="text-xl font-black tracking-tighter uppercase italic text-white opacity-50">TaskLogic</span>
    </div>
    <p className="text-xs font-semibold">&copy; {new Date().getFullYear()} TaskLogic. All rights reserved.</p>
  </footer>
);

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

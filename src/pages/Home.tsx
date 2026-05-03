import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function Home() {
  const [bestWorkers, setBestWorkers] = useState<any[]>([]);

  useEffect(() => {
    const fetchBestWorkers = async () => {
      // Need a proper query to get Top 6 workers by coin.
      // Make sure we filter by role="Worker", since we don't have indexes by default,
      // we'll fetch workers and sort them, or simply rely on `coin` desc if all users with high coins are workers?
      // Since it's a demo, we will query `users`, role == Worker.
      // Firestore requires compounding index for role + coin. Let's just fetch top coins and filter, or just top users by coin.
      try {
        const q = query(collection(db, 'users'), orderBy('coin', 'desc'), limit(15));
        const snap = await getDocs(q);
        const workers = snap.docs.map(d => d.data()).filter(u => u.role === 'Worker').slice(0, 6);
        setBestWorkers(workers);
      } catch (err) {
        console.error("Error fetching workers", err);
      }
    };
    fetchBestWorkers();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A]">
      {/* Hero Section */}
      <section className="h-[75vh] min-h-[600px] relative overflow-hidden flex items-center justify-center p-4 lg:p-12">
        <div className="absolute inset-x-4 inset-y-4 lg:inset-x-12 lg:inset-y-12 rounded-[3rem] overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            className="h-full w-full"
          >
            <SwiperSlide>
              <div className="h-full w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80')] bg-cover bg-center">
                <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center relative z-10 px-4 max-w-4xl">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-white/80 mb-6 drop-shadow-md">Task Marketplace</p>
                  <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-[0.9] drop-shadow-xl">Complete Small Tasks.</h1>
                  <p className="text-xl md:text-2xl text-slate-200 font-bold max-w-2xl mx-auto drop-shadow-md">Earn money from the comfort of your home.</p>
                </motion.div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="h-full w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80')] bg-cover bg-center">
                <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center relative z-10 px-4 max-w-4xl">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-white/80 mb-6 drop-shadow-md">For Buyers</p>
                  <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-[0.9] drop-shadow-xl">Hire Top Workers.</h1>
                  <p className="text-xl md:text-2xl text-slate-200 font-bold max-w-2xl mx-auto drop-shadow-md">Get your tasks done quickly and affordably.</p>
                </motion.div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="h-full w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=2746&q=80')] bg-cover bg-center">
                <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center relative z-10 px-4 max-w-4xl">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-white/80 mb-6 drop-shadow-md">Platform Safety</p>
                  <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-[0.9] drop-shadow-xl">Secure & Reliable.</h1>
                  <p className="text-xl md:text-2xl text-slate-200 font-bold max-w-2xl mx-auto drop-shadow-md">Guaranteed payments and verified users.</p>
                </motion.div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      {/* Best Workers */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2 text-center">Top Earning</p>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-center mb-16 text-slate-900">Leaderboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {bestWorkers.map((worker, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center space-x-6 hover:-translate-y-2 transition-transform duration-300">
              <img src={worker.photoURL || 'https://via.placeholder.com/60'} alt={worker.displayName} className="w-20 h-20 rounded-[1.5rem] object-cover" />
              <div>
                <h3 className="font-black text-xl text-slate-800 tracking-tight">{worker.displayName}</h3>
                <p className="text-emerald-500 font-black mt-1 text-xl">{worker.coin} <span className="text-[10px] tracking-widest text-slate-400 uppercase">Coins</span></p>
              </div>
            </motion.div>
          ))}
          {bestWorkers.length === 0 && (
            <div className="col-span-full justify-center flex text-slate-400 font-bold uppercase tracking-widest text-sm py-12 border-2 border-dashed border-slate-200 rounded-3xl">
              No workers found yet. Check back later!
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2 text-center">Community</p>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-center mb-16 text-slate-900">Testimonials</h2>
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-16"
          >
            {[
              { name: 'Sarah L.', role: 'Worker', text: 'Amazing platform! I earn extra cash every weekend.', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
              { name: 'Michael R.', role: 'Buyer', text: 'I got my marketing research done in hours.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
              { name: 'Emma Watson', role: 'Worker', text: 'Super easy to withdraw via Stripe!', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
              { name: 'John Doe', role: 'Buyer', text: 'Quality work and affordable pricing.', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' }
            ].map((t, i) => (
              <SwiperSlide key={i}>
                <div className="bg-[#F8FAFC] p-10 rounded-[2.5rem] h-full flex flex-col border border-slate-100">
                  <p className="text-slate-600 font-bold text-lg flex-1 leading-snug">"{t.text}"</p>
                  <div className="mt-8 flex items-center space-x-4">
                    <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <div className="font-black text-slate-900 tracking-tight">{t.name}</div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-indigo-500 mt-1">{t.role}</div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Extra Section 1: How it works */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2 text-center">Process</p>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-center mb-16 text-slate-900">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-6 transform rotate-3">1</div>
            <h3 className="text-2xl font-black tracking-tighter mb-4 text-slate-800">Register</h3>
            <p className="text-slate-500 font-semibold leading-relaxed">Create an account as a Buyer or Worker and get your starting bonus coins.</p>
          </div>
          <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-6 transform -rotate-3">2</div>
            <h3 className="text-2xl font-black tracking-tighter mb-4 text-slate-800">Engage</h3>
            <p className="text-slate-500 font-semibold leading-relaxed">Buyers post tasks. Workers complete tasks and submit proof.</p>
          </div>
          <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-6 transform rotate-3">3</div>
            <h3 className="text-2xl font-black tracking-tighter mb-4 text-slate-800">Earn</h3>
            <p className="text-slate-500 font-semibold leading-relaxed">Workers get paid instantly upon approval, and can withdraw via convenient methods.</p>
          </div>
        </div>
      </section>

      {/* Extra Section 2: Global Reach */}
      <section className="py-24 bg-slate-900 text-white rounded-[3rem] mx-4 lg:mx-12 mb-24 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Milestones</p>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-16 px-4">Trusted globally.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-8">
            <div>
              <div className="text-5xl md:text-6xl font-black text-indigo-400 mb-4 tracking-tighter">50K+</div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">Active Workers</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-black text-emerald-400 mb-4 tracking-tighter">10K+</div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">Happy Buyers</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-black text-purple-400 mb-4 tracking-tighter">$2M+</div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">Paid Out</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-black text-orange-400 mb-4 tracking-tighter">1M+</div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">Tasks Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Extra Section 3: Call to Action */}
      <section className="pb-24 px-4 text-center">
        <div className="bg-indigo-600 rounded-[3rem] max-w-5xl mx-auto p-12 lg:p-24 text-white shadow-2xl shadow-indigo-600/30">
          <h2 className="text-5xl lg:text-7xl font-black mb-8 tracking-tighter leading-none">Ready to start?</h2>
          <p className="text-xl lg:text-2xl font-bold text-indigo-100 mb-12 max-w-2xl mx-auto leading-tight">Join the most reliable micro-tasking platform today and monetize your time.</p>
          <button onClick={() => window.location.href='/register'} className="px-10 py-5 bg-white text-indigo-600 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-indigo-900/20">
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
}

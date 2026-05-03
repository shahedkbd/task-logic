import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Developer Alert: Please enable Email/Password Authentication in the Firebase Console for this project.');
      } else {
        toast.error('Login failed (' + error.code + '): ' + error.message);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        const userEmail = result.user.email || '';
        const userRole = userEmail === 'mdshahedulalamk@gmail.com' ? 'Admin' : 'Worker';
        const coin = userRole === 'Worker' ? 10 : (userRole === 'Buyer' ? 50 : 0);
        
        const { setDoc } = await import('firebase/firestore');
        await setDoc(userRef, {
          displayName: result.user.displayName || 'User',
          email: userEmail,
          photoURL: result.user.photoURL || '',
          role: userRole,
          coin: coin,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        toast.success('Account created and logged in successfully!');
      } else {
        toast.success('Logged in successfully!');
      }
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Developer Alert: Please enable Google Authentication in the Firebase Console for this project.');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('Developer Alert: Please add this app URL to Valid OAuth domains in Firebase console.');
      } else {
        toast.error('Google Sign In failed (' + error.code + '): ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div>
          <h2 className="mt-6 text-center text-5xl font-black tracking-tighter text-slate-900">Sign in</h2>
          <p className="mt-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Welcome back to TaskLogic</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input {...register('email')} type="email" placeholder="Email address" className="appearance-none rounded-2xl relative block w-full px-6 py-4 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold transition-all bg-slate-50" />
              {errors.email && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest mt-2">{errors.email.message as string}</p>}
            </div>
            <div>
              <input {...register('password')} type="password" placeholder="Password" className="appearance-none rounded-2xl relative block w-full px-6 py-4 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold transition-all bg-slate-50" />
              {errors.password && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest mt-2">{errors.password.message as string}</p>}
            </div>
          </div>
          <div>
            <button type="submit" className="group relative w-full flex justify-center py-5 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] shadow-xl shadow-indigo-900/20 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/30">
              Sign in
            </button>
          </div>
        </form>
        <div className="mt-6">
          <button onClick={signInWithGoogle} className="w-full flex justify-center py-5 border-2 border-slate-100 rounded-2xl shadow-sm bg-white text-sm font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all">
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

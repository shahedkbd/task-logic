import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  photoURL: z.string().url("Must be a valid URL"),
  role: z.enum(['Worker', 'Buyer']),
});

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });
  const navigate = useNavigate();

  const handleUserCreation = async (uid: string, data: any) => {
    try {
      const userRole = data.email === 'mdshahedulalamk@gmail.com' ? 'Admin' : data.role;
      const coin = userRole === 'Worker' ? 10 : (userRole === 'Buyer' ? 50 : 0);
      await setDoc(doc(db, 'users', uid), {
        displayName: data.name,
        email: data.email,
        photoURL: data.photoURL,
        role: userRole,
        coin: coin,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'users');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(result.user, { displayName: data.name, photoURL: data.photoURL });
      await handleUserCreation(result.user.uid, data);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Developer Alert: Please enable Email/Password Authentication in the Firebase Console for this project.');
      } else {
        toast.error('Registration failed (' + error.code + '): ' + error.message);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
        // We need them to pick a role. To simplify for this demo, we can default to Worker, 
        // or we could show a modal. Actually, to keep it simple, we default to Worker for Google.
        const userEmail = result.user.email || '';
        const userRole = userEmail === 'mdshahedulalamk@gmail.com' ? 'Admin' : 'Worker';

        await handleUserCreation(result.user.uid, {
          name: result.user.displayName || 'User',
          email: userEmail,
          photoURL: result.user.photoURL || '',
          role: userRole
        });
      }
      toast.success('Logged in successfully!');
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
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div>
          <h2 className="mt-6 text-center text-5xl font-black tracking-tighter text-slate-900">Register</h2>
          <p className="mt-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Join TaskLogic</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input {...register('name')} type="text" placeholder="Full Name" className="appearance-none rounded-2xl relative block w-full px-6 py-4 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold transition-all bg-slate-50" />
              {errors.name && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest mt-2">{errors.name.message as string}</p>}
            </div>
            <div>
              <input {...register('email')} type="email" placeholder="Email address" className="appearance-none rounded-2xl relative block w-full px-6 py-4 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold transition-all bg-slate-50" />
              {errors.email && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest mt-2">{errors.email.message as string}</p>}
            </div>
            <div>
              <input {...register('password')} type="password" placeholder="Password" className="appearance-none rounded-2xl relative block w-full px-6 py-4 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold transition-all bg-slate-50" />
              {errors.password && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest mt-2">{errors.password.message as string}</p>}
            </div>
            <div>
              <input {...register('photoURL')} type="text" placeholder="Profile Picture URL" className="appearance-none rounded-2xl relative block w-full px-6 py-4 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold transition-all bg-slate-50" />
              {errors.photoURL && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest mt-2">{errors.photoURL.message as string}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2">I am a...</label>
              <select {...register('role')} className="appearance-none rounded-2xl relative block w-full px-6 py-4 border border-slate-200 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-black transition-all bg-slate-50">
                <option value="Worker">Worker</option>
                <option value="Buyer">Buyer</option>
              </select>
            </div>
          </div>
          <div>
            <button type="submit" className="group relative w-full flex justify-center py-5 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] shadow-xl shadow-indigo-900/20 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/30 mt-8">
              Register Account
            </button>
          </div>
        </form>
        <div className="mt-8">
          <button onClick={signInWithGoogle} className="w-full flex justify-center py-5 border-2 border-slate-100 rounded-2xl shadow-sm bg-white text-sm font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all">
            Sign up with Google
            <span className="ml-2 text-slate-400 text-xs">(Worker Default)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

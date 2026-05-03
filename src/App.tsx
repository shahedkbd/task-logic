/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './layout/MainLayout';
import DashboardLayout from './layout/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard Pages
import BuyerHome from './pages/BuyerHome';
import AddTask from './pages/AddTask';
import MyTasks from './pages/MyTasks';
import PurchaseCoin from './pages/PurchaseCoin';
import WorkerHome from './pages/WorkerHome';
import TaskList from './pages/TaskList';
import TaskDetails from './pages/TaskDetails';
import MySubmissions from './pages/MySubmissions';
import Withdrawals from './pages/Withdrawals';
import AdminHome from './pages/AdminHome';
import ManageUsers from './pages/ManageUsers';
import ManageTasks from './pages/ManageTasks';
import PaymentHistory from './pages/PaymentHistory';
import Settings from './pages/Settings';
import AuthPlaceholder from './components/AuthPlaceholder';

// Protected Routes
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from './lib/firebase';

function DashboardIndex() {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="p-4">Loading dashboard...</div>;

  if (userData?.role === 'Worker') return <Navigate to="worker-home" replace />;
  if (userData?.role === 'Buyer') return <Navigate to="buyer-home" replace />;
  if (userData?.role === 'Admin') return <Navigate to="admin-home" replace />;

  if (user && !userData) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Profile Incomplete</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Your account was created with Firebase, but the database profile is missing. 
          This can happen if registration was interrupted.
        </p>
        <div className="space-x-4">
          <button 
            className="bg-indigo-600 text-white font-bold tracking-widest uppercase text-xs px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-700"
            onClick={async () => {
               const email = user.email || '';
               const role = email === 'mdshahedulalamk@gmail.com' ? 'Admin' : 'Worker';
               const coin = role === 'Worker' ? 10 : (role === 'Buyer' ? 50 : 0);
               try {
                 await setDoc(doc(db, 'users', user.uid), {
                   displayName: user.displayName || 'User',
                   email: email,
                   photoURL: user.photoURL || '',
                   role: role,
                   coin: coin,
                   createdAt: Date.now(),
                   updatedAt: Date.now()
                 });
                 window.location.reload();
               } catch(e: any) {
                 alert('Could not create profile: ' + e.message);
               }
            }}
          >
            Create Worker Profile Now
          </button>
          <button 
            className="bg-slate-200 text-slate-800 font-bold tracking-widest uppercase text-xs px-6 py-3 rounded-xl hover:bg-slate-300"
            onClick={async () => {
              await auth.signOut();
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return <div className="p-4 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardIndex />} />
          
          <Route path="buyer-home" element={<BuyerHome />} />
          <Route path="add-task" element={<AddTask />} />
          <Route path="my-tasks" element={<MyTasks />} />
          <Route path="purchase-coin" element={<PurchaseCoin />} />
          <Route path="payment-history" element={<PaymentHistory />} />
          
          <Route path="worker-home" element={<WorkerHome />} />
          <Route path="task-list" element={<TaskList />} />
          <Route path="task-details/:id" element={<TaskDetails />} />
          <Route path="my-submissions" element={<MySubmissions />} />
          <Route path="withdrawals" element={<Withdrawals />} />
          
          <Route path="admin-home" element={<AdminHome />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="manage-tasks" element={<ManageTasks />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}

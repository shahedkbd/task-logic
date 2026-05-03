/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate } from 'react-router-dom';
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

function DashboardIndex() {
  const { userData } = useAuth();
  if (userData?.role === 'Worker') return <Navigate to="worker-home" replace />;
  if (userData?.role === 'Buyer') return <Navigate to="buyer-home" replace />;
  if (userData?.role === 'Admin') return <Navigate to="admin-home" replace />;
  return <div className="p-4">Loading dashboard...</div>;
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

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import LiveToastContainer from '../common/LiveToastContainer';
import { useRailPlan } from '../../context/RailPlanContext';

export const Layout = ({ children }) => {
  const { toasts, removeToast } = useRailPlan();

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-900 flex flex-col font-sans antialiased">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-[#F6F8FB] overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Real-time Cross-tab Sync Toasts */}
      <LiveToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default Layout;

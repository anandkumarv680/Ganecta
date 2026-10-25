import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Topbar />
        <main className="flex-1 px-4 lg:px-8 py-6 max-w-5xl w-full mx-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

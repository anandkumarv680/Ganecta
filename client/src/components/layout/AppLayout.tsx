import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="h-screen bg-neutral-50 flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 max-w-5xl w-full mx-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

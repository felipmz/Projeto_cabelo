import React, { useState } from 'react';
import AdminSidebar, { AdminPage } from './components/layout/AdminSidebar';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import AdminServices from './pages/AdminServices';
import AdminBarbers from './pages/AdminBarbers';
import Schedule from './pages/Schedule';
import AdminInfo from './pages/AdminInfo';
import s from './Admin.module.css';

const Admin: React.FC = () => {
  const [page, setPage] = useState<AdminPage>('dashboard');

  const PAGE_MAP: Record<AdminPage, React.ReactNode> = {
    dashboard:    <Dashboard />,
    appointments: <Appointments />,
    services:     <AdminServices />,
    barbers:      <AdminBarbers />,
    schedule:     <Schedule />,
    info:         <AdminInfo />,
  };

  return (
    <div className={s.shell}>
      <AdminSidebar current={page} onChange={setPage} />
      <main className={s.content} key={page}>
        {PAGE_MAP[page]}
      </main>
    </div>
  );
};

export default Admin;

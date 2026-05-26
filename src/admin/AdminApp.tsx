import React from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Admin from './Admin';
import './admin.css';
import './pages/Login.module.css';

const AdminApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#050507', color: '#c9a227', fontSize: '1.4rem',
      }}>
        ✂
      </div>
    );
  }

  return user ? <Admin /> : <Login />;
};

export default AdminApp;

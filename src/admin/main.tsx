import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '../hooks/useAuth';
import AdminApp from './AdminApp';
import '../styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  </React.StrictMode>,
);

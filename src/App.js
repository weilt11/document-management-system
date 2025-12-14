import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from './services/AuthService';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './pages/MainLayout';
import DocumentManagement from './pages/DocumentManagement';
import UserManagement from './pages/UserManagement';
import OperationLog from './pages/OperationLog';
import './App.css';

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/main/*" 
          element={
            currentUser ? (
              <MainLayout>
                <Routes>
                  <Route path="documents" element={<DocumentManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="logs" element={<OperationLog />} />
                  <Route path="" element={<Navigate to="documents" replace />} />
                </Routes>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <div className="App">
          <AppContent />
        </div>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Hooks
import { useAuth } from './hooks/useAuth';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OCRPage from './pages/OCRPage';
import ResultsPage from './pages/ResultsPage';
import ResultDetailPage from './pages/ResultDetailPage';

// Components
import Layout from './components/Layout';

// Resolve API base from env (Vite) with safe fallback to your Render URL
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE?.trim()) ||
  'https://ocr-flask-oyoc.onrender.com';

// Backend status checker
const BackendStatusChecker = () => {
  const [isConnected, setIsConnected] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const checkBackendStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/test`, {
          method: 'GET',
          credentials: 'include', // match axios config
        });
        if (!cancelled) setIsConnected(res.ok);
      } catch (err) {
        if (!cancelled) setIsConnected(false);
        console.error('Backend connection error:', err);
      }
    };

    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 10000); // every 10s

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (isConnected === false) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
        Cannot connect to the backend server at&nbsp;
        <span className="font-semibold">{API_BASE}</span>.
      </div>
    );
  }

  return null;
};

function App() {
  const {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
    clearError,
  } = useAuth();

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <BackendStatusChecker />
      <Layout
        isAuthenticated={isAuthenticated}
        username={user?.username}
        onLogout={logout}
      >
        <Routes>
          <Route path="/" element={<HomePage isAuthenticated={isAuthenticated} />} />

          <Route
            path="/login"
            element={
              <LoginPage
                login={login}
                error={error}
                clearError={clearError}
              />
            }
          />

          <Route
            path="/register"
            element={
              <RegisterPage
                register={register}
                error={error}
                clearError={clearError}
              />
            }
          />

          <Route
            path="/ocr"
            element={
              <ProtectedRoute>
                <OCRPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/results/:id"
            element={
              <ProtectedRoute>
                <ResultDetailPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

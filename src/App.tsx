import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Login from './pages/Login';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('landing');

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/dashboard') {
      setCurrentPage('dashboard');
    } else if (path === '/analytics') {
      setCurrentPage('analytics');
    } else if (path === '/login') {
      setCurrentPage('login');
    } else {
      setCurrentPage('landing');
    }
  }, []);

  useEffect(() => {
    const path = currentPage === 'landing' ? '/' : `/${currentPage}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <Login />;
      case 'dashboard':
        return (
          <ProtectedRoute requireAdmin>
            <Dashboard />
          </ProtectedRoute>
        );
      case 'analytics':
        return (
          <ProtectedRoute requireAdmin>
            <Analytics />
          </ProtectedRoute>
        );
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {currentPage !== 'login' && (
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-logo">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#6C63FF"/>
            <path d="M8 12h10a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2z" fill="white" opacity="0.9"/>
            <path d="M20 15l6-3v8l-6-3v-2z" fill="white"/>
          </svg>
          <div className="loading-spinner-large"></div>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <SocketProvider>
      <DashboardPage />
    </SocketProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

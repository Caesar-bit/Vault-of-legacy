import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { VaultPage } from './components/pages/VaultPage';
import { TimelinePage } from './components/pages/TimelinePage';
import { CollectionsPage } from './components/pages/CollectionsPage';
import { ArchivePage } from './components/pages/ArchivePage';
import { GalleryPage } from './components/pages/GalleryPage';
import { ResearchPage } from './components/pages/ResearchPage';
import { UsersPage } from './components/pages/UsersPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { TemplatesPage } from './components/pages/TemplatesPage';
import { ExportPage } from './components/pages/ExportPage';
import { PrivacyPage } from './components/pages/PrivacyPage';
import { APIPage } from './components/pages/APIPage';
import { BackupPage } from './components/pages/BackupPage';
import { BlockchainPage } from './components/pages/BlockchainPage';
import { AboutPage } from './components/pages/AboutPage';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingScreen message="Initializing secure connection..." />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/signup" element={<SignupForm onSwitchToLogin={(email) => navigate('/login', { state: { email, forceLogin: true } })} />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm onSwitchToLogin={() => navigate('/login')} />} />
        <Route path="*" element={<LoginForm onSwitchToSignup={(email) => navigate('/signup', { state: { email } })} onSwitchToForgotPassword={() => navigate('/forgot-password')} />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/users" element={user?.role === 'admin' ? <UsersPage /> : <div className="p-6">Access denied</div>} />
        <Route path="/analytics" element={user?.role === 'admin' ? <AnalyticsPage /> : <div className="p-6">Access denied</div>} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/api" element={user?.role === 'admin' ? <APIPage /> : <div className="p-6">Access denied</div>} />
        <Route path="/backup" element={<BackupPage />} />
        <Route path="/blockchain" element={<BlockchainPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
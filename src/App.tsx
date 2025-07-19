import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
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

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');

  if (isLoading) {
    return <LoadingScreen message="Initializing secure connection..." />;
  }

  if (!isAuthenticated) {
    switch (authMode) {
      case 'signup':
        return <SignupForm onSwitchToLogin={() => setAuthMode('login')} />;
      case 'forgot':
        return <ForgotPasswordForm onSwitchToLogin={() => setAuthMode('login')} />;
      default:
        return (
          <LoginForm
            onSwitchToSignup={() => setAuthMode('signup')}
            onSwitchToForgotPassword={() => setAuthMode('forgot')}
          />
        );
    }
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/api" element={<APIPage />} />
        <Route path="/backup" element={<BackupPage />} />
        <Route path="/blockchain" element={<BlockchainPage />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
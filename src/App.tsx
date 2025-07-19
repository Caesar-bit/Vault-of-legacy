import React, { useState } from 'react';
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

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [currentPage, setCurrentPage] = useState('dashboard');

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

  const renderPage = () => {
    switch (currentPage) {
      case 'vault':
        return <VaultPage />;
      case 'timeline':
        return <TimelinePage />;
      case 'collections':
        return <CollectionsPage />;
      case 'archive':
        return <ArchivePage />;
      case 'gallery':
        return <GalleryPage />;
      case 'research':
        return <ResearchPage />;
      case 'users':
        return user?.role === 'admin' ? (
          <UsersPage />
        ) : (
          <div className="p-6">Access denied</div>
        );
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'templates':
        return <TemplatesPage />;
      case 'export':
        return <ExportPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'api':
        return <APIPage />;
      case 'backup':
        return <BackupPage />;
      case 'blockchain':
        return <BlockchainPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
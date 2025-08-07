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
import { TrusteesPage } from './components/pages/TrusteesPage';
import { ReleasesPage } from './components/pages/ReleasesPage';
import { BeneficiariesPage } from './components/pages/BeneficiariesPage';
import { SupportPage } from './components/pages/SupportPage';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/PageTransition';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Initializing secure connection..." />;
  }

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/signup" element={<PageTransition><SignupForm onSwitchToLogin={() => navigate('/login')} /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPasswordForm onSwitchToLogin={() => navigate('/login')} /></PageTransition>} />
          <Route path="*" element={<PageTransition><LoginForm onSwitchToSignup={() => navigate('/signup')} onSwitchToForgotPassword={() => navigate('/forgot-password')} /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/vault" element={<PageTransition><VaultPage /></PageTransition>} />
          <Route path="/timeline" element={<PageTransition><TimelinePage /></PageTransition>} />
          <Route path="/collections" element={<PageTransition><CollectionsPage /></PageTransition>} />
          <Route path="/archive" element={<PageTransition><ArchivePage /></PageTransition>} />
          <Route path="/gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
          <Route path="/research" element={<PageTransition><ResearchPage /></PageTransition>} />
          <Route path="/users" element={user?.role === 'admin' ? <PageTransition><UsersPage /></PageTransition> : <div className="p-6">Access denied</div>} />
          <Route path="/analytics" element={user?.role === 'admin' ? <PageTransition><AnalyticsPage /></PageTransition> : <div className="p-6">Access denied</div>} />
          <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
          <Route path="/templates" element={<PageTransition><TemplatesPage /></PageTransition>} />
          <Route path="/export" element={<PageTransition><ExportPage /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><PrivacyPage /></PageTransition>} />
          <Route path="/api" element={user?.role === 'admin' ? <PageTransition><APIPage /></PageTransition> : <div className="p-6">Access denied</div>} />
          <Route path="/backup" element={<PageTransition><BackupPage /></PageTransition>} />
          <Route path="/blockchain" element={<PageTransition><BlockchainPage /></PageTransition>} />
          <Route path="/trustees" element={<PageTransition><TrusteesPage /></PageTransition>} />
          <Route path="/beneficiaries" element={<PageTransition><BeneficiariesPage /></PageTransition>} />
          <Route path="/releases" element={<PageTransition><ReleasesPage /></PageTransition>} />
          <Route path="/support" element={<PageTransition><SupportPage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
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

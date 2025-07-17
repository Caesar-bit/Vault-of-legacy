import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

const translations: Translations = {
  en: {
    dashboard: 'Dashboard',
    vault: 'Vault',
    timeline: 'Timeline',
    collections: 'Collections',
    archive: 'Archive',
    gallery: 'Gallery',
    research: 'Research',
    users: 'Users',
    analytics: 'Analytics',
    settings: 'Settings',
    templates: 'Templates',
    export: 'Export',
    welcome: 'Welcome back',
    totalAssets: 'Total Assets',
    activeProjects: 'Active Projects',
    monthlyViews: 'Monthly Views',
    contributors: 'Contributors',
    quickActions: 'Quick Actions',
    uploadMedia: 'Upload Media',
    createTimeline: 'Create Timeline',
    newCollection: 'New Collection',
    archiveContent: 'Archive Content',
    recentActivity: 'Recent Activity',
    searchPlaceholder: 'Search assets, collections, and content...',
    newProject: 'New Project',
    signOut: 'Sign out',
    profile: 'Profile',
    language: 'Language',
    notifications: 'Notifications',
  },
  es: {
    dashboard: 'Panel de Control',
    vault: 'Bóveda',
    timeline: 'Línea de Tiempo',
    collections: 'Colecciones',
    archive: 'Archivo',
    gallery: 'Galería',
    research: 'Investigación',
    users: 'Usuarios',
    analytics: 'Analíticas',
    settings: 'Configuración',
    templates: 'Plantillas',
    export: 'Exportar',
    welcome: 'Bienvenido de vuelta',
    totalAssets: 'Activos Totales',
    activeProjects: 'Proyectos Activos',
    monthlyViews: 'Vistas Mensuales',
    contributors: 'Colaboradores',
    quickActions: 'Acciones Rápidas',
    uploadMedia: 'Subir Medios',
    createTimeline: 'Crear Línea de Tiempo',
    newCollection: 'Nueva Colección',
    archiveContent: 'Archivar Contenido',
    recentActivity: 'Actividad Reciente',
    searchPlaceholder: 'Buscar activos, colecciones y contenido...',
    newProject: 'Nuevo Proyecto',
    signOut: 'Cerrar Sesión',
    profile: 'Perfil',
    language: 'Idioma',
    notifications: 'Notificaciones',
  },
  fr: {
    dashboard: 'Tableau de Bord',
    vault: 'Coffre-fort',
    timeline: 'Chronologie',
    collections: 'Collections',
    archive: 'Archive',
    gallery: 'Galerie',
    research: 'Recherche',
    users: 'Utilisateurs',
    analytics: 'Analytiques',
    settings: 'Paramètres',
    templates: 'Modèles',
    export: 'Exporter',
    welcome: 'Bon retour',
    totalAssets: 'Actifs Totaux',
    activeProjects: 'Projets Actifs',
    monthlyViews: 'Vues Mensuelles',
    contributors: 'Contributeurs',
    quickActions: 'Actions Rapides',
    uploadMedia: 'Télécharger des Médias',
    createTimeline: 'Créer une Chronologie',
    newCollection: 'Nouvelle Collection',
    archiveContent: 'Archiver le Contenu',
    recentActivity: 'Activité Récente',
    searchPlaceholder: 'Rechercher des actifs, collections et contenu...',
    newProject: 'Nouveau Projet',
    signOut: 'Se Déconnecter',
    profile: 'Profil',
    language: 'Langue',
    notifications: 'Notifications',
  }
};

interface LanguageContextType {
  currentLanguage: Language;
  languages: Language[];
  changeLanguage: (code: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  const changeLanguage = (code: string) => {
    const language = languages.find(lang => lang.code === code);
    if (language) {
      setCurrentLanguage(language);
      localStorage.setItem('vault_language', code);
    }
  };

  const t = (key: string): string => {
    return translations[currentLanguage.code]?.[key] || translations.en[key] || key;
  };

  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('vault_language');
    if (savedLanguage) {
      changeLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      languages,
      changeLanguage,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  );
}
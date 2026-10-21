import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { RepositoryView } from './components/RepositoryView';
import { api } from './services/api';

const MainApp = () => {
  const { user, loading } = useAuth();
  const [selectedRepo, setSelectedRepo] = useState(null);

  // If URL contains hash or slug, auto-load
  useEffect(() => {
    if (user && !selectedRepo) {
      // Default to opening Adhoori Kahani if available for instant demo
      api.getRepos().then(data => {
        const adhoori = (data.repositories || []).find(r => r.slug === 'adhoori-kahani');
        if (adhoori) {
          setSelectedRepo(adhoori);
        }
      }).catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f3ec] flex items-center justify-center font-mono text-xs">
        <div className="brutal-card p-6 bg-white border-2 border-black animate-pulse">
          [INITIALIZING MUSICCOLLAB ENGINE & REPOSITORY REGISTRY...]
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LandingPage 
        onExploreDemo={async () => {
          try {
            const data = await api.getRepos();
            const adhoori = (data.repositories || []).find(r => r.slug === 'adhoori-kahani');
            if (adhoori) setSelectedRepo(adhoori);
          } catch {}
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f3ec] text-[#111111]">
      <Navbar 
        currentRepo={selectedRepo}
        onNavigateHome={() => setSelectedRepo(null)}
        onOpenRepo={r => setSelectedRepo(r)}
      />

      {selectedRepo ? (
        <RepositoryView 
          repo={selectedRepo}
          onBackToDashboard={() => setSelectedRepo(null)}
        />
      ) : (
        <Dashboard 
          onSelectRepo={repo => setSelectedRepo(repo)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

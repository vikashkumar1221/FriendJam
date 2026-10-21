import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { StudioDashboard } from './components/StudioDashboard';
import { RepositoryView } from './components/RepositoryView';
import { api } from './services/api';
import { Plus, X } from 'lucide-react';

const MainApp = () => {
  const { user, login, switchDemoAccount } = useAuth();
  const [allRepos, setAllRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newRepoData, setNewRepoData] = useState({
    name: '',
    description: '',
    genre: 'Indie Rock',
    bpm: 120,
    keySignature: 'C Major',
    timeSignature: '4/4',
    visibility: 'public'
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // If user is not yet logged in, auto-authenticate with demo user 'vikash' so they see the full dashboard immediately!
  useEffect(() => {
    if (!user) {
      switchDemoAccount('vikash').catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    loadRepositories();
  }, [user]);

  const loadRepositories = async () => {
    try {
      const data = await api.getRepos();
      setAllRepos(data.repositories || []);
    } catch {
      // ignore
    }
  };

  const handleCreateRepo = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    try {
      const res = await api.createRepo(newRepoData);
      setShowCreateModal(false);
      setNewRepoData({
        name: '',
        description: '',
        genre: 'Indie Rock',
        bpm: 120,
        keySignature: 'C Major',
        timeSignature: '4/4',
        visibility: 'public'
      });
      await loadRepositories();
      setSelectedRepo(res.repository);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3ec] text-[#111111] flex font-sans selection:bg-[#d7ff3b] selection:text-black">
      
      {/* 1. Left Sidebar matching screenshot */}
      <Sidebar 
        activeNav={activeNav}
        setActiveNav={(nav) => {
          setActiveNav(nav);
          setSelectedRepo(null); // return to dashboard
        }}
        onOpenRepo={(r) => setSelectedRepo(r)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        allRepos={allRepos}
      />

      {/* 2. Main Content Area (Offset by sidebar width on lg screens) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Navbar */}
        <TopNavbar 
          onOpenNewRepoModal={() => setShowCreateModal(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchQuery={searchQuery}
          onSearch={(q) => setSearchQuery(q)}
        />

        {/* Page Content: Either Studio Dashboard OR Single Repository Workspace */}
        <main className="flex-1">
          {selectedRepo ? (
            <RepositoryView 
              repo={selectedRepo}
              onBackToDashboard={() => setSelectedRepo(null)}
            />
          ) : (
            <StudioDashboard 
              allRepos={allRepos}
              onOpenRepo={(repo) => setSelectedRepo(repo)}
              onOpenNewRepoModal={() => setShowCreateModal(true)}
              onInviteModal={() => setShowInviteModal(true)}
              searchQuery={searchQuery}
              onRefreshRepos={loadRepositories}
            />
          )}
        </main>

      </div>

      {/* Global New Repository Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="brutal-card bg-white max-w-lg w-full p-6 border-2 border-black space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase tracking-wider text-black">
                [WORKBENCH] CREATE NEW SONG REPOSITORY
              </span>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="font-bold hover:text-red-600"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-2 bg-red-100 border border-red-600 text-red-900 font-bold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateRepo} className="space-y-3 font-sans">
              <div>
                <label className="block font-bold text-xs font-mono mb-1">SONG TITLE *</label>
                <input
                  type="text"
                  required
                  value={newRepoData.name}
                  onChange={e => setNewRepoData({ ...newRepoData, name: e.target.value })}
                  placeholder="e.g. Midnight Horizon"
                  className="brutal-input w-full font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-xs font-mono mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={newRepoData.description}
                  onChange={e => setNewRepoData({ ...newRepoData, description: e.target.value })}
                  placeholder="Acoustic chords, warm bass and vocal harmonies..."
                  className="brutal-input w-full font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs font-mono mb-1">GENRE</label>
                  <input
                    type="text"
                    value={newRepoData.genre}
                    onChange={e => setNewRepoData({ ...newRepoData, genre: e.target.value })}
                    className="brutal-input w-full font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-xs font-mono mb-1">KEY SIGNATURE</label>
                  <input
                    type="text"
                    value={newRepoData.keySignature}
                    onChange={e => setNewRepoData({ ...newRepoData, keySignature: e.target.value })}
                    className="brutal-input w-full font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs font-mono mb-1">TEMPO (BPM)</label>
                  <input
                    type="number"
                    min={40}
                    max={260}
                    value={newRepoData.bpm}
                    onChange={e => setNewRepoData({ ...newRepoData, bpm: Number(e.target.value) })}
                    className="brutal-input w-full font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-xs font-mono mb-1">TIME SIGNATURE</label>
                  <input
                    type="text"
                    value={newRepoData.timeSignature}
                    onChange={e => setNewRepoData({ ...newRepoData, timeSignature: e.target.value })}
                    className="brutal-input w-full font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="brutal-btn brutal-btn-acid w-full py-2.5 font-bold shadow-brutal text-sm font-mono"
                >
                  {creating ? 'INITIALIZING MAIN BRANCH...' : 'INITIALIZE SONG REPOSITORY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Quick Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="brutal-card bg-white max-w-md w-full p-6 border-2 border-black space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase tracking-wider text-black">
                [COLLABORATOR ACCESS] INVITE TO BAND
              </span>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="font-bold hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <p className="text-neutral-700 font-sans">
              Invite a vocalist, guitarist, drummer, or producer by username or email. They can record takes and submit pull requests.
            </p>

            <div className="space-y-2">
              <label className="block font-bold">MUSICIAN USERNAME OR EMAIL:</label>
              <input
                type="text"
                placeholder="neha, arjun-drums, or musician@studio.io"
                className="brutal-input w-full"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  alert('Invitation sent successfully!');
                  setShowInviteModal(false);
                }}
                className="brutal-btn brutal-btn-acid w-full py-2.5 font-bold shadow-brutal text-sm"
              >
                SEND COLLABORATION INVITE
              </button>
            </div>
          </div>
        </div>
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

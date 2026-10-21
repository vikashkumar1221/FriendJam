import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { StudioDashboard } from './components/StudioDashboard';
import { StudioMessageBox } from './components/StudioMessageBox';
import { RepositoryView } from './components/RepositoryView';
import { 
  SongsRepositoryView,
  CollaborationsView,
  ArtistsDirectoryView,
  LikedSongsView,
  TemplatesView,
  SharedWithMeView,
  StudioAnalyticsView,
  StudioSettingsView,
  StudioHelpView
} from './components/StudioViews';
import { api } from './services/api';
import { Disc3 } from 'lucide-react';

const MainApp = () => {
  const { user, loading, switchDemoAccount } = useAuth();
  const [allRepos, setAllRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Messaging state
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [activeCollaboratorChat, setActiveCollaboratorChat] = useState(null);
  
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

  useEffect(() => {
    if (user) {
      loadRepositories();
    }
  }, [user]);

  const loadRepositories = async () => {
    try {
      const data = await api.getRepos();
      setAllRepos(data.repositories || []);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0e11] flex items-center justify-center text-white font-mono">
        <div className="flex flex-col items-center space-y-3">
          <Disc3 className="w-8 h-8 text-[#20c9b0] animate-spin" />
          <span className="text-xs tracking-wider text-neutral-400">CONNECTING TO MUSICCOLLAB STUDIO...</span>
        </div>
      </div>
    );
  }

  // If not logged in, show LANDR-style Split-Screen Auth Page
  if (!user) {
    return <AuthPage />;
  }

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
    // Outer ambient clay-stone framing from Dribbble shot
    <div className="min-h-screen bg-[#b0a698] p-0 md:p-4 lg:p-6 flex items-center justify-center font-sans antialiased selection:bg-[#a84c26] selection:text-white">
      
      {/* Inner App Window matching Dribbble rounded container */}
      <div className="w-full max-w-[1560px] min-h-[92vh] bg-[#fbfaf8] md:rounded-3xl md:shadow-2xl md:border md:border-[#9f9485] overflow-hidden flex flex-col relative">
        
        <div className="flex-1 flex min-w-0">
          
          {/* 1. Left Sidebar matching Dribbble basalt graphite */}
          <Sidebar 
            activeNav={activeNav}
            setActiveNav={(nav) => {
              setActiveNav(nav);
              setSelectedRepo(null);
            }}
            onOpenRepo={(r) => setSelectedRepo(r)}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            allRepos={allRepos}
          />

          {/* 2. Main Content Area */}
          <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen bg-[#fbfaf8]">
            
            {/* Top Navbar limited to search, navigation links, notifications, and user profile */}
            <TopNavbar 
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              searchQuery={searchQuery}
              onSearch={(q) => setSearchQuery(q)}
              activeNav={activeNav}
              setActiveNav={(nav) => {
                setActiveNav(nav);
                setSelectedRepo(null);
              }}
              onToggleMessages={() => setIsMessagesOpen(!isMessagesOpen)}
            />

            {/* Content view */}
            <main className="flex-1 overflow-x-hidden">
              {selectedRepo ? (
                <RepositoryView 
                  repo={selectedRepo}
                  onBackToDashboard={() => setSelectedRepo(null)}
                />
              ) : activeNav === 'repositories' || activeNav === 'radio' ? (
                <SongsRepositoryView 
                  allRepos={allRepos}
                  onOpenRepo={(r) => setSelectedRepo(r)}
                  onOpenNewRepoModal={() => setShowCreateModal(true)}
                />
              ) : activeNav === 'collaborations' ? (
                <CollaborationsView 
                  allRepos={allRepos}
                  onOpenRepo={(r) => setSelectedRepo(r)}
                  onInviteModal={() => setShowInviteModal(true)}
                />
              ) : activeNav === 'projects' ? (
                <ArtistsDirectoryView 
                  allRepos={allRepos}
                  onOpenRepo={(r) => setSelectedRepo(r)}
                />
              ) : activeNav === 'recently-played' || activeNav === 'liked' ? (
                <LikedSongsView 
                  allRepos={allRepos}
                  onOpenRepo={(r) => setSelectedRepo(r)}
                />
              ) : activeNav === 'templates' ? (
                <TemplatesView 
                  onOpenNewRepoModal={() => setShowCreateModal(true)}
                />
              ) : activeNav === 'shared' ? (
                <SharedWithMeView 
                  allRepos={allRepos}
                  onOpenRepo={(r) => setSelectedRepo(r)}
                />
              ) : activeNav === 'analytics' ? (
                <StudioAnalyticsView />
              ) : activeNav === 'settings' ? (
                <StudioSettingsView />
              ) : activeNav === 'help' ? (
                <StudioHelpView />
              ) : (
                <StudioDashboard 
                  allRepos={allRepos}
                  onOpenRepo={(repo) => setSelectedRepo(repo)}
                  onOpenNewRepoModal={() => setShowCreateModal(true)}
                  onInviteModal={() => setShowInviteModal(true)}
                  searchQuery={searchQuery}
                  onSearch={(q) => setSearchQuery(q)}
                  onRefreshRepos={loadRepositories}
                  onOpenMessage={(username) => {
                    setActiveCollaboratorChat(username);
                    setIsMessagesOpen(true);
                  }}
                />
              )}
            </main>

          </div>

        </div>

      </div>

      {/* New Repository Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-3xl shadow-player border border-[#e2ded5] space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
              <span className="font-bold uppercase tracking-wider text-[#1c1e21] font-mono">
                [STUDIO WORKBENCH] CREATE NEW SONG REPOSITORY
              </span>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-500 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateRepo} className="space-y-3.5">
              <div>
                <label className="block font-bold text-xs text-[#1c1e21] mb-1">SONG TITLE *</label>
                <input
                  type="text"
                  required
                  value={newRepoData.name}
                  onChange={e => setNewRepoData({ ...newRepoData, name: e.target.value })}
                  placeholder="e.g. Midnight Horizon"
                  className="studio-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-xs text-[#1c1e21] mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={newRepoData.description}
                  onChange={e => setNewRepoData({ ...newRepoData, description: e.target.value })}
                  placeholder="Acoustic chords, warm bass and vocal harmonies..."
                  className="studio-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs text-[#1c1e21] mb-1">GENRE</label>
                  <input
                    type="text"
                    value={newRepoData.genre}
                    onChange={e => setNewRepoData({ ...newRepoData, genre: e.target.value })}
                    className="studio-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-xs text-[#1c1e21] mb-1">KEY SIGNATURE</label>
                  <input
                    type="text"
                    value={newRepoData.keySignature}
                    onChange={e => setNewRepoData({ ...newRepoData, keySignature: e.target.value })}
                    className="studio-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs text-[#1c1e21] mb-1">TEMPO (BPM)</label>
                  <input
                    type="number"
                    min={40}
                    max={260}
                    value={newRepoData.bpm}
                    onChange={e => setNewRepoData({ ...newRepoData, bpm: Number(e.target.value) })}
                    className="studio-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-xs text-[#1c1e21] mb-1">TIME SIGNATURE</label>
                  <input
                    type="text"
                    value={newRepoData.timeSignature}
                    onChange={e => setNewRepoData({ ...newRepoData, timeSignature: e.target.value })}
                    className="studio-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="studio-btn-amber w-full py-3 font-bold shadow-copper text-sm"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-player border border-[#e2ded5] space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
              <span className="font-bold uppercase tracking-wider text-[#1c1e21] font-mono">
                [COLLABORATOR ACCESS] INVITE TO BAND
              </span>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-neutral-500 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-[#4b4f57] leading-relaxed">
              Invite a vocalist, guitarist, drummer, or producer by username or email. They can record takes and submit pull requests.
            </p>

            <div className="space-y-2">
              <label className="block font-bold text-[#1c1e21]">MUSICIAN USERNAME OR EMAIL:</label>
              <input
                type="text"
                placeholder="neha, arjun-drums, or musician@studio.io"
                className="studio-input w-full text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  alert('Invitation sent successfully!');
                  setShowInviteModal(false);
                }}
                className="studio-btn-amber w-full py-3 font-bold shadow-copper text-sm"
              >
                SEND COLLABORATION INVITE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Interactive Studio Message Box */}
      <StudioMessageBox 
        isOpen={isMessagesOpen}
        onOpen={() => setIsMessagesOpen(true)}
        onClose={() => setIsMessagesOpen(false)}
        activeCollaborator={activeCollaboratorChat}
        onSelectCollaborator={(u) => setActiveCollaboratorChat(u)}
      />

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

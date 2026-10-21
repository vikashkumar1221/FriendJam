import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GitBranch, 
  GitCommit, 
  Music, 
  Layers, 
  FileText, 
  Sliders, 
  ArrowRight, 
  ShieldCheck, 
  Undo2, 
  GitPullRequest,
  Play,
  Volume2,
  Sparkles
} from 'lucide-react';

export const LandingPage = ({ onExploreDemo }) => {
  const { login, register, switchDemoAccount } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    login: 'vikash',
    password: 'Password123!',
    username: '',
    email: '',
    displayName: '',
    primaryRole: 'Songwriter / Producer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        await login(formData.login, formData.password);
      } else {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          primaryRole: formData.primaryRole
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3ec] text-[#111111]">
      
      {/* Top Banner */}
      <div className="bg-[#111111] text-[#faf9f5] px-4 py-2 border-b-2 border-black text-center font-mono text-xs flex items-center justify-center space-x-2">
        <span className="bg-[#d7ff3b] text-black px-1.5 py-0.5 font-bold uppercase text-[10px]">NEW</span>
        <span>MUSICCOLLAB v1.0 — GitHub for Songwriters, Singers, Guitarists & Audio Engineers</span>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 border-b-2 border-black">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 border-2 border-black bg-white px-3 py-1 font-mono text-xs shadow-brutal-sm">
              <span className="w-2 h-2 rounded-full bg-[#d7ff3b] border border-black"></span>
              <span className="font-bold uppercase tracking-wider">VERSION CONTROL SPECIFICALLY FOR MUSIC</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight font-sans leading-[1.05]">
              Every song <br />
              <span className="font-editorial italic font-normal text-6xl sm:text-8xl">has a history.</span>
            </h1>

            <p className="text-lg sm:text-xl text-neutral-800 max-w-xl leading-relaxed font-sans">
              Collaborate on lyrics, vocal harmonies, guitar riffs, and drum takes without accidentally overwriting or losing each other's work. True branching, atomic commits, stem diffs, and conflict handling for musicians.
            </p>

            {/* Call To Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setFormData({ login: 'vikash', password: 'Password123!' });
                  setShowAuthModal(true);
                }}
                className="brutal-btn brutal-btn-acid px-6 py-3.5 text-base font-bold flex items-center space-x-2 shadow-brutal"
              >
                <span>Launch Studio Workspace</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={async () => {
                  await switchDemoAccount('vikash');
                  if (onExploreDemo) onExploreDemo();
                }}
                className="brutal-btn bg-white px-6 py-3.5 text-base font-mono font-bold flex items-center space-x-2"
              >
                <span>Explore "Adhoori-Kahani" Demo</span>
              </button>
            </div>

            {/* Hand-crafted note */}
            <div className="pt-2 flex items-center space-x-2 text-xs font-mono text-neutral-600">
              <span className="bg-[#ede8dc] border border-black px-1.5 py-0.5 font-bold">[00] SPEC</span>
              <span>No dummy placeholders. Real multi-track audio playback & immutable Git commits.</span>
            </div>
          </div>

          {/* Interactive Workshop Visualizer */}
          <div className="lg:col-span-5">
            <div className="brutal-card bg-white p-5 border-2 border-black space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div className="flex items-center space-x-2 font-mono text-xs font-bold">
                  <span className="w-3 h-3 bg-red-500 border border-black inline-block"></span>
                  <span className="w-3 h-3 bg-yellow-400 border border-black inline-block"></span>
                  <span className="w-3 h-3 bg-green-500 border border-black inline-block"></span>
                  <span className="ml-2">git-music graph</span>
                </div>
                <span className="technical-badge bg-[#ede8dc]">BRANCH: main</span>
              </div>

              {/* Branch Diagram */}
              <div className="font-mono text-xs space-y-3 bg-[#faf9f5] p-3 border border-black">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-black"></div>
                  <span className="font-bold text-black">[commit: a47b192]</span>
                  <span className="text-neutral-600 truncate">Initial song arrangement</span>
                </div>
                <div className="pl-1.5 border-l-2 border-black ml-1.5 py-1 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-bold">branch: vocals/maya-harmonies</span>
                    <span className="bg-[#d7ff3b] text-black px-1 text-[10px] border border-black">PR #1 OPEN</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-800">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="font-bold">branch: guitar/ambient-textures</span>
                    <span className="text-[10px] text-neutral-500">2 commits ahead</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-black"></div>
                  <span className="font-bold text-black">[commit: b82e910]</span>
                  <span className="text-neutral-600 truncate">Added rhythm stems (Acoustic + Bass)</span>
                </div>
              </div>

              {/* Stem Matrix Preview */}
              <div className="border border-black p-3 bg-white space-y-2">
                <div className="flex justify-between items-center text-xs font-mono font-bold">
                  <span>STEM MATRIX</span>
                  <span className="text-[#0055ff]">4 ACTIVE TRACKS</span>
                </div>

                <div className="space-y-1.5">
                  {[
                    { name: 'Lead Vocals', take: 'Take 01 (Dry Verse)', color: 'bg-[#d7ff3b]' },
                    { name: 'Acoustic Guitar', take: 'Take 01 (Fingerpicked Martin)', color: 'bg-orange-300' },
                    { name: 'Sub Bass', take: 'Take 01 (Precision DI)', color: 'bg-cyan-300' },
                    { name: 'Acoustic Drums', take: 'Take 01 (Rim-click & Kick)', color: 'bg-purple-300' }
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 border border-black text-xs font-mono bg-[#faf9f5]">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 border border-black ${s.color}`}></span>
                        <span className="font-bold">{s.name}</span>
                      </div>
                      <span className="text-[10px] text-neutral-600">{s.take}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Feature Pillars in Brutalist Workshop Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-b-2 border-black">
        <div className="mb-10">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600 bg-[#ede8dc] border border-black px-2 py-0.5">
            [01] SYSTEM ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-2">
            Why Musicians Need Version Control, Not Google Drive.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="brutal-card p-6 bg-white space-y-3">
            <div className="w-10 h-10 border-2 border-black bg-[#d7ff3b] flex items-center justify-center font-bold text-black shadow-brutal-sm">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-sans">Non-Destructive Branching</h3>
            <p className="text-sm text-neutral-700 leading-relaxed font-sans">
              Singers record on <code className="bg-[#ede8dc] px-1 font-mono text-xs">vocals/maya</code>. Guitarists track on <code className="bg-[#ede8dc] px-1 font-mono text-xs">guitar/solo</code>. The approved <code className="bg-[#ede8dc] px-1 font-mono text-xs">main</code> branch stays sacred until reviewed and merged.
            </p>
          </div>

          <div className="brutal-card p-6 bg-white space-y-3">
            <div className="w-10 h-10 border-2 border-black bg-orange-400 flex items-center justify-center font-bold text-black shadow-brutal-sm">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-sans">Conflict Detection for Lyrics</h3>
            <p className="text-sm text-neutral-700 leading-relaxed font-sans">
              If two songwriters edit different lines, changes merge cleanly. If both edit the exact same chorus line simultaneously, MusicCollab shows both versions side-by-side. Never silently overwritten.
            </p>
          </div>

          <div className="brutal-card p-6 bg-white space-y-3">
            <div className="w-10 h-10 border-2 border-black bg-cyan-300 flex items-center justify-center font-bold text-black shadow-brutal-sm">
              <Undo2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-sans">Take Vault & Instant Restore</h3>
            <p className="text-sm text-neutral-700 leading-relaxed font-sans">
              Every take ever recorded has a permanent hash and waveform preview. Revert a commit, restore an older take from 3 weeks ago, or retrieve soft-deleted stems from the trash bin in 1 click.
            </p>
          </div>

        </div>
      </section>

      {/* Audio Workspace Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="brutal-card bg-[#111111] text-[#faf9f5] p-6 sm:p-10 border-2 border-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-neutral-700 pb-6 mb-8 gap-4">
            <div>
              <span className="font-mono text-xs font-bold text-[#d7ff3b] uppercase tracking-wider block">
                [02] MULTITRACK AUDIO ENGINE
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-1">
                Listen, Solo, Mute, and Comment on Exact Milliseconds.
              </h2>
            </div>
            <button
              onClick={async () => {
                await switchDemoAccount('vikash');
                if (onExploreDemo) onExploreDemo();
              }}
              className="brutal-btn brutal-btn-acid px-5 py-2.5 text-sm font-bold flex items-center space-x-2 self-start"
            >
              <span>Test Audio Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="border border-neutral-700 p-4 bg-[#1a1a1a]">
              <span className="text-[#d7ff3b] font-bold block mb-1">01 / MULTITRACK SYNC</span>
              <p className="text-neutral-400">Synchronized Web Audio API playback of all stem takes simultaneously.</p>
            </div>
            <div className="border border-neutral-700 p-4 bg-[#1a1a1a]">
              <span className="text-[#d7ff3b] font-bold block mb-1">02 / WAVEFORM SCRUBBING</span>
              <p className="text-neutral-400">Interactive waveform peaks with draggable playhead and timecode readout.</p>
            </div>
            <div className="border border-neutral-700 p-4 bg-[#1a1a1a]">
              <span className="text-[#d7ff3b] font-bold block mb-1">03 / TIMESTAMP CRITIQUE</span>
              <p className="text-neutral-400">Click on 00:08.5 to leave feedback tied to that specific acoustic note.</p>
            </div>
            <div className="border border-neutral-700 p-4 bg-[#1a1a1a]">
              <span className="text-[#d7ff3b] font-bold block mb-1">04 / TAKE HISTORY</span>
              <p className="text-neutral-400">Take 01, Take 02, Take 03. Preserved forever without file overwrites.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-none flex items-center justify-center p-4">
          <div className="brutal-card bg-white max-w-md w-full p-6 border-2 border-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600">
                {authMode === 'login' ? '[AUTH] SIGN IN TO WORKSHOP' : '[AUTH] REGISTER NEW MUSICIAN'}
              </span>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="font-mono text-sm font-bold hover:text-red-600"
              >
                ✕ CLOSE
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-red-100 border-2 border-red-600 font-mono text-xs text-red-900 font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block font-bold mb-1">DISPLAY NAME</label>
                    <input
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="e.g. Maya Patel"
                      className="brutal-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">USERNAME</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      placeholder="maya-vocals"
                      className="brutal-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">PRIMARY INSTRUMENT / ROLE</label>
                    <input
                      type="text"
                      value={formData.primaryRole}
                      onChange={e => setFormData({ ...formData, primaryRole: e.target.value })}
                      placeholder="Lead Vocalist / Songwriter"
                      className="brutal-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">EMAIL</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="maya@band.io"
                      className="brutal-input w-full"
                    />
                  </div>
                </>
              )}

              {authMode === 'login' && (
                <div>
                  <label className="block font-bold mb-1">USERNAME OR EMAIL</label>
                  <input
                    type="text"
                    required
                    value={formData.login}
                    onChange={e => setFormData({ ...formData, login: e.target.value })}
                    placeholder="vikash or vikash@musiccollab.io"
                    className="brutal-input w-full"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold mb-1">PASSWORD</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="brutal-input w-full"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="brutal-btn brutal-btn-acid w-full py-3 text-sm font-bold shadow-brutal mt-2"
              >
                {loading ? 'AUTHENTICATING...' : authMode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-black text-center font-mono text-xs">
              {authMode === 'login' ? (
                <span>
                  New here?{' '}
                  <button 
                    onClick={() => { setAuthMode('register'); setError(''); }}
                    className="font-bold underline hover:text-neutral-600"
                  >
                    Register musician profile
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button 
                    onClick={() => { setAuthMode('login'); setError(''); }}
                    className="font-bold underline hover:text-neutral-600"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>

            {/* Quick Demo Credentials Reminder */}
            <div className="mt-4 p-2 bg-[#ede8dc] border border-black text-[11px] font-mono">
              <span className="font-bold block text-black">TEST DEMO USERS (password: Password123!):</span>
              <span className="text-neutral-700">vikash, maya-vocals, sid-guitar, arjun-drums</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

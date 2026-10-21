import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Settings, 
  Save, 
  Key, 
  Music, 
  Lock, 
  CheckCircle2,
  Sliders
} from 'lucide-react';

export const CollaboratorSettings = ({ repo, onRepoUpdated, userRole }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [repoSettings, setRepoSettings] = useState({
    name: repo.name || '',
    description: repo.description || '',
    genre: repo.genre || 'Alternative Rock',
    bpm: repo.bpm || 120,
    keySignature: repo.keySignature || 'C Major',
    timeSignature: repo.timeSignature || '4/4',
    status: repo.status || 'Tracking',
    visibility: repo.visibility || 'public',
    protectedBranches: repo.protectedBranches || ['main']
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState('contributor');
  const [inviteInstrument, setInviteInstrument] = useState('Musician');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [repo._id]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await api.getRepoBySlug(repo.owner?.username || 'vikash', repo.slug);
      setMembers(data.members || []);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await api.updateRepo(repo._id, repoSettings);
      alert('Repository configuration updated successfully!');
      if (onRepoUpdated) onRepoUpdated(res.repository);
    } catch (err) {
      alert('Update failed: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;
    setInviting(true);

    try {
      await api.inviteMember(repo._id, {
        usernameOrEmail: inviteUsername.trim(),
        role: inviteRole,
        instrumentRole: inviteInstrument.trim()
      });
      setShowInviteModal(false);
      setInviteUsername('');
      await loadMembers();
      alert('Collaborator invited successfully!');
    } catch (err) {
      alert('Invite failed: ' + err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this collaborator from the repository?')) return;
    try {
      await api.removeMember(repo._id, userId);
      await loadMembers();
    } catch (err) {
      alert('Remove failed: ' + err.message);
    }
  };

  const isOwnerOrMaintainer = userRole === 'owner' || userRole === 'maintainer';

  return (
    <div className="space-y-8 text-xs font-sans">
      
      {/* Collaborators & Access Control */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#e8e4dc] shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
          <div>
            <span className="font-bold uppercase tracking-wider text-[#1c1e21] block font-mono">
              COLLABORATOR ACCESS CONTROL
            </span>
            <span className="text-[11px] text-[#7a7e85]">
              Role hierarchy: Owner &rarr; Maintainer &rarr; Contributor &rarr; Reviewer &rarr; Viewer
            </span>
          </div>

          {isOwnerOrMaintainer && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="studio-btn-amber px-4 py-1.5 font-bold flex items-center space-x-1 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Collaborator</span>
            </button>
          )}
        </div>

        {/* Member list */}
        <div className="space-y-2.5">
          {/* Owner Card */}
          <div className="p-3.5 rounded-2xl bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#a84c26] text-white font-bold flex items-center justify-center shadow-sm">
                {repo.owner?.username?.[0]?.toUpperCase() || 'O'}
              </div>
              <div>
                <div className="font-bold text-sm text-[#1c1e21]">
                  @{repo.owner?.username || 'vikash'} ({repo.owner?.displayName || 'Owner'})
                </div>
                <div className="text-[11px] text-[#7a7e85]">
                  {repo.owner?.primaryRole || 'Songwriter & Producer'}
                </div>
              </div>
            </div>

            <span className="bg-[#a84c26] text-white px-3 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase shadow-copper">
              OWNER (ROOT)
            </span>
          </div>

          {/* Invited Members */}
          {members.map(m => (
            <div key={m._id} className="p-3.5 rounded-2xl border border-[#e8e4dc] bg-white flex items-center justify-between hover:bg-[#fbfaf8] transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#f3efe9] text-[#1c1e21] font-bold flex items-center justify-center border border-[#e2ded5]">
                  {m.user?.username?.[0]?.toUpperCase() || 'M'}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1c1e21]">
                    @{m.user?.username} ({m.user?.displayName})
                  </div>
                  <div className="text-[11px] text-[#7a7e85]">
                    Role in song: <strong>{m.instrumentRole}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  m.role === 'maintainer' ? 'bg-[#ffedd5] text-[#9a3412]' :
                  m.role === 'contributor' ? 'bg-[#eff6ff] text-[#2563eb]' :
                  m.role === 'reviewer' ? 'bg-[#faf5ff] text-[#7c3aed]' : 'bg-[#f0ede6] text-[#555962]'
                }`}>
                  {m.role}
                </span>

                {isOwnerOrMaintainer && (
                  <button
                    onClick={() => handleRemoveMember(m.user?._id)}
                    className="hover:text-red-700 text-[#a0a4ad] p-1.5 transition-colors"
                    title="Remove access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Musical Properties & Settings Form */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#e8e4dc] shadow-soft space-y-4">
        <div className="border-b border-[#ece8e1] pb-3">
          <span className="font-bold uppercase tracking-wider text-[#1c1e21] block font-mono">
            SONG METADATA & PARAMETERS
          </span>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">SONG TITLE</label>
              <input
                type="text"
                disabled={!isOwnerOrMaintainer}
                value={repoSettings.name}
                onChange={e => setRepoSettings({ ...repoSettings, name: e.target.value })}
                className="studio-input w-full"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">GENRE</label>
              <input
                type="text"
                disabled={!isOwnerOrMaintainer}
                value={repoSettings.genre}
                onChange={e => setRepoSettings({ ...repoSettings, genre: e.target.value })}
                className="studio-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">PROJECT DESCRIPTION</label>
            <textarea
              rows={2}
              disabled={!isOwnerOrMaintainer}
              value={repoSettings.description}
              onChange={e => setRepoSettings({ ...repoSettings, description: e.target.value })}
              className="studio-input w-full"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold mb-1">TEMPO (BPM)</label>
              <input
                type="number"
                disabled={!isOwnerOrMaintainer}
                value={repoSettings.bpm}
                onChange={e => setRepoSettings({ ...repoSettings, bpm: Number(e.target.value) })}
                className="studio-input w-full font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">KEY SIGNATURE</label>
              <input
                type="text"
                disabled={!isOwnerOrMaintainer}
                value={repoSettings.keySignature}
                onChange={e => setRepoSettings({ ...repoSettings, keySignature: e.target.value })}
                className="studio-input w-full font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">TIME SIGNATURE</label>
              <input
                type="text"
                disabled={!isOwnerOrMaintainer}
                value={repoSettings.timeSignature}
                onChange={e => setRepoSettings({ ...repoSettings, timeSignature: e.target.value })}
                className="studio-input w-full font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">PRODUCTION STATUS</label>
              <select
                disabled={!isOwnerOrMaintainer}
                value={repoSettings.status}
                onChange={e => setRepoSettings({ ...repoSettings, status: e.target.value })}
                className="studio-input w-full bg-white font-mono text-xs"
              >
                <option value="Idea / Jam">Idea / Jam</option>
                <option value="Tracking">Tracking</option>
                <option value="Arrangement">Arrangement</option>
                <option value="Mixing">Mixing</option>
                <option value="Mastering">Mastering</option>
                <option value="Released">Released</option>
              </select>
            </div>
          </div>

          {isOwnerOrMaintainer && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="studio-btn-amber px-6 py-2.5 font-bold shadow-copper text-sm"
              >
                {savingSettings ? 'SAVING CONFIGURATION...' : 'SAVE REPOSITORY CONFIGURATION'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-player border border-[#e2ded5] space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
              <span className="font-bold uppercase tracking-wider text-[#1c1e21] font-mono">
                ADD BAND COLLABORATOR
              </span>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-neutral-500 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3.5">
              <div>
                <label className="block font-bold mb-1">USERNAME OR EMAIL *</label>
                <input
                  type="text"
                  required
                  value={inviteUsername}
                  onChange={e => setInviteUsername(e.target.value)}
                  placeholder="e.g. maya-vocals or maya@musiccollab.io"
                  className="studio-input w-full"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">COLLABORATION ROLE</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="studio-input w-full bg-white"
                >
                  <option value="maintainer">Maintainer (Can merge PRs & manage members)</option>
                  <option value="contributor">Contributor (Can branch, record takes, commit lyrics)</option>
                  <option value="reviewer">Reviewer (Can review and critique PRs)</option>
                  <option value="viewer">Viewer (Read-only audio & lyrics listening)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">INSTRUMENT / VOCAL ROLE</label>
                <input
                  type="text"
                  value={inviteInstrument}
                  onChange={e => setInviteInstrument(e.target.value)}
                  placeholder="e.g. Lead Vocals, Acoustic Guitar, Mixing Engineer"
                  className="studio-input w-full"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={inviting}
                  className="studio-btn-amber w-full py-2.5 font-bold shadow-copper text-sm"
                >
                  {inviting ? 'SENDING INVITATION...' : 'ADD COLLABORATOR NOW'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

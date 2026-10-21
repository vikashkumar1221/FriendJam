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
  
  // Repo Settings form
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

  // Invite Member state
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
    <div className="space-y-8 font-mono text-xs">
      
      {/* Collaborators & Access Control */}
      <div className="brutal-card bg-white p-5 border-2 border-black space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div>
            <span className="font-bold uppercase tracking-wider text-black block">
              [ACCESS CONTROL] BAND MEMBERS & ROLES
            </span>
            <span className="text-[10px] text-neutral-500">
              Role permissions: Owner &rarr; Maintainer &rarr; Contributor &rarr; Reviewer &rarr; Viewer
            </span>
          </div>

          {isOwnerOrMaintainer && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="brutal-btn brutal-btn-acid px-3 py-1.5 font-bold flex items-center space-x-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Collaborator</span>
            </button>
          )}
        </div>

        {/* Member list */}
        <div className="space-y-2">
          {/* Repository Owner Card */}
          <div className="p-3 border-2 border-black bg-[#ede8dc] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black text-[#d7ff3b] font-bold flex items-center justify-center border border-black">
                {repo.owner?.username?.[0]?.toUpperCase() || 'O'}
              </div>
              <div>
                <div className="font-bold text-sm text-black">
                  @{repo.owner?.username || 'vikash'} ({repo.owner?.displayName || 'Owner'})
                </div>
                <div className="text-[10px] text-neutral-600">
                  {repo.owner?.primaryRole || 'Songwriter & Producer'}
                </div>
              </div>
            </div>

            <span className="technical-badge bg-black text-[#d7ff3b] font-bold">
              OWNER (ROOT)
            </span>
          </div>

          {/* Invited Members */}
          {members.map(m => (
            <div key={m._id} className="p-3 border-2 border-black bg-white flex items-center justify-between hover:bg-[#faf9f5]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#faf9f5] border border-black font-bold flex items-center justify-center">
                  {m.user?.username?.[0]?.toUpperCase() || 'M'}
                </div>
                <div>
                  <div className="font-bold text-sm text-black">
                    @{m.user?.username} ({m.user?.displayName})
                  </div>
                  <div className="text-[10px] text-neutral-600">
                    Role in song: <strong>{m.instrumentRole}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`technical-badge uppercase ${
                  m.role === 'maintainer' ? 'bg-[#d7ff3b]' :
                  m.role === 'contributor' ? 'bg-cyan-200' :
                  m.role === 'reviewer' ? 'bg-purple-200' : 'bg-[#ede8dc]'
                }`}>
                  {m.role}
                </span>

                {isOwnerOrMaintainer && (
                  <button
                    onClick={() => handleRemoveMember(m.user?._id)}
                    className="hover:text-red-700 text-neutral-400 p-1"
                    title="Remove access"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Musical Properties & Settings Form */}
      <div className="brutal-card bg-white p-5 border-2 border-black space-y-4">
        <div className="border-b-2 border-black pb-3">
          <span className="font-bold uppercase tracking-wider text-black block">
            [REVISION PARAMETERS] SONG METADATA & REPO SETTINGS
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
                className="brutal-input w-full"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">GENRE</label>
              <input
                type="text"
                disabled={!isOwnerOrMaintainer}
                value={repoSettings.genre}
                onChange={e => setRepoSettings({ ...repoSettings, genre: e.target.value })}
                className="brutal-input w-full"
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
              className="brutal-input w-full"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold mb-1">BPM (TEMPO)</label>
              <input
                type="number"
                disabled={!isOwnerOrMaintainer}
                value={repoSettings.bpm}
                onChange={e => setRepoSettings({ ...repoSettings, bpm: Number(e.target.value) })}
                className="brutal-input w-full"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">KEY SIGNATURE</label>
              <input
                type="text"
                disabled={!isOwnerOrMaintainer}
                value={repoSettings.keySignature}
                onChange={e => setRepoSettings({ ...repoSettings, keySignature: e.target.value })}
                className="brutal-input w-full"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">TIME SIGNATURE</label>
              <input
                type="text"
                disabled={!isOwnerOrMaintainer}
                value={repoSettings.timeSignature}
                onChange={e => setRepoSettings({ ...repoSettings, timeSignature: e.target.value })}
                className="brutal-input w-full"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">PRODUCTION STATUS</label>
              <select
                disabled={!isOwnerOrMaintainer}
                value={repoSettings.status}
                onChange={e => setRepoSettings({ ...repoSettings, status: e.target.value })}
                className="brutal-input w-full bg-white font-mono"
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
                className="brutal-btn brutal-btn-acid px-5 py-2.5 font-bold shadow-brutal text-sm"
              >
                {savingSettings ? 'SAVING CONFIGURATION...' : 'SAVE REPOSITORY CONFIGURATION'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="brutal-card bg-white max-w-md w-full p-6 border-2 border-black space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase tracking-wider text-black">
                [INVITATION] ADD BAND COLLABORATOR
              </span>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="font-bold hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">USERNAME OR EMAIL *</label>
                <input
                  type="text"
                  required
                  value={inviteUsername}
                  onChange={e => setInviteUsername(e.target.value)}
                  placeholder="e.g. maya-vocals or maya@musiccollab.io"
                  className="brutal-input w-full"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">COLLABORATION ROLE</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="brutal-input w-full bg-white font-mono"
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
                  className="brutal-input w-full"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={inviting}
                  className="brutal-btn brutal-btn-acid w-full py-2.5 font-bold shadow-brutal text-sm"
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

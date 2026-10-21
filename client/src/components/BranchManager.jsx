import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  GitCompare, 
  ArrowRight,
  Clock,
  User,
  Check
} from 'lucide-react';

export const BranchManager = ({ repo, currentBranch, onSwitchBranch, userRole }) => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [fromBranch, setFromBranch] = useState(repo.defaultBranch || 'main');
  const [creating, setCreating] = useState(false);

  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareBase, setCompareBase] = useState(repo.defaultBranch || 'main');
  const [compareHead, setCompareHead] = useState('');
  const [compareResult, setCompareResult] = useState(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    loadBranches();
  }, [repo._id]);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const data = await api.getBranches(repo._id);
      setBranches(data.branches || []);
      const nonMain = data.branches.find(b => b.name !== (repo.defaultBranch || 'main'));
      if (nonMain) setCompareHead(nonMain.name);
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    setCreating(true);

    try {
      const res = await api.createBranch(repo._id, newBranchName.trim(), fromBranch);
      setShowCreateModal(false);
      setNewBranchName('');
      await loadBranches();
      if (onSwitchBranch) {
        onSwitchBranch(res.branch.name);
      }
    } catch (err) {
      alert('Failed to create branch: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBranch = async (branchName) => {
    if (!confirm(`Delete branch "${branchName}"? Protected branches cannot be deleted.`)) return;

    try {
      await api.deleteBranch(repo._id, branchName);
      await loadBranches();
      if (currentBranch === branchName && onSwitchBranch) {
        onSwitchBranch(repo.defaultBranch || 'main');
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleRunCompare = async () => {
    if (!compareBase || !compareHead) return;
    setComparing(true);
    try {
      const res = await api.compareBranches(repo._id, compareBase, compareHead);
      setCompareResult(res);
    } catch (err) {
      alert('Comparison failed: ' + err.message);
    } finally {
      setComparing(false);
    }
  };

  const protectedList = repo.protectedBranches || ['main'];

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e8e4dc] shadow-soft flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-[#a84c26]" />
          <span className="font-bold uppercase text-[#1c1e21]">
            BRANCH REGISTRY ({branches.length} BRANCHES)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setShowCompareModal(true);
              if (compareBase && compareHead) handleRunCompare();
            }}
            className="px-3.5 py-1.5 rounded-full border border-[#e2ded5] bg-white hover:bg-[#ede8dc] text-[#3a3d44] font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Branches</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="studio-btn-amber px-4 py-1.5 font-bold flex items-center space-x-1 shadow-sm font-sans"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Branch</span>
          </button>
        </div>
      </div>

      {/* Branches Table */}
      <div className="bg-white rounded-3xl border border-[#e8e4dc] shadow-soft overflow-hidden text-xs">
        <div className="p-4 bg-[#f8f6f2] border-b border-[#ece8e1] flex items-center justify-between font-bold uppercase text-[11px] text-[#7a7e85] font-mono">
          <span>BRANCH IDENTIFIER</span>
          <div className="flex space-x-12 pr-6">
            <span>PROTECTION</span>
            <span>CREATED BY</span>
            <span>ACTIONS</span>
          </div>
        </div>

        <div className="divide-y divide-[#ece8e1]">
          {branches.map(branch => {
            const isProtected = protectedList.includes(branch.name) || branch.isProtected;
            const isCurrent = currentBranch === branch.name;

            return (
              <div 
                key={branch._id || branch.name}
                className={`p-4 flex items-center justify-between hover:bg-[#fbfaf8] transition-colors ${
                  isCurrent ? 'bg-[#fff7ed]' : 'bg-white'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#f3efe9] flex items-center justify-center text-[#a84c26]">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#1c1e21] font-mono">{branch.name}</span>
                      {isCurrent && (
                        <span className="bg-[#1c1e21] text-[#f5be57] px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                          CURRENT
                        </span>
                      )}
                      {branch.name === (repo.defaultBranch || 'main') && (
                        <span className="bg-[#f0ede6] text-[#4a4d54] px-2 py-0.5 rounded-full text-[10px] font-mono">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#8c9099] mt-0.5 font-mono">
                      Branched from <strong className="text-[#4b4f57]">{branch.createdFromBranch || 'main'}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-10 font-mono">
                  <div>
                    {isProtected ? (
                      <span className="bg-[#f0f9f4] text-[#059669] border border-[#a7f3d0] px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Protected</span>
                      </span>
                    ) : (
                      <span className="text-[#8c9099] text-[10px]">Standard</span>
                    )}
                  </div>

                  <div className="text-[#555962] text-[11px] min-w-24">
                    @{branch.createdBy?.username || 'vikash'}
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isCurrent && (
                      <button
                        onClick={() => onSwitchBranch && onSwitchBranch(branch.name)}
                        className="px-3 py-1 rounded-full border border-[#e2ded5] bg-white hover:bg-[#ede8dc] text-[11px] font-bold text-[#1c1e21] transition-colors"
                      >
                        Switch
                      </button>
                    )}

                    {!isProtected && branch.name !== 'main' && (
                      <button
                        onClick={() => handleDeleteBranch(branch.name)}
                        className="hover:text-red-700 text-[#a0a4ad] p-1 transition-colors"
                        title="Delete branch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Create Branch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-player border border-[#e2ded5] space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
              <span className="font-bold uppercase tracking-wider text-[#1c1e21] font-mono">
                CREATE NEW BRANCH
              </span>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-500 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3.5">
              <div>
                <label className="block font-bold mb-1">BRANCH NAME *</label>
                <input
                  type="text"
                  required
                  value={newBranchName}
                  onChange={e => setNewBranchName(e.target.value)}
                  placeholder="e.g. vocals/maya-harmonies, guitar/solos"
                  className="studio-input w-full font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">BRANCH FROM</label>
                <select
                  value={fromBranch}
                  onChange={e => setFromBranch(e.target.value)}
                  className="studio-input w-full bg-white font-mono text-xs"
                >
                  {branches.map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-[#f8f5ee] rounded-2xl border border-[#ece8e1] text-[11px] text-[#4b4f57] leading-relaxed">
                Independent workspace: you can edit lyrics and record stems without affecting the approved main version.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="studio-btn-amber w-full py-2.5 font-bold shadow-copper text-sm"
                >
                  {creating ? 'BRANCHING WORKSPACE...' : 'CREATE BRANCH'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compare Branches Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 rounded-3xl shadow-player border border-[#e2ded5] space-y-4 text-xs font-sans max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
              <span className="font-bold uppercase tracking-wider text-[#1c1e21] font-mono">
                BRANCH COMPARISON TOOL
              </span>
              <button 
                onClick={() => setShowCompareModal(false)}
                className="text-neutral-500 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#f8f5ee] p-3.5 rounded-2xl border border-[#ece8e1]">
              <div>
                <label className="block font-bold mb-1 font-mono text-[11px]">BASE BRANCH (TARGET):</label>
                <select
                  value={compareBase}
                  onChange={e => setCompareBase(e.target.value)}
                  className="studio-input w-full bg-white text-xs font-mono"
                >
                  {branches.map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 font-mono text-[11px]">HEAD BRANCH (COMPARE):</label>
                <select
                  value={compareHead}
                  onChange={e => setCompareHead(e.target.value)}
                  className="studio-input w-full bg-white text-xs font-mono"
                >
                  {branches.map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleRunCompare}
              disabled={comparing}
              className="studio-btn-primary w-full py-2.5 font-bold text-xs"
            >
              {comparing ? 'COMPUTING DIFF...' : 'RUN COMPARISON'}
            </button>

            {compareResult && (
              <div className="space-y-4 pt-2 border-t border-[#ece8e1] font-mono">
                <div className="space-y-1">
                  <span className="font-bold text-[#1c1e21] uppercase block text-[11px]">LYRICS CHANGES:</span>
                  <div className="max-h-48 overflow-y-auto border border-[#e8e4dc] rounded-2xl divide-y divide-[#ece8e1] bg-[#fbfaf8]">
                    {(compareResult.lyricsDiff || []).map((d, idx) => (
                      <div key={idx} className={`p-2 flex items-start space-x-2 ${
                        d.type === 'added' ? 'bg-emerald-50 text-emerald-950 font-medium' :
                        d.type === 'removed' ? 'bg-red-50 text-red-950 line-through' :
                        d.type === 'modified' ? 'bg-amber-50 text-amber-950 font-medium' :
                        'text-neutral-700'
                      }`}>
                        <span className="w-4 font-bold">{d.type === 'added' ? '+' : d.type === 'removed' ? '-' : d.type === 'modified' ? '~' : ' '}</span>
                        <span>{d.compareText !== null ? d.compareText : d.baseText}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[#1c1e21] uppercase block text-[11px]">AUDIO STEMS DELTA:</span>
                  <div className="border border-[#e8e4dc] rounded-2xl p-3 bg-white space-y-1 text-xs">
                    <div>New Stems Added: {compareResult.trackComparison?.addedTracks?.length || 0}</div>
                    <div>Stems Modified / Takes Added: {compareResult.trackComparison?.modifiedTracks?.length || 0}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

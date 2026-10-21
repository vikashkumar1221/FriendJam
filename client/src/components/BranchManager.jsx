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

  // Compare branches
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
      <div className="brutal-card bg-white p-4 border-2 border-black flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-black" />
          <span className="font-bold uppercase tracking-wider">
            BRANCH REGISTRY ({branches.length} BRANCHES)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setShowCompareModal(true);
              if (compareBase && compareHead) handleRunCompare();
            }}
            className="brutal-btn bg-white px-3 py-1.5 font-bold flex items-center space-x-1"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Branches</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="brutal-btn brutal-btn-acid px-3 py-1.5 font-bold flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Branch</span>
          </button>
        </div>
      </div>

      {/* Branches Table */}
      <div className="brutal-card bg-white border-2 border-black overflow-hidden font-mono text-xs">
        <div className="p-3 bg-[#ede8dc] border-b-2 border-black flex items-center justify-between font-bold uppercase text-[11px]">
          <span>BRANCH IDENTIFIER</span>
          <div className="flex space-x-12 pr-6">
            <span>PROTECTION</span>
            <span>CREATED BY</span>
            <span>ACTIONS</span>
          </div>
        </div>

        <div className="divide-y-2 divide-neutral-200">
          {branches.map(branch => {
            const isProtected = protectedList.includes(branch.name) || branch.isProtected;
            const isCurrent = currentBranch === branch.name;

            return (
              <div 
                key={branch._id || branch.name}
                className={`p-4 flex items-center justify-between hover:bg-[#faf9f5] ${
                  isCurrent ? 'bg-[#eef8bb]' : 'bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <GitBranch className="w-4 h-4 text-black" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-black">{branch.name}</span>
                      {isCurrent && (
                        <span className="bg-black text-[#d7ff3b] px-1.5 py-0.2 text-[10px] font-bold">
                          CURRENT
                        </span>
                      )}
                      {branch.name === (repo.defaultBranch || 'main') && (
                        <span className="bg-neutral-200 border border-black px-1 text-[10px]">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">
                      Branched from <strong className="text-neutral-700">{branch.createdFromBranch || 'main'}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-10">
                  <div>
                    {isProtected ? (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-600 px-2 py-0.5 text-[10px] font-bold flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Protected</span>
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-[10px]">Standard</span>
                    )}
                  </div>

                  <div className="text-neutral-600 text-[11px] min-w-24">
                    @{branch.createdBy?.username || 'vikash'}
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isCurrent && (
                      <button
                        onClick={() => onSwitchBranch && onSwitchBranch(branch.name)}
                        className="brutal-btn bg-white hover:bg-neutral-100 px-2.5 py-1 text-[11px] font-bold"
                      >
                        Switch
                      </button>
                    )}

                    {!isProtected && branch.name !== 'main' && (
                      <button
                        onClick={() => handleDeleteBranch(branch.name)}
                        className="hover:text-red-700 text-neutral-400 p-1"
                        title="Delete branch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="brutal-card bg-white max-w-md w-full p-6 border-2 border-black space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase tracking-wider text-black">
                [GIT WORKSPACE] CREATE NEW BRANCH
              </span>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="font-bold hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">BRANCH NAME *</label>
                <input
                  type="text"
                  required
                  value={newBranchName}
                  onChange={e => setNewBranchName(e.target.value)}
                  placeholder="e.g. vocals/maya-harmonies, guitar/solos"
                  className="brutal-input w-full"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">BRANCH FROM</label>
                <select
                  value={fromBranch}
                  onChange={e => setFromBranch(e.target.value)}
                  className="brutal-input w-full bg-white font-mono"
                >
                  {branches.map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-2 bg-[#ede8dc] border border-black text-[11px] text-neutral-700">
                Independent workspace: you can edit lyrics and record stems without affecting the approved main version.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="brutal-btn brutal-btn-acid w-full py-2.5 font-bold shadow-brutal text-sm"
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="brutal-card bg-white max-w-2xl w-full p-6 border-2 border-black space-y-4 font-mono text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase tracking-wider text-black">
                [BRANCH COMPARISON & DIFF TOOL]
              </span>
              <button 
                onClick={() => setShowCompareModal(false)}
                className="font-bold hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#ede8dc] p-3 border border-black">
              <div>
                <label className="block font-bold mb-1">BASE BRANCH (TARGET):</label>
                <select
                  value={compareBase}
                  onChange={e => setCompareBase(e.target.value)}
                  className="brutal-input w-full bg-white text-xs"
                >
                  {branches.map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">HEAD BRANCH (COMPARE):</label>
                <select
                  value={compareHead}
                  onChange={e => setCompareHead(e.target.value)}
                  className="brutal-input w-full bg-white text-xs"
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
              className="brutal-btn brutal-btn-acid w-full py-2 font-bold"
            >
              {comparing ? 'COMPUTING DIFF...' : 'RUN COMPARISON'}
            </button>

            {compareResult && (
              <div className="space-y-4 pt-2 border-t-2 border-black">
                {/* Lyrics Diff */}
                <div className="space-y-1">
                  <span className="font-bold text-black uppercase block">LYRICS CHANGES:</span>
                  <div className="max-h-48 overflow-y-auto border border-black divide-y divide-neutral-200">
                    {(compareResult.lyricsDiff || []).map((d, idx) => (
                      <div key={idx} className={`p-1.5 flex items-start space-x-2 ${
                        d.type === 'added' ? 'bg-emerald-100 text-emerald-950' :
                        d.type === 'removed' ? 'bg-red-100 text-red-950 line-through' :
                        d.type === 'modified' ? 'bg-yellow-100 text-yellow-950' : 'bg-white'
                      }`}>
                        <span className="w-4 font-bold">{d.type === 'added' ? '+' : d.type === 'removed' ? '-' : d.type === 'modified' ? '~' : ' '}</span>
                        <span>{d.compareText !== null ? d.compareText : d.baseText}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stems Diff */}
                <div className="space-y-1">
                  <span className="font-bold text-black uppercase block">AUDIO STEMS DELTA:</span>
                  <div className="border border-black p-2 bg-[#faf9f5] space-y-1">
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

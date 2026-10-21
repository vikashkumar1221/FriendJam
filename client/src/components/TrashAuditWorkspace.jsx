import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Trash2, 
  RotateCcw, 
  History, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Music, 
  Clock, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Layers,
  Sparkles
} from 'lucide-react';

export const TrashAuditWorkspace = ({ repo, userRole }) => {
  const [trashItems, setTrashItems] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trash'); // 'trash' or 'audit'

  useEffect(() => {
    loadData();
  }, [repo._id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trashRes, logsRes] = await Promise.all([
        api.getTrash(repo._id),
        api.getAuditLog(repo._id)
      ]);
      setTrashItems(trashRes.trash || []);
      setAuditLogs(logsRes.logs || []);
    } catch (err) {
      console.error('Failed to load trash/audit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (assetId) => {
    try {
      const res = await api.restoreTrashAsset(repo._id, assetId);
      alert(res.message);
      await loadData();
    } catch (err) {
      alert('Restore failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-nav Pills */}
      <div className="studio-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('trash')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'trash'
                ? 'bg-[#232528] text-white shadow-sm'
                : 'bg-[#f5f3ef] text-[#4b4f57] hover:bg-[#ede8dc]'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Recoverable Trash Bin ({trashItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'audit'
                ? 'bg-[#232528] text-white shadow-sm'
                : 'bg-[#f5f3ef] text-[#4b4f57] hover:bg-[#ede8dc]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero-Data-Loss Active</span>
          </div>

          <button 
            onClick={loadData} 
            className="p-2 rounded-xl bg-[#f5f3ef] text-[#4b4f57] hover:text-[#1c1e21] hover:bg-[#ede8dc] transition-all"
            title="Refresh Audit Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="studio-card p-16 text-center text-[#7c8088] space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#a84c26]" />
          <p className="font-mono text-xs uppercase tracking-wider">Querying immutable audit log and recovery registry...</p>
        </div>
      ) : activeTab === 'trash' ? (
        
        /* Recoverable Trash Bin */
        <div className="studio-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#ece8e1] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#1c1e21]">Soft-Deleted Stems & Takes</h3>
              <p className="text-xs text-[#7c8088] mt-0.5">
                Stems removed from multitrack views are preserved in object storage and can be restored anytime with a single click.
              </p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#f5f3ef] text-[#4b4f57] font-semibold">
              {trashItems.length} deleted {trashItems.length === 1 ? 'stem' : 'stems'}
            </span>
          </div>

          <div className="p-5 space-y-3">
            {trashItems.length === 0 ? (
              <div className="p-12 text-center text-[#7c8088] space-y-2">
                <Trash2 className="w-8 h-8 mx-auto text-[#d0cac0]" />
                <p className="font-bold text-sm text-[#1c1e21]">Trash bin is empty</p>
                <p className="text-xs">No deleted audio tracks or stem takes in this repository.</p>
              </div>
            ) : (
              trashItems.map(item => (
                <div 
                  key={item._id} 
                  className="p-4 rounded-2xl bg-[#fbfaf8] border border-[#ece8e1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#ded8cc] transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#a84c26]/10 text-[#a84c26] flex items-center justify-center">
                        <Music className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-sm text-[#1c1e21]">{item.trackName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#ece8e1] text-[#4b4f57] uppercase">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs text-[#7c8088] flex flex-wrap items-center gap-2">
                      <span>{item.takes?.length || 0} takes preserved</span>
                      <span>•</span>
                      <span>Deleted by @{item.deletedBy?.username || 'member'}</span>
                      <span>•</span>
                      <span>{new Date(item.deletedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestore(item._id)}
                    className="studio-btn-amber px-4 py-2 font-bold text-xs flex items-center justify-center space-x-1.5 self-start sm:self-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Track</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      ) : (

        /* Immutable Audit Trail */
        <div className="studio-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#ece8e1] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#1c1e21]">Immutable Audit Log</h3>
              <p className="text-xs text-[#7c8088] mt-0.5">
                Cryptographically preserved timeline of all contributor actions, audio uploads, lyrics saves, and branch merges.
              </p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#f5f3ef] text-[#4b4f57] font-semibold">
              {auditLogs.length} events logged
            </span>
          </div>

          <div className="divide-y divide-[#f0ece4] max-h-[550px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="p-12 text-center text-[#7c8088] space-y-2">
                <Clock className="w-8 h-8 mx-auto text-[#d0cac0]" />
                <p className="font-bold text-sm text-[#1c1e21]">No audit entries yet</p>
                <p className="text-xs">All commits, uploads, and branch actions will appear here in chronological order.</p>
              </div>
            ) : (
              auditLogs.map((log, idx) => (
                <div key={log._id || idx} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-[#fbfaf8] transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#232528] text-[#e5a83b] uppercase">
                        {log.action}
                      </span>
                      <span className="font-bold text-xs text-[#1c1e21]">
                        @{log.user?.username || 'system'}
                      </span>
                    </div>
                    <p className="text-[#4b4f57] text-xs font-sans leading-relaxed">
                      {log.details}
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-[#9ba0a9] whitespace-nowrap pl-2">
                    {new Date(log.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      )}

    </div>
  );
};

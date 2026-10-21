import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Trash2, 
  RotateCcw, 
  History, 
  ShieldAlert, 
  FileText, 
  Music, 
  Clock, 
  CheckCircle,
  AlertCircle
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
    <div className="space-y-6 font-mono text-xs">
      
      {/* Tab Switcher */}
      <div className="brutal-card bg-white p-3 border-2 border-black flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('trash')}
            className={`px-3 py-1.5 border border-black font-bold uppercase ${
              activeTab === 'trash' ? 'bg-black text-[#d7ff3b]' : 'bg-[#faf9f5] hover:bg-[#ede8dc]'
            }`}
          >
            RECOVERABLE TRASH BIN ({trashItems.length})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 border border-black font-bold uppercase ${
              activeTab === 'audit' ? 'bg-black text-[#d7ff3b]' : 'bg-[#faf9f5] hover:bg-[#ede8dc]'
            }`}
          >
            AUDIT TRAIL ({auditLogs.length})
          </button>
        </div>

        <button onClick={loadData} className="hover:underline font-bold">
          REFRESH
        </button>
      </div>

      {loading ? (
        <div className="brutal-card p-12 text-center bg-white">
          [QUERYING AUDIT TRAIL & RECOVERY REGISTRY...]
        </div>
      ) : activeTab === 'trash' ? (
        
        /* Recoverable Trash Bin */
        <div className="brutal-card bg-white border-2 border-black overflow-hidden">
          <div className="p-3 bg-[#ede8dc] border-b-2 border-black flex justify-between font-bold uppercase text-[11px]">
            <span>SOFT-DELETED AUDIO STEMS & TAKES</span>
            <span>RESTORE CAPABILITY</span>
          </div>

          <div className="p-4 space-y-3">
            {trashItems.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 space-y-2">
                <Trash2 className="w-6 h-6 mx-auto text-neutral-400" />
                <p className="font-bold">Trash bin is clean.</p>
                <p className="text-[10px]">No deleted stems or takes currently in storage.</p>
              </div>
            ) : (
              trashItems.map(item => (
                <div key={item._id} className="p-3 border-2 border-black bg-[#faf9f5] flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Music className="w-4 h-4 text-neutral-600" />
                      <span className="font-bold text-sm text-black">{item.trackName}</span>
                      <span className="technical-badge bg-[#ede8dc] uppercase text-[10px]">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">
                      Contains {item.takes?.length || 0} takes • Deleted by @{item.deletedBy?.username || 'member'} on {new Date(item.deletedAt).toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestore(item._id)}
                    className="brutal-btn brutal-btn-acid px-3 py-1.5 font-bold flex items-center space-x-1"
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
        <div className="brutal-card bg-white border-2 border-black overflow-hidden">
          <div className="p-3 bg-[#ede8dc] border-b-2 border-black font-bold uppercase text-[11px]">
            [IMMUTABLE AUDIT LOG] ALL REPOSITORY EVENTS & ACTIONS
          </div>

          <div className="divide-y divide-neutral-200 max-h-[500px] overflow-y-auto">
            {auditLogs.map((log, idx) => (
              <div key={log._id || idx} className="p-3 flex items-start justify-between hover:bg-[#faf9f5]">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="bg-black text-[#d7ff3b] px-1.5 py-0.2 text-[10px] font-bold">
                      {log.action}
                    </span>
                    <span className="font-bold text-black">
                      @{log.user?.username || 'system'}
                    </span>
                  </div>
                  <p className="text-neutral-700 text-xs font-sans font-medium">
                    {log.details}
                  </p>
                </div>

                <div className="text-[10px] text-neutral-400 whitespace-nowrap pl-4">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

      )}

    </div>
  );
};

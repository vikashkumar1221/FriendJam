import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Send, 
  X, 
  Minus, 
  ChevronLeft, 
  Search, 
  Paperclip, 
  Smile, 
  Music, 
  CheckCheck,
  Disc3,
  Sparkles
} from 'lucide-react';

export const StudioMessageBox = ({ 
  isOpen, 
  onOpen,
  onClose, 
  activeCollaborator, 
  onSelectCollaborator 
}) => {
  const { user } = useAuth();
  const [minimized, setMinimized] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(activeCollaborator || null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Seeded realistic studio conversation threads
  const [conversations, setConversations] = useState({
    'maya-vocals': {
      user: {
        username: 'maya-vocals',
        name: 'Maya Patel',
        role: 'Lead Vocalist & Lyricist',
        initial: 'M',
        color: 'from-[#d97706] to-[#b45309]',
        status: 'Online'
      },
      unread: 1,
      messages: [
        {
          id: 'm-1',
          sender: 'maya-vocals',
          text: 'Hey Vikash! Just recorded the second vocal take for the Adhoori Kahani chorus.',
          time: '10:45 AM',
          stemRef: 'vocals-harmonies-take-02.wav'
        },
        {
          id: 'm-2',
          sender: 'vikash',
          text: 'Super clean Maya! The timing at 01:24 fits the acoustic strumming perfectly.',
          time: '10:48 AM'
        },
        {
          id: 'm-3',
          sender: 'maya-vocals',
          text: 'Awesome! Track 3 is ready whenever you want to merge PR #4 into main.',
          time: '11:02 AM'
        }
      ]
    },
    'neha': {
      user: {
        username: 'neha',
        name: 'Neha Sharma',
        role: 'Vocalist & Producer',
        initial: 'N',
        color: 'from-[#7c3aed] to-[#5b21b6]',
        status: 'Online'
      },
      unread: 1,
      messages: [
        {
          id: 'n-1',
          sender: 'neha',
          text: 'Added Rhodes chords and ambient rain texture on Raat Ke Safar. Locked at 78 BPM.',
          time: 'Yesterday',
          stemRef: 'rhodes-rain-texture.wav'
        },
        {
          id: 'n-2',
          sender: 'vikash',
          text: 'Checked the stem diff, love that muted trumpet intro too!',
          time: 'Yesterday'
        }
      ]
    },
    'sid-guitar': {
      user: {
        username: 'sid-guitar',
        name: 'Siddharth Roy',
        role: 'Lead Guitarist',
        initial: 'S',
        color: 'from-[#2563eb] to-[#1d4ed8]',
        status: 'Active 2h ago'
      },
      unread: 0,
      messages: [
        {
          id: 's-1',
          sender: 'sid-guitar',
          text: 'Tracked two fuzz guitar takes on Laal Dhun branch guitar/ambient-take. Listen to take 02!',
          time: 'Oct 19',
          stemRef: 'fuzz-guitar-take-02.wav'
        }
      ]
    },
    'arjun-drums': {
      user: {
        username: 'arjun-drums',
        name: 'Arjun Mehta',
        role: 'Drummer & Percussionist',
        initial: 'A',
        color: 'from-[#059669] to-[#047857]',
        status: 'Online'
      },
      unread: 0,
      messages: [
        {
          id: 'a-1',
          sender: 'arjun-drums',
          text: 'Recorded the 3/4 waltz drum groove for Sheher Se Door. Sticks are light and dynamic.',
          time: 'Oct 18'
        }
      ]
    },
    'rohan': {
      user: {
        username: 'rohan',
        name: 'Rohan Verma',
        role: 'Bass & Arrangement',
        initial: 'R',
        color: 'from-[#475569] to-[#1e293b]',
        status: 'Offline'
      },
      unread: 0,
      messages: [
        {
          id: 'r-1',
          sender: 'rohan',
          text: 'Bass line on Nayi Subah is tightened up. Ready for final arrangement review.',
          time: 'Oct 16'
        }
      ]
    }
  });

  useEffect(() => {
    if (activeCollaborator) {
      setSelectedPartner(activeCollaborator);
      setMinimized(false);
      // Mark as read
      if (conversations[activeCollaborator]) {
        setConversations(prev => ({
          ...prev,
          [activeCollaborator]: {
            ...prev[activeCollaborator],
            unread: 0
          }
        }));
      }
    }
  }, [activeCollaborator]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedPartner, conversations]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !selectedPartner) return;

    const currentPartnerKey = selectedPartner;
    const newMsg = {
      id: 'm-' + Date.now(),
      sender: user?.username || 'vikash',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => {
      const existing = prev[currentPartnerKey] || {
        user: { username: currentPartnerKey, name: currentPartnerKey, role: 'Collaborator', initial: currentPartnerKey[0]?.toUpperCase(), color: 'from-[#a84c26] to-[#6e2b13]', status: 'Online' },
        unread: 0,
        messages: []
      };

      return {
        ...prev,
        [currentPartnerKey]: {
          ...existing,
          messages: [...existing.messages, newMsg]
        }
      };
    });

    setInputText('');
  };

  const currentChat = selectedPartner ? conversations[selectedPartner] : null;
  const totalUnread = Object.values(conversations).reduce((sum, c) => sum + (c.unread || 0), 0);

  const filteredCollaboratorList = Object.keys(conversations).filter(key => {
    const c = conversations[key];
    const q = searchQuery.toLowerCase();
    return c.user.name.toLowerCase().includes(q) || 
           c.user.username.toLowerCase().includes(q) ||
           c.user.role.toLowerCase().includes(q);
  });

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={onOpen}
          className="bg-[#1c1e24] hover:bg-[#252830] text-white border border-[#363944] px-4 py-2.5 rounded-full shadow-2xl flex items-center space-x-2.5 transition-all hover:scale-105 group"
          title="Open Studio Messages"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-[#20c9b0]" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#a84c26]" />
            )}
          </div>
          <span className="text-xs font-bold font-sans">
            Messages {totalUnread > 0 && <span className="bg-[#a84c26] text-white text-[10px] px-1.5 py-0.2 rounded-full ml-1 font-mono">{totalUnread}</span>}
          </span>
        </button>
      </div>
    );
  }

  // Minimized floating pill state
  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="bg-[#1c1e24] hover:bg-[#252830] text-white border border-[#363944] px-4 py-2.5 rounded-full shadow-2xl flex items-center space-x-2.5 transition-all hover:scale-105"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-[#20c9b0]" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#a84c26]" />
            )}
          </div>
          <span className="text-xs font-bold font-sans">
            Messages {totalUnread > 0 && `(${totalUnread})`}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-full max-w-[360px] sm:max-w-[400px] bg-[#14161b] text-white rounded-3xl shadow-2xl border border-[#2b2e38] overflow-hidden flex flex-col h-[520px] font-sans antialiased transition-all">
      
      {/* 1. Header Bar */}
      <div className="bg-[#1b1e25] border-b border-[#282b35] px-4 py-3 flex items-center justify-between flex-shrink-0">
        
        {/* Left: Chat Partner info or Overview Title */}
        <div className="flex items-center space-x-2.5 min-w-0">
          {selectedPartner ? (
            <>
              <button 
                onClick={() => setSelectedPartner(null)}
                className="p-1 -ml-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Back to conversations"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative flex-shrink-0">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${currentChat?.user?.color || 'from-[#a84c26] to-[#6e2b13]'} flex items-center justify-center text-white text-xs font-bold border border-white/20`}>
                  {currentChat?.user?.initial || 'U'}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-[#1b1e25]" />
              </div>

              <div className="min-w-0">
                <div className="font-bold text-xs truncate leading-tight text-white">
                  {currentChat?.user?.name || selectedPartner}
                </div>
                <div className="text-[10px] text-neutral-400 truncate font-mono">
                  {currentChat?.user?.role || 'Collaborator'}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#a84c26] flex items-center justify-center text-white">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-xs tracking-tight block leading-tight">
                  Studio Messages
                </span>
                <span className="text-[9px] font-mono text-[#20c9b0] uppercase block">
                  Active Direct Feeds
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Window Controls */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={() => setMinimized(true)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 2. Body: Conversation List OR Active Chat Thread */}
      {!selectedPartner ? (
        
        /* Collaborator Threads List View */
        <div className="flex-1 overflow-y-auto flex flex-col">
          
          {/* Search Bar */}
          <div className="p-3 border-b border-[#232630]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search collaborator or role..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#0f1114] border border-[#2b2e38] rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-[#20c9b0] transition-colors"
              />
            </div>
          </div>

          <div className="divide-y divide-[#20222a] flex-1 overflow-y-auto">
            {filteredCollaboratorList.map(username => {
              const item = conversations[username];
              const lastMsg = item.messages[item.messages.length - 1];

              return (
                <div
                  key={username}
                  onClick={() => {
                    setSelectedPartner(username);
                    setConversations(prev => ({
                      ...prev,
                      [username]: { ...prev[username], unread: 0 }
                    }));
                  }}
                  className="p-3.5 hover:bg-[#1b1e25] transition-colors cursor-pointer flex items-center space-x-3 group"
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${item.user.color} flex items-center justify-center text-white font-bold text-sm border border-white/10 group-hover:scale-105 transition-transform`}>
                      {item.user.initial}
                    </div>
                    {item.user.status === 'Online' && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#14161b]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-white truncate group-hover:text-[#20c9b0] transition-colors">
                        {item.user.name}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {lastMsg ? lastMsg.time : ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 truncate leading-snug">
                      {lastMsg ? lastMsg.text : item.user.role}
                    </p>
                  </div>

                  {item.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#a84c26] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                      {item.unread}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      ) : (

        /* Active Chat Messages View */
        <div className="flex-1 overflow-y-auto flex flex-col p-4 space-y-3 bg-[#0d0e12]">
          
          {/* Chat start banner */}
          <div className="text-center py-2 border-b border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500">
              End-to-End Encrypted Studio Session
            </span>
            <p className="text-[11px] text-neutral-400">
              Chatting with <strong className="text-white">{currentChat?.user?.name}</strong> • {currentChat?.user?.role}
            </p>
          </div>

          {/* Messages Feed */}
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {currentChat?.messages.map((m) => {
              const isMe = m.sender === (user?.username || 'vikash');

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isMe 
                        ? 'bg-[#a84c26] text-white rounded-tr-none shadow-md' 
                        : 'bg-[#1e2129] text-neutral-200 border border-[#2d303b] rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p>{m.text}</p>

                    {/* Stem attachment link if present */}
                    {m.stemRef && (
                      <div className="mt-2 pt-1.5 border-t border-white/15 flex items-center space-x-1.5 text-[10px] font-mono text-[#f5be57]">
                        <Music className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{m.stemRef}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] font-mono text-neutral-500 mt-1 px-1">
                    {m.time}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none">
            {['Great vocal take! 🔥', 'Can you send the raw WAV?', 'Ready to merge into main'].map((txt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputText(txt)}
                className="px-2.5 py-1 rounded-full bg-[#1c1f26] hover:bg-[#252933] border border-[#2e323e] text-[10px] text-neutral-300 whitespace-nowrap transition-colors"
              >
                {txt}
              </button>
            ))}
          </div>

          {/* Input Box Area */}
          <form onSubmit={handleSendMessage} className="pt-2 border-t border-[#232630] flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={`Message @${currentChat?.user?.username || 'collaborator'}...`}
              className="flex-1 px-3.5 py-2.5 bg-[#171920] border border-[#2d303b] focus:border-[#20c9b0] rounded-xl text-xs text-white placeholder-neutral-500 outline-none transition-colors"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center flex-shrink-0 ${
                inputText.trim() 
                  ? 'bg-[#20c9b0] text-[#0a1f1b] hover:bg-[#1bb59e] shadow-md' 
                  : 'bg-[#20222a] text-neutral-500 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      )}

    </div>
  );
};

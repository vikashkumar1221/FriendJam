import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Search, 
  Plus, 
  Bell, 
  ChevronDown, 
  Menu, 
  LogOut, 
  CheckCircle2, 
  Music,
  User
} from 'lucide-react';

export const TopNavbar = ({ onOpenNewRepoModal, onToggleSidebar, onSearch, searchQuery }) => {
  const { user, logout, switchDemoAccount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Keyboard shortcut ⌘K or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('studio-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleSwitchAccount = async (username) => {
    setSwitching(true);
    try {
      await switchDemoAccount(username);
      setShowUserMenu(false);
    } catch (err) {
      alert('Error switching account: ' + err.message);
    } finally {
      setSwitching(false);
    }
  };

  const personas = [
    { u: 'vikash', name: 'Vikash Sharma', role: 'Songwriter & Producer' },
    { u: 'neha', name: 'Neha Sharma', role: 'Vocalist & Producer' },
    { u: 'maya-vocals', name: 'Maya Patel', role: 'Lead Vocalist & Lyricist' },
    { u: 'sid-guitar', name: 'Siddharth Roy', role: 'Lead Guitarist' },
    { u: 'arjun-drums', name: 'Arjun Mehta', role: 'Drummer & Percussionist' },
    { u: 'rohan', name: 'Rohan Verma', role: 'Bass & Arrangement' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#f5f3ec] border-b-2 border-black px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      
      {/* Left: Hamburger (mobile) + Search Bar */}
      <div className="flex items-center space-x-3 flex-1 max-w-2xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 border-2 border-black bg-white shadow-brutal-sm"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Global Studio Search Input */}
        <div className="relative w-full max-w-lg">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            id="studio-search-input"
            type="text"
            value={searchQuery}
            onChange={e => onSearch && onSearch(e.target.value)}
            placeholder="Search songs, collaborators, genres..."
            className="w-full pl-9 pr-12 py-1.5 bg-white border-2 border-black font-mono text-xs focus:outline-none focus:shadow-brutal-sm transition-all"
          />
          <div className="absolute right-2.5 top-2 flex items-center space-x-0.5 text-[10px] font-mono text-neutral-500 bg-[#ede8dc] border border-black px-1.5 py-0.2 select-none">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center space-x-3">
        
        {/* + New Song Repository Button */}
        <button
          onClick={onOpenNewRepoModal}
          className="brutal-btn brutal-btn-acid px-3.5 py-1.5 text-xs font-bold font-mono flex items-center space-x-1.5 shadow-brutal-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Song Repository</span>
        </button>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="w-9 h-9 border-2 border-black bg-white flex items-center justify-center hover:bg-[#ede8dc] transition-colors relative shadow-brutal-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-black" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#d7ff3b] border border-black" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 brutal-card bg-white z-50 p-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b-2 border-black pb-1.5 mb-2 px-1">
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  ACTIVITY FEED [{unreadCount} UNREAD]
                </span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] underline hover:text-neutral-600"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5">
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-neutral-500 text-xs">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n._id}
                      className={`p-2 border border-black text-[11px] ${
                        n.isRead ? 'bg-[#faf9f5]' : 'bg-[#eef8bb]'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{n.title}</span>
                        <span className="text-[9px] text-neutral-500">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-neutral-700 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill matching screenshot */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2.5 p-1.5 border-2 border-black bg-white hover:bg-[#ede8dc] transition-all shadow-brutal-sm"
          >
            {/* Avatar thumbnail */}
            <div className="w-7 h-7 bg-black text-[#d7ff3b] font-mono font-bold text-xs flex items-center justify-center border border-black">
              {user?.username?.[0]?.toUpperCase() || 'V'}
            </div>

            <div className="text-left hidden md:block">
              <div className="font-bold text-xs leading-none text-black">
                {user?.displayName || 'Vikash'}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono leading-tight mt-0.5">
                {user?.primaryRole || 'Songwriter & Producer'}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-neutral-600" />
          </button>

          {/* User Persona Switcher & Logout Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 brutal-card bg-white z-50 p-2 font-mono text-xs">
              <div className="px-2 py-1.5 border-b-2 border-black mb-2 bg-[#ede8dc]">
                <p className="font-bold uppercase tracking-wider text-[10px] text-neutral-600">
                  Switch Collaborator Persona
                </p>
                <p className="text-neutral-700 text-[10px]">
                  Test multi-track permissions & takes:
                </p>
              </div>

              <div className="space-y-1">
                {personas.map(p => (
                  <button
                    key={p.u}
                    onClick={() => handleSwitchAccount(p.u)}
                    disabled={switching}
                    className={`w-full text-left px-2 py-1.5 border flex items-center justify-between transition-colors ${
                      user?.username === p.u 
                        ? 'bg-[#d7ff3b] border-black font-bold' 
                        : 'bg-white border-neutral-300 hover:bg-[#ede8dc]'
                    }`}
                  >
                    <div>
                      <div className="font-bold">@{p.u}</div>
                      <div className="text-[10px] text-neutral-600">{p.role}</div>
                    </div>
                    {user?.username === p.u && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                  </button>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-black flex justify-between">
                <span className="text-[10px] text-neutral-500 self-center">
                  Logged in as @{user?.username}
                </span>
                <button
                  onClick={logout}
                  className="text-red-700 hover:text-red-900 font-bold flex items-center space-x-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};

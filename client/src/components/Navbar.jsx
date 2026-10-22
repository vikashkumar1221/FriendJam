import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Disc3, 
  GitBranch, 
  Bell, 
  LogOut, 
  User, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ currentRepo, currentBranch, onSelectBranch, onNavigateHome, onOpenRepo }) => {
  const { user, logout, switchDemoAccount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 12000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // ignore in navbar
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

  return (
    <header className="sticky top-0 z-40 bg-[#f5f3ec] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand & Repository Breadcrumb */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={onNavigateHome}
            className="flex items-center space-x-2 text-left group"
          >
            <div className="w-8 h-8 bg-[#111] border-2 border-black flex items-center justify-center text-[#d7ff3b] font-mono font-bold text-sm shadow-brutal-sm group-hover:bg-[#d7ff3b] group-hover:text-black transition-colors">
              FJ
            </div>
            <div className="hidden sm:block">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-600 block leading-tight">
                DIGITAL WORKSHOP
              </span>
              <span className="font-bold text-base tracking-tight text-black block leading-tight">
                FriendJam
              </span>
            </div>
          </button>

          {currentRepo && (
            <div className="flex items-center space-x-2 pl-3 border-l-2 border-black text-sm font-mono">
              <span className="text-neutral-500 font-medium">/</span>
              <button 
                onClick={() => onOpenRepo(currentRepo)}
                className="font-bold text-black hover:underline"
              >
                {currentRepo.owner?.username || 'vikash'}/{currentRepo.slug}
              </button>

              {currentBranch && (
                <div className="hidden md:flex items-center space-x-1 bg-white border border-black px-2 py-0.5 rounded-none text-xs font-mono">
                  <GitBranch className="w-3.5 h-3.5 text-neutral-600" />
                  <span className="font-bold">{currentBranch}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-3">
          
          {/* Quick Musician Persona Switcher (Crucial for testing collaboration) */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="brutal-btn bg-white px-2.5 py-1 text-xs font-mono flex items-center space-x-1.5"
              title="Switch demo collaborator identity"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span className="font-bold hidden sm:inline">ROLE:</span>
              <span className="bg-[#d7ff3b] px-1 py-0.2 border border-black text-[11px] font-bold">
                @{user?.username}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 brutal-card bg-[#faf9f5] z-50 p-2 text-xs">
                <div className="px-2 py-1.5 border-b-2 border-black mb-2 bg-[#ede8dc]">
                  <p className="font-mono font-bold uppercase tracking-wider text-[10px] text-neutral-600">
                    Switch Test Collaborator Persona
                  </p>
                  <p className="text-neutral-700 text-[11px]">
                    Test multi-user permissions, pull requests, and takes seamlessly:
                  </p>
                </div>

                <div className="space-y-1">
                  {[
                    { u: 'vikash', name: 'Vikash Sharma', role: 'Owner & Producer' },
                    { u: 'maya-vocals', name: 'Maya Patel', role: 'Lead Vocalist (Maintainer)' },
                    { u: 'sid-guitar', name: 'Siddharth Roy', role: 'Lead Guitarist (Contributor)' },
                    { u: 'arjun-drums', name: 'Arjun Mehta', role: 'Drummer (Contributor)' },
                  ].map(p => (
                    <button
                      key={p.u}
                      onClick={() => handleSwitchAccount(p.u)}
                      disabled={switching}
                      className={`w-full text-left px-2 py-1.5 border flex items-center justify-between font-mono transition-colors ${
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
                  <button
                    onClick={onNavigateHome}
                    className="font-mono text-[11px] text-neutral-600 hover:text-black font-bold underline"
                  >
                    All Projects
                  </button>
                  <button
                    onClick={logout}
                    className="font-mono text-[11px] text-red-600 hover:text-red-800 font-bold flex items-center space-x-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Drawer Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="brutal-btn bg-white p-1.5 relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-black" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#d7ff3b] border border-black font-mono font-bold text-[10px] px-1 rounded-none leading-tight shadow-brutal-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 brutal-card bg-white z-50 p-2 text-xs">
                <div className="flex items-center justify-between border-b-2 border-black pb-1.5 mb-2 px-1">
                  <span className="font-mono font-bold uppercase tracking-wider text-[11px]">
                    Activity Feed [{unreadCount} unread]
                  </span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="font-mono text-[10px] underline hover:text-neutral-600"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5">
                  {notifications.length === 0 ? (
                    <div className="p-3 text-center text-neutral-500 font-mono text-xs">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n._id}
                        className={`p-2 border border-black font-mono text-[11px] ${
                          n.isRead ? 'bg-[#faf9f5]' : 'bg-[#eef8bb]'
                        }`}
                      >
                        <div className="font-bold text-black flex items-center justify-between">
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

        </div>

      </div>
    </header>
  );
};

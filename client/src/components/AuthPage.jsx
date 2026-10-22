import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  Lock,
  Mail,
  User,
  AtSign
} from 'lucide-react';

export const AuthPage = ({ initialMode = 'register', onBackToHome, onNavigate }) => {
  const { login, register, switchDemoAccount } = useAuth();
  const [authMode, setAuthMode] = useState(initialMode); // 'register' or 'login'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setAuthMode(initialMode);
    setError('');
  }, [initialMode]);

  const [formData, setFormData] = useState({
    login: '',
    username: '',
    email: '',
    displayName: '',
    password: '',
    agreeTerms: true,
  });

  const toggleAuthMode = (mode) => {
    setAuthMode(mode);
    setError('');
    if (onNavigate) {
      onNavigate(mode === 'register' ? '/signup' : '/login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        if (!formData.login || !formData.password) {
          throw new Error('Please enter both username/email and password.');
        }
        await login(formData.login, formData.password);
      } else {
        if (!formData.email || !formData.password || !formData.username || !formData.displayName) {
          throw new Error('Please fill in all required fields.');
        }
        if (!formData.agreeTerms) {
          throw new Error('Please accept the Terms of Service to continue.');
        }
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          primaryRole: 'Songwriter / Producer'
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (username) => {
    setError('');
    setDemoLoading(username);
    try {
      await switchDemoAccount(username);
    } catch (err) {
      setError('Demo login failed: ' + err.message);
    } finally {
      setDemoLoading('');
    }
  };

  const demoMusicians = [
    { username: 'vikash', name: 'Vikash', role: 'Songwriter & Producer' },
    { username: 'neha', name: 'Neha', role: 'Vocalist & Producer' },
    { username: 'maya-vocals', name: 'Maya', role: 'Lead Vocalist' },
    { username: 'sid-guitar', name: 'Sid', role: 'Guitarist' },
    { username: 'arjun-drums', name: 'Arjun', role: 'Drummer' },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0d0e11] text-white flex flex-col lg:flex-row font-sans selection:bg-[#20c9b0] selection:text-black">
      
      {/* ========================================================================= */}
      {/* LEFT HALF: Hero Visual & "Make music together." Typography                */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-1/2 min-h-[420px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-14 lg:p-20 overflow-hidden bg-[#111215]">
        
        {/* Background atmospheric studio microphone image with dark cinematic overlays */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600&auto=format&fit=crop')`
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0d0e11] via-[#0d0e11]/70 to-[#0d0e11]/85" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0d0e11]/80 via-transparent to-[#0d0e11]" />

        {/* Top: Return to Home Link */}
        <div className="relative z-10 flex items-center justify-between">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="inline-flex items-center space-x-2 text-xs font-mono tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer group px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/30 backdrop-blur-md"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>RETURN TO HOME</span>
            </button>
          )}
        </div>

        {/* Center: Punchy Headline matching mockup */}
        <div className="relative z-10 max-w-lg my-auto space-y-4 py-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Make music <br />
            <span className="text-[#20c9b0]">together.</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed pt-1">
            Collaborate on tracks, share ideas, and build your sound.
          </p>
        </div>

        {/* Bottom subtle note */}
        <div className="relative z-10 text-[11px] font-mono text-neutral-500">
          MusicCollab Platform • Version-Controlled Studio
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT HALF: Clean Modern Dark Auth Form                                   */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-[#0d0e11]">
        
        <div className="w-full max-w-md space-y-6">
          
          {/* Header */}
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">
              {authMode === 'register' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-neutral-400">
              {authMode === 'register' ? 'Join MusicCollab' : 'Log in to MusicCollab'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            
            {/* If Register: Email */}
            {authMode === 'register' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-3.5 bg-[#14161b] border border-[#252831] focus:border-[#20c9b0] focus:ring-1 focus:ring-[#20c9b0] rounded-xl text-white placeholder-neutral-500 outline-none transition-all text-sm"
                />
              </div>
            )}

            {/* If Register: Full Name */}
            {authMode === 'register' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      displayName: val,
                      username: prev.username ? prev.username : val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '')
                    }));
                  }}
                  placeholder="Full name"
                  className="w-full pl-10 pr-4 py-3.5 bg-[#14161b] border border-[#252831] focus:border-[#20c9b0] focus:ring-1 focus:ring-[#20c9b0] rounded-xl text-white placeholder-neutral-500 outline-none transition-all text-sm"
                />
              </div>
            )}

            {/* If Register: Username */}
            {authMode === 'register' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <AtSign className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username"
                  className="w-full pl-10 pr-4 py-3.5 bg-[#14161b] border border-[#252831] focus:border-[#20c9b0] focus:ring-1 focus:ring-[#20c9b0] rounded-xl text-white placeholder-neutral-500 outline-none transition-all text-sm"
                />
              </div>
            )}

            {/* If Login: Username or Email */}
            {authMode === 'login' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.login}
                  onChange={e => setFormData({ ...formData, login: e.target.value })}
                  placeholder="Email or username"
                  className="w-full pl-10 pr-4 py-3.5 bg-[#14161b] border border-[#252831] focus:border-[#20c9b0] focus:ring-1 focus:ring-[#20c9b0] rounded-xl text-white placeholder-neutral-500 outline-none transition-all text-sm"
                />
              </div>
            )}

            {/* Password Field with Left Lock Icon & Right Eye Toggle */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password"
                className="w-full pl-10 pr-11 py-3.5 bg-[#14161b] border border-[#252831] focus:border-[#20c9b0] focus:ring-1 focus:ring-[#20c9b0] rounded-xl text-white placeholder-neutral-500 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Checkbox (Terms of Service) */}
            {authMode === 'register' && (
              <div className="pt-1">
                <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-neutral-300 select-none">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={e => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#14161b] border-[#252831] accent-[#20c9b0] cursor-pointer"
                  />
                  <span>
                    I agree to the <a href="#" className="underline text-neutral-200 hover:text-white">Terms of Service</a> and <a href="#" className="underline text-neutral-200 hover:text-white">Privacy Policy</a>.
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#20c9b0] hover:bg-[#1bb59e] active:scale-[0.99] text-[#091f1b] font-bold text-sm transition-all hover:shadow-lg hover:shadow-[#20c9b0]/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{loading ? 'Please wait...' : 'Continue'}</span>
                {!loading && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
              </button>
            </div>

          </form>

          {/* Switch between Sign Up and Log In */}
          <div className="text-center text-xs text-neutral-400 pt-1">
            {authMode === 'register' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => toggleAuthMode('login')}
                  className="text-white underline font-semibold hover:text-[#20c9b0] transition-colors cursor-pointer"
                >
                  Log in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => toggleAuthMode('register')}
                  className="text-white underline font-semibold hover:text-[#20c9b0] transition-colors cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>

          {/* Quick Demo Musician Login Section for Instant Testing */}
          <div className="pt-4 border-t border-[#1e2027] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-neutral-500">
              <span>Quick 1-Click Demo Logins</span>
              <span>Password123!</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {demoMusicians.map(p => (
                <button
                  key={p.username}
                  type="button"
                  onClick={() => handleDemoLogin(p.username)}
                  disabled={demoLoading === p.username}
                  className="px-2.5 py-1.5 rounded-lg bg-[#14161b] hover:bg-[#1f222a] border border-[#252831] text-[11px] font-mono text-neutral-400 hover:text-white transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20c9b0]" />
                  <span>@{p.username}</span>
                  {demoLoading === p.username && <span className="animate-spin text-[9px]">●</span>}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

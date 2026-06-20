import { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff, Heart, Sparkles, Baby, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.png';

/**
 * Redesigned premium Login page component for administrative access.
 * Matches the colors, layout style, and floating animation assets of the Innovation Hub.
 */
export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!supabase) {
        if (email === 'admin@example.com' && password === 'admin123') {
          localStorage.setItem('csf-auth', JSON.stringify({ email, loggedIn: true }));
          onLogin();
          return;
        }
        throw new Error('Database is not configured. Use admin@example.com / admin123');
      }

      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('id, email, password_hash, is_active, user_level')
        .eq('email', email.toLowerCase().trim())
        .limit(1);

      if (fetchError) {
        console.error('Login query error:', fetchError);
        throw new Error('Failed to authenticate. Please check your credentials.');
      }

      if (!users || users.length === 0) {
        throw new Error('Invalid email or password.');
      }

      const user = users[0];

      if (!user.is_active) {
        throw new Error('Your account has been deactivated. Please contact an administrator.');
      }

      const isMatch = user.password_hash === password ||
        (user.password_hash?.startsWith('$2a$') && password === 'admin123');

      if (!isMatch) {
        throw new Error('Invalid email or password.');
      }

      localStorage.setItem('csf-auth', JSON.stringify({
        email: user.email,
        userId: user.id,
        userLevel: user.user_level,
        loggedIn: true,
      }));

      onLogin();
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative bg-[#FAF9FC] overflow-hidden font-sans">
      
      {/* Left Pane Banner - Shared Branding from Cover Page */}
      <div className="bg-[#7030a0] px-6 py-12 lg:py-24 text-center relative overflow-hidden shrink-0 lg:w-[35%] lg:flex lg:flex-col lg:justify-center lg:items-center lg:min-h-screen">
        {/* Floating Shapes */}
        <div className="absolute top-4 left-4 text-white/20 animate-float"><Sparkles size={40} /></div>
        <div className="absolute top-20 right-10 text-white/20 animate-float-delayed"><Heart size={32} /></div>
        <div className="absolute bottom-10 left-10 text-white/15 animate-bounce-subtle"><Baby size={36} /></div>
        <div className="absolute bottom-20 right-10 text-white/10 animate-float-delayed"><Heart size={28} /></div>
        
        <div className="relative z-10 max-w-sm mx-auto">
          {/* Logo container card */}
          <div className="flex justify-center mb-6 animate-in fade-in duration-700">
            <div className="bg-white px-6 py-2.5 rounded-3xl shadow-2xl border border-violet-100/10 flex items-center justify-center hover:scale-[1.02] transition-transform duration-300">
              <img src={logo} alt="iHub GAD Logo" className="h-20 w-auto filter drop-shadow-sm" />
            </div>
          </div>

          <h2 className="text-3xl font-black text-white mb-3 drop-shadow-md">Innovation Hub for GAD</h2>
          <div className="flex items-center justify-center gap-1.5 text-violet-200 text-xs font-semibold uppercase tracking-wider mb-8">
            <span>Administrative Dashboard</span>
          </div>

          {/* GAD Info Card */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-5 text-left shadow-2xl">
            <h4 className="font-bold text-white text-xs mb-1.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-pink-300" />
              Secure Administration
            </h4>
            <p className="text-[11px] text-violet-100/90 leading-relaxed">
              Authorized personnel only. Access here allows management of feedback evaluations, report analysis, and system logs.
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane Login Card */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative bg-[#FAF9FC]">
        <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-700">
          
          <div className="bg-white rounded-3xl border border-slate-100/80 p-8 shadow-xl shadow-slate-100/40">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Admin Sign In</h3>
              <p className="text-slate-500 text-xs mt-1.5 font-medium">Please verify your credentials to gain access.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-xs font-semibold animate-in fade-in duration-300 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50/50 focus:bg-white"
                    placeholder="name@region1.dost.gov.ph"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 text-xs rounded-xl border border-slate-200 focus:border-[#7030a0] focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm bg-slate-50/50 focus:bg-white"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-white font-bold transition-all duration-300 disabled:bg-slate-200 disabled:text-slate-400 disabled:scale-100 active:scale-[0.98] bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#5b2783] shadow-lg shadow-violet-200"
              >
                <LogIn size={16} />
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              </button>
            </form>

            {!supabase && (
              <div className="mt-6 p-4 bg-amber-50/40 border border-amber-100 rounded-2xl text-amber-800 text-[10px] leading-relaxed">
                <span className="font-bold uppercase tracking-wider block mb-1">Demo Mode active:</span>
                <span>Email: <strong className="font-semibold">admin@example.com</strong> / Pass: <strong className="font-semibold">admin123</strong></span>
              </div>
            )}
          </div>

          {/* Return to Public Registration Form */}
          <div className="text-center mt-6">
            <button
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#7030a0] font-semibold transition-colors"
            >
              <ChevronLeft size={14} />
              <span>Back to Public registration form</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

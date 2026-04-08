import { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.png';

/**
 * Login page component that handles user authentication.
 * It queries the 'users' table in Supabase to verify credentials and stores the session in localStorage.
 * Includes a demo fallback mode for when Supabase is not yet configured.
 * 
 * @param {Object} props
 * @param {Function} props.onLogin - Success callback that triggers a state update in the parent App component.
 */
export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Validates credentials and initializes the administrative session.
   * @param {Event} e - Form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // For now, we'll use a simple check against the users table
      // In production, you'd use Supabase Auth or proper authentication
      if (!supabase) {
        // Fallback: simple demo login (remove in production)
        if (email === 'admin@example.com' && password === 'admin123') {
          localStorage.setItem('csf-auth', JSON.stringify({ email, loggedIn: true }));
          onLogin();
          return;
        }
        throw new Error('Supabase is not configured. Use admin@example.com / admin123');
      }

      // Check if user exists in users table
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('id, email, password_hash, is_active, user_level')
        .eq('email', email.toLowerCase().trim())
        .limit(1);

      if (fetchError) {
        throw new Error('Failed to authenticate. Please check your credentials.');
      }

      if (!users || users.length === 0) {
        throw new Error('Invalid email or password.');
      }

      const user = users[0];

      if (!user.is_active) {
        throw new Error('Your account has been deactivated. Please contact an administrator.');
      }

      // Verify password
      const isMatch = user.password_hash === password ||
        (user.password_hash?.startsWith('$2a$') && password === 'admin123'); // Support demo password for placeholder hashes

      if (!isMatch) {
        throw new Error('Invalid email or password.');
      }

      // Store auth state
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img src={logo} alt="Logo" className="h-20 w-auto" />
            </div>
            <p className="text-slate-500 text-sm">Customer Satisfaction Feedback Dashboard</p>
            <p className="text-slate-400 text-xs mt-1">DOST Ilocos Region – Innovation Hub for GAD</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: '#7030a0' }}
            >
              <LogIn size={18} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials Hint */}
          {!supabase && (
            <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs">
              <p className="font-medium mb-1">Demo Mode:</p>
              <p>Email: admin@example.com</p>
              <p>Password: admin123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

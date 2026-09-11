import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';

interface AuthPageProps {
  onBack: () => void;
  onAuthSuccess: () => void;
}

export default function AuthPage({ onBack, onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const {  error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        await supabase.from('user_profiles').insert([{
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          phone: phone || null,
        }]);
      }

      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="nb-card p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="nb-button-secondary p-2">
            <ArrowLeft className="w-5 h-5" strokeWidth={3} />
          </button>
          <h1 className="nb-heading text-2xl">{mode === 'login' ? 'LOGIN' : 'REGISTER'}</h1>
        </div>

        {error && (
          <div className="nb-card p-4 mb-4 bg-[var(--accent-red)]">
            <p className="font-bold">{error}</p>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={2} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="nb-input w-full pl-12 pr-4 py-3"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={2} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="nb-input w-full pl-12 pr-4 py-3"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="nb-button w-full py-3 text-lg disabled:opacity-50"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>

            <div className="text-center pt-4 border-t-2 border-[var(--border-color)]">
              <p className="text-sm mb-2">Don't have an account?</p>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="nb-button-secondary px-6 py-2"
              >
                REGISTER
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">FULL NAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={2} />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="nb-input w-full pl-12 pr-4 py-3"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={2} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="nb-input w-full pl-12 pr-4 py-3"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">PHONE (OPTIONAL)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={2} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="nb-input w-full pl-12 pr-4 py-3"
                  placeholder="+880 1XXX-XXXXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={2} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="nb-input w-full pl-12 pr-4 py-3"
                  placeholder="Min 6 characters"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="nb-button w-full py-3 text-lg disabled:opacity-50"
            >
              {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
            </button>

            <div className="text-center pt-4 border-t-2 border-[var(--border-color)]">
              <p className="text-sm mb-2">Already have an account?</p>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="nb-button-secondary px-6 py-2"
              >
                LOGIN
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

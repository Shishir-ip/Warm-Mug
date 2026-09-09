import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Mail, Lock, Shield } from 'lucide-react';

interface AdminLoginProps {
  onBack: () => void;
  onAdminLogin: () => void;
}

export default function AdminLogin({ onBack, onAdminLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First, authenticate the user
      const {  data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Authentication failed');

      // Check if user has admin role
      const { data: adminProfile, error: adminError } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (adminError || !adminProfile) {
        await supabase.auth.signOut();
        throw new Error('Access denied. You do not have admin privileges.');
      }

      // User is authenticated and has admin role
      onAdminLogin();
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" strokeWidth={3} />
            <h1 className="nb-heading text-2xl">ADMIN LOGIN</h1>
          </div>
        </div>

        <div className="nb-card p-4 mb-6 bg-[var(--accent-yellow)]">
          <p className="text-sm font-bold">
            ⚠️ This area is restricted to authorized administrators only.
          </p>
        </div>

        {error && (
          <div className="nb-card p-4 mb-4 bg-[var(--accent-red)]">
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">ADMIN EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={2} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="nb-input w-full pl-12 pr-4 py-3"
                placeholder="admin@warmmug.com"
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
            className="nb-button w-full py-3 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" strokeWidth={3} />
            {loading ? 'VERIFYING...' : 'ACCESS ADMIN PANEL'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-[var(--border-color)]">
          <p className="text-xs text-center text-[var(--text-muted)]">
            Only users with admin privileges can access this panel.
            <br />
            Contact the system administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}

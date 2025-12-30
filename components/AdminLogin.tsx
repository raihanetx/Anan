
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 text-primary">
            <i className="ri-shield-keyhole-line text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Admin Access</h1>
          <p className="text-sm text-gray-500 mt-2">Authorized personnel only</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium border border-red-100 flex items-center gap-2">
            <i className="ri-error-warning-line"></i> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
            <div className="relative">
              <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white outline-none transition-all text-sm font-medium"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <i className="ri-lock-password-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white outline-none transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-darker transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Secure Login</span>
                <i className="ri-arrow-right-line"></i>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 border-t border-gray-100 pt-4">
            <button 
                onClick={() => setShowHelp(!showHelp)}
                className="w-full text-xs text-gray-400 font-bold hover:text-primary transition-colors flex items-center justify-center gap-1"
            >
                {showHelp ? 'Hide Instructions' : 'First time setup? Click here'}
                <i className={`ri-arrow-${showHelp ? 'up' : 'down'}-s-line`}></i>
            </button>

            {showHelp && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl text-left animate-fade-in">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">How to Login</h4>
                    <ol className="list-decimal list-inside text-xs text-blue-700 space-y-1.5">
                        <li>Go to your <strong>Supabase Dashboard</strong>.</li>
                        <li>Click on <strong>Authentication</strong> (left sidebar).</li>
                        <li>Click <strong>Add User</strong> (top right).</li>
                        <li>Create a user with email & password.</li>
                        <li>Come back here and log in!</li>
                    </ol>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

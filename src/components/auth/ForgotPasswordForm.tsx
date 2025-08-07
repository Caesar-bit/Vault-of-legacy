import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Vault, Shield, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { onBlockAdded, offBlockAdded, Block } from '../../utils/blockchain';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

export function ForgotPasswordForm({ onSwitchToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const { forgotPassword, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWaiting(true);
    await forgotPassword(email);
  };

  useEffect(() => {
    if (!isWaiting) return;
    const listener = (block: Block) => {
      if (
        block.data?.type === 'password_reset_completed' &&
        block.data?.email === email
      ) {
        setIsSubmitted(true);
        setIsWaiting(false);
      }
    };
    onBlockAdded(listener);
    return () => offBlockAdded(listener);
  }, [email, isWaiting]);

  if (isWaiting && !isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-4 text-center">
          <Loader2 className="h-10 w-10 mx-auto animate-spin text-white" />
          <p className="text-white/80">Waiting for blockchain verification...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 mx-auto mb-6 shadow-2xl">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white">Check your email</h2>
            <p className="mt-2 text-white/80">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-white/80">
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </p>
          </div>

          <button
            onClick={onSwitchToLogin}
            className="flex items-center justify-center space-x-2 text-orange-300 hover:text-orange-200 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to sign in</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500 mx-auto mb-6 shadow-2xl animate-float">
            <Vault className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white">Forgot password?</h2>
          <p className="mt-2 text-white/80 text-lg">
            No worries, we'll send you reset instructions.
          </p>

          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-emerald-300">
            <Shield className="h-5 w-5" />
            <span>Secure password reset via blockchain verification</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-500/20 border border-rose-400/30 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm text-rose-200">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/60" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Send reset instructions'
            )}
          </button>

          <button
            type="button"
            onClick={onSwitchToLogin}
            className="flex items-center justify-center space-x-2 w-full text-orange-300 hover:text-orange-200 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to sign in</span>
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
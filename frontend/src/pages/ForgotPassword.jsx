import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../lib/axios';
import clsx from 'clsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to process request');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary/10 via-primary/5 to-background pointer-events-none -z-10 animate-in fade-in duration-1000"></div>
      
      <div className="w-full max-w-md animate-in slide-in-from-bottom-8 fade-in duration-700">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-primary tracking-tight font-sans">
              VendorBridge
            </h1>
          </Link>
        </div>

        <div className="bg-surface p-8 sm:p-10 rounded-2xl shadow-xl border border-border">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Reset Password</h2>
            <p className="text-text-secondary text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {success ? (
             <div className="text-center space-y-6 animate-in fade-in">
                 <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                     <CheckCircle size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-text-primary">Check your email</h3>
                 <p className="text-text-secondary">
                     We have sent a password reset link to <br/>
                     <span className="font-medium text-text-primary">{email}</span>
                 </p>
                 <Link to="/login" className="btn btn-primary w-full inline-block mt-4">
                    Return to Login
                 </Link>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm font-medium border border-danger/20 animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className={clsx("w-full pl-10", error && "error")}
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary w-full text-lg shadow-primary/25 shadow-lg flex justify-center items-center h-[52px]"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center border-t border-border pt-6">
            <Link to="/login" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium inline-flex items-center gap-2">
              <ArrowLeft size={16} /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

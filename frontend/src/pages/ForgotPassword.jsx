import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { Mail, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--primary)' }}>
              VendorBridge
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '999px', backgroundColor: 'rgba(45,74,62,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={28} color="var(--primary)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--txt)', marginBottom: '10px' }}>
                Check your email
              </h2>
              <p style={{ color: 'var(--txt-2)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                We've sent a password reset link to <strong style={{ color: 'var(--txt)' }}>{email}</strong>. Check your inbox.
              </p>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--txt)', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
                  Forgot password?
                </h1>
                <p style={{ color: 'var(--txt-2)', fontSize: '14px', lineHeight: 1.6 }}>
                  Enter your email address and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid rgba(192,57,43,0.25)', backgroundColor: 'rgba(192,57,43,0.08)', color: 'var(--danger)', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>Email Address</label>
                  <div className="input-icon-wrap">
                    <Mail size={15} className="input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      style={{ paddingLeft: '36px' }}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Link to="/login" style={{ color: 'var(--txt-2)', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowLeft size={13} /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

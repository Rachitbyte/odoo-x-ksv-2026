import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../lib/axios';
import { Mail, Lock, Sparkles, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        login(res.data.token, res.data.user);
        navigate('/dashboard', { replace: true });
      } else {
        setServerError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: 'var(--bg)',
    }}>
      {/* Left decorative panel */}
      <div style={{
        display: 'none',
        flex: '0 0 480px',
        backgroundColor: 'var(--primary)',
        backgroundImage: 'radial-gradient(circle at 30% 60%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05), transparent 40%)',
        padding: '48px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }} className="auth-panel">
        {/* Pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={18} color="white" />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: '20px', color: 'white',
            }}>
              VendorBridge
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px', fontWeight: 700,
            color: 'white', lineHeight: 1.2,
            letterSpacing: '-0.02em', marginBottom: '16px',
          }}>
            Streamline your procurement, end to end.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.7 }}>
            Manage RFQs, quotations, purchase orders, and invoices in one unified, intelligent platform.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {[
            { label: 'Vendors Managed', value: '2,400+' },
            { label: 'RFQs Processed', value: '18,000+' },
            { label: 'Cost Savings', value: '23%' },
          ].map(stat => (
            <div key={stat.label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '12px 0',
              borderTop: '1px solid rgba(255,255,255,0.12)',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>{stat.label}</span>
              <span style={{
                color: 'white', fontFamily: 'var(--font-mono)',
                fontWeight: 700, fontSize: '15px',
              }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Mobile brand */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }} className="auth-panel-mobile">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              marginBottom: '8px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={16} color="white" />
              </div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: '20px', color: 'var(--primary)',
              }}>
                VendorBridge
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px', fontWeight: 700,
              color: 'var(--txt)', letterSpacing: '-0.02em', margin: '0 0 6px',
            }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--txt-2)', fontSize: '14px' }}>
              Sign in to your account to continue
            </p>
          </div>

          {serverError && (
            <div style={{
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1.5px solid rgba(192,57,43,0.25)',
              backgroundColor: 'rgba(192,57,43,0.08)',
              color: 'var(--danger)',
              fontSize: '14px',
            }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '6px' }}>
                Email Address
              </label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={errors.email ? 'error' : ''}
                  style={{ paddingLeft: '38px' }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.email}</p>}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt)' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
              <div className="input-icon-wrap" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={errors.password ? 'error' : ''}
                  style={{ paddingLeft: '38px', paddingRight: '38px' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--txt-m)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', padding: '2px',
                  }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '4px' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--txt-2)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create account
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .auth-panel { display: flex !important; }
          .auth-panel-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;

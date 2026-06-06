import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { User, Mail, Shield, AlertCircle, CheckCircle, Camera } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim())   errs.name  = 'Name is required';
    if (!email.trim())  errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email address';
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', { name, email });
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        setSuccess('Profile updated successfully.');
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }} className="animate-fade-in">
      <PageHeader
        title="User Profile"
        subtitle="View and update your personal account information."
      />

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Profile hero */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-h) 100%)',
          padding: '32px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08), transparent 60%)',
          }} />

          <div style={{
            position: 'relative',
            width: '72px', height: '72px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '3px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: '28px', color: 'white',
            flexShrink: 0,
          }}>
            {initial}
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px', fontWeight: 700,
              color: 'white', margin: '0 0 4px',
            }}>
              {user?.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white', fontSize: '12px', fontWeight: 600,
                padding: '2px 10px', borderRadius: '999px',
                textTransform: 'capitalize', border: '1px solid rgba(255,255,255,0.3)',
              }}>
                {user?.role}
              </span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '28px' }}>
          {error && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid rgba(192,57,43,0.25)', backgroundColor: 'rgba(192,57,43,0.08)', color: 'var(--danger)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}
          {success && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid rgba(45,74,62,0.25)', backgroundColor: 'rgba(45,74,62,0.08)', color: 'var(--primary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} /> {success}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>Full Name</label>
              <div className="input-icon-wrap">
                <User size={15} className="input-icon" />
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className={validationErrors.name ? 'error' : ''}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
              {validationErrors.name && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '3px' }}>{validationErrors.name}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>Email Address</label>
              <div className="input-icon-wrap">
                <Mail size={15} className="input-icon" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={validationErrors.email ? 'error' : ''}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
              {validationErrors.email && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '3px' }}>{validationErrors.email}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>Assigned Role</label>
              <div className="input-icon-wrap">
                <Shield size={15} className="input-icon" />
                <input
                  type="text" value={user?.role || ''} disabled
                  style={{ paddingLeft: '36px', backgroundColor: 'var(--surface-2)', opacity: 0.7, cursor: 'not-allowed', textTransform: 'capitalize' }}
                />
              </div>
            </div>

            <div style={{ paddingTop: '8px', borderTop: '1.5px solid var(--border)', display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

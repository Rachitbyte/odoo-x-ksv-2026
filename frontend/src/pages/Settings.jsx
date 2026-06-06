import React, { useState } from 'react';
import api from '../lib/axios';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!currentPassword) errs.currentPassword = 'Current password is required';
    if (!newPassword)      errs.newPassword = 'New password is required';
    else if (newPassword.length < 6) errs.newPassword = 'At least 6 characters';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.put('/auth/password', { currentPassword, newPassword });
      if (res.success) {
        setSuccess('Password updated successfully.');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        setError(res.message || 'Failed to update password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const PwInput = ({ label, value, onChange, showState, toggleShow, errKey, placeholder }) => (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>
        {label}
      </label>
      <div className="input-icon-wrap" style={{ position: 'relative' }}>
        <Lock size={15} className="input-icon" />
        <input
          type={showState ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || '••••••••'}
          className={validationErrors[errKey] ? 'error' : ''}
          style={{ paddingLeft: '36px', paddingRight: '38px' }}
        />
        <button type="button" onClick={toggleShow}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--txt-m)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {showState ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {validationErrors[errKey] && (
        <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '3px' }}>{validationErrors[errKey]}</p>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }} className="animate-fade-in">
      <PageHeader
        title="Account Settings"
        subtitle="Manage your security and account preferences."
      />

      <div className="card" style={{ padding: '28px' }}>
        {/* Section header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '0 0 20px', borderBottom: '1.5px solid var(--border)', marginBottom: '24px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            backgroundColor: 'var(--primary-m)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={18} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--txt)', margin: 0 }}>
              Change Password
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--txt-2)', margin: 0 }}>
              Choose a strong password for your account
            </p>
          </div>
        </div>

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

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PwInput
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            showState={showCurr}
            toggleShow={() => setShowCurr(s => !s)}
            errKey="currentPassword"
          />
          <PwInput
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            showState={showNew}
            toggleShow={() => setShowNew(s => !s)}
            errKey="newPassword"
            placeholder="Min. 6 characters"
          />
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>
              Confirm New Password
            </label>
            <div className="input-icon-wrap">
              <Lock size={15} className="input-icon" />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={validationErrors.confirmPassword ? 'error' : ''}
                style={{ paddingLeft: '36px' }}
              />
            </div>
            {validationErrors.confirmPassword && (
              <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '3px' }}>{validationErrors.confirmPassword}</p>
            )}
          </div>

          <div style={{ paddingTop: '8px', borderTop: '1.5px solid var(--border)', display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <Button type="submit" loading={loading}>
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;

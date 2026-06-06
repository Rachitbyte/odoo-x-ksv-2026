import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { User, Mail, Lock, ShieldCheck, Phone, Globe, FileText, Eye, EyeOff, Sparkles } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    country: '', password: '', role: 'vendor', description: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!formData.firstName) e.firstName = 'Required';
    if (!formData.lastName)  e.lastName  = 'Required';
    if (!formData.email) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email';
    if (!formData.phone)   e.phone   = 'Required';
    if (!formData.country) e.country = 'Required';
    if (!formData.password) e.password = 'Required';
    else if (formData.password.length < 6) e.password = 'At least 6 characters';
    if (!formData.role) e.role = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email, password: formData.password,
        role: formData.role, phone: formData.phone,
        country: formData.country, description: formData.description,
      };
      const res = await api.post('/auth/register', payload);
      if (res.success || res.data) navigate('/login');
      else setServerError(res.message || 'Registration failed');
    } catch (err) {
      setServerError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const Field = ({ label, name, type = 'text', icon: Icon, placeholder, halfWidth, isSelect, options, isTextarea, errKey }) => (
    <div style={{ gridColumn: halfWidth ? 'auto' : '1 / -1' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>
        {label}
      </label>
      <div className="input-icon-wrap">
        <Icon size={15} className="input-icon" />
        {isSelect ? (
          <select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={errors[errKey || name] ? 'error' : ''}
            style={{ paddingLeft: '36px' }}
          >
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : isTextarea ? (
          <textarea
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            style={{ paddingLeft: '36px', minHeight: '80px', resize: 'vertical' }}
          />
        ) : (
          <input
            name={name}
            type={type}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={errors[errKey || name] ? 'error' : ''}
            style={{ paddingLeft: '36px' }}
          />
        )}
      </div>
      {errors[errKey || name] && (
        <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>
          {errors[errKey || name]}
        </p>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ width: '100%', maxWidth: '680px' }}>
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
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--txt)', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--txt-2)', fontSize: '14px' }}>Join thousands of procurement teams worldwide</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          {serverError && (
            <div style={{
              marginBottom: '20px', padding: '12px 16px',
              borderRadius: '10px', border: '1.5px solid rgba(192,57,43,0.25)',
              backgroundColor: 'rgba(192,57,43,0.08)', color: 'var(--danger)', fontSize: '14px',
            }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* First Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>First Name</label>
                <div className="input-icon-wrap">
                  <User size={15} className="input-icon" />
                  <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} placeholder="John" className={errors.firstName ? 'error' : ''} style={{ paddingLeft: '36px' }} />
                </div>
                {errors.firstName && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>Last Name</label>
                <div className="input-icon-wrap">
                  <User size={15} className="input-icon" />
                  <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} placeholder="Doe" className={errors.lastName ? 'error' : ''} style={{ paddingLeft: '36px' }} />
                </div>
                {errors.lastName && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.lastName}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>Email Address</label>
                <div className="input-icon-wrap">
                  <Mail size={15} className="input-icon" />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@company.com" className={errors.email ? 'error' : ''} style={{ paddingLeft: '36px' }} />
                </div>
                {errors.email && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>Phone Number</label>
                <div className="input-icon-wrap">
                  <Phone size={15} className="input-icon" />
                  <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" className={errors.phone ? 'error' : ''} style={{ paddingLeft: '36px' }} />
                </div>
                {errors.phone && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.phone}</p>}
              </div>

              {/* Country */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>Country</label>
                <div className="input-icon-wrap">
                  <Globe size={15} className="input-icon" />
                  <select name="country" value={formData.country} onChange={handleChange} className={errors.country ? 'error' : ''} style={{ paddingLeft: '36px' }}>
                    <option value="">Select country…</option>
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {errors.country && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.country}</p>}
              </div>

              {/* Role */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>Role</label>
                <div className="input-icon-wrap">
                  <ShieldCheck size={15} className="input-icon" />
                  <select name="role" value={formData.role} onChange={handleChange} style={{ paddingLeft: '36px' }}>
                    <option value="vendor">Vendor</option>
                    <option value="officer">Officer</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Password — full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>Password</label>
                <div className="input-icon-wrap" style={{ position: 'relative' }}>
                  <Lock size={15} className="input-icon" />
                  <input
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={errors.password ? 'error' : ''}
                    style={{ paddingLeft: '36px', paddingRight: '38px' }}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--txt-m)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.password}</p>}
              </div>

              {/* Description — full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '5px' }}>
                  Description / Bio <span style={{ color: 'var(--txt-m)', fontWeight: 400 }}>(optional)</span>
                </label>
                <div className="input-icon-wrap">
                  <FileText size={15} className="input-icon" style={{ top: '14px', transform: 'none' }} />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about your company or role…"
                    style={{ paddingLeft: '36px', minHeight: '72px', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '20px' }}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--txt-2)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

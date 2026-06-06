import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import clsx from 'clsx';
import { User, Mail, Lock, ShieldCheck, Phone, Globe, FileText } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    role: 'vendor',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.role) newErrors.role = 'Role is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      if (response.success || response.data) {
        navigate('/login');
      } else {
        setServerError(response.message || 'Registration failed');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <div className="w-full max-w-2xl bg-surface border border-border rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary font-sans mb-2">VendorBridge</h1>
          <p className="text-text-secondary">Create a new account</p>
        </div>

        {serverError && (
          <div className="mb-6 p-3 bg-danger/10 border border-danger text-danger rounded-md text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
                  <User size={18} />
                </div>
                <input
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={clsx("w-full !pl-10", errors.firstName && "error")}
                  placeholder="John"
                />
              </div>
              {errors.firstName && <p className="mt-1 text-sm text-danger">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
                  <User size={18} />
                </div>
                <input
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={clsx("w-full !pl-10", errors.lastName && "error")}
                  placeholder="Doe"
                />
              </div>
              {errors.lastName && <p className="mt-1 text-sm text-danger">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={clsx("w-full !pl-10", errors.email && "error")}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
                  <Phone size={18} />
                </div>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={clsx("w-full !pl-10", errors.phone && "error")}
                  placeholder="+1 234 567 890"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-danger">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Country</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
                  <Globe size={18} />
                </div>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={clsx("w-full !pl-10 appearance-none bg-surface", errors.country && "error")}
                >
                  <option value="">Select a country...</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="IN">India</option>
                  <option value="AU">Australia</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              {errors.country && <p className="mt-1 text-sm text-danger">{errors.country}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
                  <ShieldCheck size={18} />
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={clsx("w-full !pl-10 appearance-none bg-surface", errors.role && "error")}
                >
                  <option value="admin">Admin</option>
                  <option value="officer">Officer</option>
                  <option value="manager">Manager</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
              {errors.role && <p className="mt-1 text-sm text-danger">{errors.role}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
                <Lock size={18} />
              </div>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={clsx("w-full !pl-10", errors.password && "error")}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-danger">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1 flex items-center gap-2">
              <FileText size={16} className="text-text-secondary" />
              Description / Bio
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full h-24 resize-none bg-surface"
              placeholder="Tell us about your company or role..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary flex justify-center py-2.5 mt-4"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-blue-400 font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

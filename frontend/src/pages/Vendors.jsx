import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Edit2, Trash2, Star, AlertTriangle,
  Building2, User, Phone, Mail, Hash, Filter
} from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const initialMockData = [
  { id: 1, company_name: 'TechSupplies Ltd',  contact_person: 'Amit Shah',    email: 'amit@tech.com',        phone: '9876543210', category: 'IT',            gst_number: 'GST123456', status: 'active',   rating: 4.5 },
  { id: 2, company_name: 'Office Mart',        contact_person: 'Priya Patel',  email: 'priya@officemart.com', phone: '9123456789', category: 'Stationery',    gst_number: 'GST789012', status: 'inactive', rating: 3.2 },
  { id: 3, company_name: 'BuildRight Co',      contact_person: 'Raj Mehta',    email: 'raj@buildright.com',   phone: '9988776655', category: 'Construction',  gst_number: 'GST345678', status: 'active',   rating: 4.8 },
];

const emptyForm = {
  company_name: '', contact_person: '', email: '',
  phone: '', gst_number: '', category: '', status: 'active',
};

const Vendors = ({ openAddModal }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);

  useEffect(() => {
    api.get('/vendors')
      .then(res => setVendors(res.success && res.data ? res.data : initialMockData))
      .catch(() => setVendors(initialMockData))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (openAddModal) handleOpenModal();
  }, [openAddModal]);

  const handleOpenModal  = (vendor = null) => { setCurrentVendor(vendor); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setCurrentVendor(null); };
  const confirmDelete    = (vendor)         => { setCurrentVendor(vendor); setIsDeleteModalOpen(true); };

  const handleDelete = async () => {
    if (!currentVendor) return;
    try { await api.delete(`/vendors/${currentVendor.id}`); } catch {}
    setVendors(vendors.filter(v => v.id !== currentVendor.id));
    setIsDeleteModalOpen(false);
    setCurrentVendor(null);
  };

  const handleSave = async (vendorData) => {
    if (currentVendor) {
      try { await api.put(`/vendors/${currentVendor.id}`, vendorData); } catch {}
      setVendors(vendors.map(v => v.id === currentVendor.id ? { ...v, ...vendorData } : v));
    } else {
      const newVendor = { ...vendorData, id: Date.now(), rating: 0 };
      try {
        const res = await api.post('/vendors', vendorData);
        setVendors([...vendors, res.success && res.data ? res.data : newVendor]);
      } catch { setVendors([...vendors, newVendor]); }
    }
    handleCloseModal();
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = (v.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (v.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? v.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(vendors.map(v => v.category).filter(Boolean))];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Vendors"
        subtitle="Manage your supplier network and vendor relationships."
        actions={isAdmin && (
          <Button icon={<Plus size={16} />} onClick={() => handleOpenModal()}>
            Add Vendor
          </Button>
        )}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="input-icon-wrap" style={{ flex: '1 1 240px', maxWidth: '360px' }}>
          <Search size={14} className="input-icon" />
          <input
            type="text"
            placeholder="Search vendors…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', fontSize: '13px' }}
          />
        </div>
        <div className="input-icon-wrap" style={{ flex: '0 0 180px' }}>
          <Filter size={14} className="input-icon" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ paddingLeft: '34px', fontSize: '13px' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Vendor Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card skeleton" style={{ height: '240px', boxShadow: 'none' }} />
          ))}
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="card" style={{ padding: 0 }}>
          <EmptyState
            icon={Building2}
            title="No vendors found"
            description="No vendors match your search criteria. Try adjusting your filters."
            action={isAdmin && (
              <Button icon={<Plus size={14} />} size="sm" onClick={() => handleOpenModal()}>
                Add Vendor
              </Button>
            )}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredVendors.map(vendor => (
            <VendorCard key={vendor.id} vendor={vendor} isAdmin={isAdmin}
              onEdit={() => handleOpenModal(vendor)}
              onDelete={() => confirmDelete(vendor)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <VendorModal
        open={isModalOpen}
        vendor={currentVendor}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      {/* Delete Confirm Modal */}
      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        maxWidth="400px"
      >
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '999px',
            backgroundColor: 'rgba(192,57,43,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <AlertTriangle size={24} color="var(--danger)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--txt)', marginBottom: '8px' }}>
            Delete Vendor
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--txt-2)', lineHeight: 1.6, marginBottom: '24px' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--txt)' }}>{currentVendor?.company_name}</strong>? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Vendor</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/* ── VendorCard ──────────────────────────────────────────── */
const VendorCard = ({ vendor, isAdmin, onEdit, onDelete }) => {
  const rating = Number(vendor.rating || 0);

  const statusToVariant = { active: 'success', inactive: 'warning', blacklisted: 'danger' };

  return (
    <div
      className="card"
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}
    >
      {/* Admin actions — always visible */}
      {isAdmin && (
        <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '4px' }}>
          <button onClick={onEdit}
            style={{ padding: '5px', borderRadius: '6px', border: '1.5px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--txt-2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Edit2 size={13} />
          </button>
          <button onClick={onDelete}
            style={{ padding: '5px', borderRadius: '6px', border: '1.5px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--txt-2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingRight: isAdmin ? '60px' : 0 }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          backgroundColor: 'var(--primary-m)', color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', flexShrink: 0,
        }}>
          {vendor.company_name?.charAt(0)?.toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '15px', color: 'var(--txt)',
            margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {vendor.company_name}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--txt-m)' }}>{vendor.category || 'Uncategorized'}</span>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {[
          { icon: User,  label: vendor.contact_person },
          { icon: Mail,  label: vendor.email },
          { icon: Phone, label: vendor.phone },
          { icon: Hash,  label: vendor.gst_number, mono: true },
        ].map(({ icon: Icon, label, mono }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--txt-2)' }}>
            <Icon size={13} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span style={{
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              fontFamily: mono ? 'var(--font-mono)' : undefined,
              color: mono ? 'var(--txt)' : 'var(--txt-2)',
              fontSize: mono ? '11px' : '12px',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        paddingTop: '12px', borderTop: '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Badge status={vendor.status || 'active'} variant={statusToVariant[vendor.status] || 'success'}>
          {vendor.status || 'Active'}
        </Badge>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)',
          color: 'var(--warning)',
        }}>
          <Star size={13} fill="var(--warning)" />
          {rating.toFixed(1)}
        </div>
      </div>
    </div>
  );
};

/* ── VendorModal ──────────────────────────────────────────── */
const VendorModal = ({ open, vendor, onClose, onSave }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendor) {
      setFormData({
        company_name:   vendor.company_name   || '',
        contact_person: vendor.contact_person || '',
        email:          vendor.email          || '',
        phone:          vendor.phone          || '',
        gst_number:     vendor.gst_number     || '',
        category:       vendor.category       || '',
        status:         vendor.status         || 'active',
      });
    } else {
      setFormData(emptyForm);
    }
    setErrors({});
  }, [vendor, open]);

  const validate = () => {
    const e = {};
    if (!formData.company_name.trim())   e.company_name   = 'Required';
    if (!formData.contact_person.trim()) e.contact_person = 'Required';
    if (!formData.email.trim())          e.email          = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email';
    if (!formData.phone.trim())          e.phone          = 'Required';
    if (!formData.gst_number.trim())     e.gst_number     = 'Required';
    if (!formData.category.trim())       e.category       = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  const set = (key) => (e) => setFormData(f => ({ ...f, [key]: e.target.value }));

  const Field = ({ label, name, type = 'text', placeholder, mono }) => (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--txt)', marginBottom: '4px' }}>{label}</label>
      <input
        type={type}
        value={formData[name]}
        onChange={set(name)}
        placeholder={placeholder}
        className={errors[name] ? 'error' : ''}
        style={{ fontFamily: mono ? 'var(--font-mono)' : undefined, textTransform: mono ? 'uppercase' : undefined }}
      />
      {errors[name] && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors[name]}</p>}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vendor ? 'Edit Vendor' : 'Add New Vendor'}
      subtitle={vendor ? `Editing ${vendor.company_name}` : 'Fill in the details to register a new supplier.'}
      maxWidth="580px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={loading} onClick={handleSubmit}>
            {vendor ? 'Save Changes' : 'Add Vendor'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Company Name" name="company_name" placeholder="Acme Corp" />
        </div>
        <Field label="Contact Person" name="contact_person" placeholder="John Doe" />
        <Field label="Email Address"  name="email"          type="email" placeholder="john@example.com" />
        <Field label="Phone Number"   name="phone"          placeholder="+91 98765 43210" />
        <Field label="Category"       name="category"       placeholder="IT, Stationery…" />
        <Field label="GST Number"     name="gst_number"     placeholder="GSTIN…" mono />
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--txt)', marginBottom: '4px' }}>Status</label>
          <select value={formData.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blacklisted">Blacklisted</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};

export default Vendors;

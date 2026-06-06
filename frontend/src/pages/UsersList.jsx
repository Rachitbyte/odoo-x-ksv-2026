import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, AlertTriangle, User, Mail, UserCircle } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const roleVariant = { admin: 'danger', officer: 'info', manager: 'purple', vendor: 'success' };

const UsersList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUserItem, setCurrentUserItem] = useState(null);

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    api.get('/users')
      .then(res => { if (res.success && res.data) setUsers(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const handleOpenModal  = (u = null) => { setCurrentUserItem(u); setIsModalOpen(true); };
  const handleCloseModal = ()         => { setIsModalOpen(false); setCurrentUserItem(null); };
  const confirmDelete    = (u)        => { setCurrentUserItem(u); setIsDeleteModalOpen(true); };

  const handleDelete = async () => {
    if (!currentUserItem) return;
    try {
      await api.delete(`/users/${currentUserItem.id}`);
      setUsers(prev => prev.filter(u => u.id !== currentUserItem.id));
    } catch {}
    setIsDeleteModalOpen(false);
    setCurrentUserItem(null);
  };

  const handleSave = async (userData) => {
    if (!currentUserItem) return handleCloseModal();
    try {
      const res = await api.put(`/users/${currentUserItem.id}`, userData);
      if (res.success) setUsers(prev => prev.map(u => u.id === currentUserItem.id ? res.data : u));
    } catch {}
    handleCloseModal();
  };

  if (!isAdmin) {
    return (
      <EmptyState
        icon={UserCircle}
        title="Unauthorized"
        description="Only Admins can view the User Management page."
      />
    );
  }

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="User Management"
        subtitle={`Manage platform users and their roles. ${users.length} total users.`}
      />

      {/* Search */}
      <div className="input-icon-wrap" style={{ maxWidth: '360px', marginBottom: '20px' }}>
        <Search size={14} className="input-icon" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '36px', fontSize: '13px' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card skeleton" style={{ height: '160px', boxShadow: 'none' }} />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card" style={{ padding: 0 }}>
          <EmptyState icon={UserCircle} title="No users found" description="No users match your search." />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filteredUsers.map(u => (
            <UserCard key={u.id} userItem={u} onEdit={() => handleOpenModal(u)} onDelete={() => confirmDelete(u)} />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <UserModal open={isModalOpen} userItem={currentUserItem} onClose={handleCloseModal} onSave={handleSave} />

      {/* Delete Modal */}
      <Modal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="380px">
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '999px', backgroundColor: 'rgba(192,57,43,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <AlertTriangle size={24} color="var(--danger)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--txt)', marginBottom: '8px' }}>
            Delete User
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--txt-2)', lineHeight: 1.6, marginBottom: '24px' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--txt)' }}>{currentUserItem?.name}</strong>? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete User</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/* ── UserCard ──────────────────────────────────────────────── */
const UserCard = ({ userItem, onEdit, onDelete }) => (
  <div className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
    {/* Actions */}
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

    {/* User info */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', paddingRight: '60px' }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '999px',
        backgroundColor: 'var(--primary-m)', color: 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', flexShrink: 0,
      }}>
        {userItem.name?.charAt(0)?.toUpperCase()}
      </div>
      <div style={{ minWidth: 0 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--txt)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {userItem.name}
        </h3>
        <Badge status={userItem.role} variant={roleVariant[userItem.role] || 'neutral'} style={{ marginTop: '3px', textTransform: 'capitalize' }}>
          {userItem.role}
        </Badge>
      </div>
    </div>

    <div style={{ fontSize: '12px', color: 'var(--txt-2)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
      <Mail size={11} color="var(--primary)" />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userItem.email}</span>
    </div>

    <div style={{ paddingTop: '10px', borderTop: '1.5px solid var(--border)', marginTop: 'auto' }}>
      <Badge status={userItem.is_active ? 'active' : 'inactive'} variant={userItem.is_active ? 'success' : 'danger'}>
        {userItem.is_active ? 'Active' : 'Deactivated'}
      </Badge>
    </div>
  </div>
);

/* ── UserModal ─────────────────────────────────────────────── */
const UserModal = ({ open, userItem, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'officer', is_active: true });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userItem) setFormData({ name: userItem.name || '', email: userItem.email || '', role: userItem.role || 'officer', is_active: userItem.is_active !== false });
    setErrors({});
  }, [userItem, open]);

  const validate = () => {
    const e = {};
    if (!formData.name.trim())  e.name  = 'Required';
    if (!formData.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSave(formData); };
  const set = (k) => (e) => setFormData(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit User"
      subtitle={userItem ? `Editing ${userItem.name}` : ''}
      maxWidth="480px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--txt)', marginBottom: '4px' }}>Full Name</label>
          <input type="text" value={formData.name} onChange={set('name')} placeholder="John Doe" className={errors.name ? 'error' : ''} />
          {errors.name && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.name}</p>}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--txt)', marginBottom: '4px' }}>Email Address</label>
          <input type="email" value={formData.email} onChange={set('email')} placeholder="john@example.com" className={errors.email ? 'error' : ''} />
          {errors.email && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.email}</p>}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--txt)', marginBottom: '4px' }}>Role</label>
          <select value={formData.role} onChange={set('role')}>
            <option value="admin">Admin</option>
            <option value="officer">Procurement Officer</option>
            <option value="manager">Manager</option>
            <option value="vendor">Vendor</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--txt)', marginBottom: '4px' }}>Status</label>
          <select value={formData.is_active ? 'true' : 'false'} onChange={e => setFormData(f => ({ ...f, is_active: e.target.value === 'true' }))}>
            <option value="true">Active</option>
            <option value="false">Deactivated</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};

export default UsersList;

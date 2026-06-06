import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, User, UserCircle } from 'lucide-react';
import api from '../lib/axios';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const UsersList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUserItem, setCurrentUserItem] = useState(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        if (res.success && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleOpenModal = (u = null) => {
    setCurrentUserItem(u);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUserItem(null);
  };

  const confirmDelete = (u) => {
    setCurrentUserItem(u);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!currentUserItem) return;
    try {
      await api.delete(`/users/${currentUserItem.id}`);
      setUsers(users.filter(u => u.id !== currentUserItem.id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleteModalOpen(false);
      setCurrentUserItem(null);
    }
  };

  const handleSave = async (userData) => {
    if (currentUserItem) {
      // Edit
      try {
        const res = await api.put(`/users/${currentUserItem.id}`, userData);
        if (res.success) {
          setUsers(users.map(u => u.id === currentUserItem.id ? res.data : u));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Add
      try {
        const res = await api.post('/users', userData);
        if(res.success) {
           setUsers([...users, res.data]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    handleCloseModal();
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  if (!isAdmin) {
    return <div className="text-center p-12 text-text-secondary">Unauthorized access. Only Admins can view this page.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-text-primary">User Management</h2>
        <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full !pl-10"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 h-[200px] animate-pulse flex flex-col">
              <div className="w-1/2 h-6 bg-border rounded mb-6"></div>
              <div className="space-y-4 flex-1">
                {[1, 2].map(j => <div key={j} className="w-full h-4 bg-border rounded"></div>)}
              </div>
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <UserCircle size={48} className="text-text-secondary mb-4" />
          <h3 className="text-lg font-bold text-text-primary mb-2">No users found.</h3>
          <button onClick={() => handleOpenModal()} className="btn btn-primary mt-4">
            Add a User
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(u => (
            <UserCard key={u.id} userItem={u} onEdit={() => handleOpenModal(u)} onDelete={() => confirmDelete(u)} />
          ))}
        </div>
      )}

      {isModalOpen && <UserModal userItem={currentUserItem} onClose={handleCloseModal} onSave={handleSave} />}
      {isDeleteModalOpen && <DeleteConfirmModal userItem={currentUserItem} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} />}
    </div>
  );
};

const UserCard = ({ userItem, onEdit, onDelete }) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col group hover:border-primary/50 transition-colors shadow-sm relative">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {userItem.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <h3 className="text-lg font-bold text-text-primary pr-8 truncate leading-tight">{userItem.name}</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary uppercase">{userItem.role}</span>
            </div>
        </div>
        
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="text-text-secondary hover:text-primary transition-colors p-1.5 bg-background/50 rounded-md"><Edit2 size={16} /></button>
          <button onClick={onDelete} className="text-text-secondary hover:text-danger transition-colors p-1.5 bg-background/50 rounded-md"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="space-y-3 flex-1 mb-2">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <User size={16} className="text-primary/70 shrink-0" />
          <span className="truncate">{userItem.email}</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${userItem.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
            {userItem.is_active ? 'Active' : 'Deactivated'}
          </span>
        </div>
      </div>
    </div>
  );
};

const UserModal = ({ userItem, onClose, onSave }) => {
  const [formData, setFormData] = useState(userItem || {
    name: '', email: '', role: 'officer', password: '', is_active: true
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!userItem && !formData.password) {
        newErrors.password = 'Required for new users';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-border bg-surface/50">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <UserCircle size={20} className="text-primary" />
            {userItem ? 'Edit User' : 'Add New User'}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary hover:bg-border/50 p-1.5 rounded-md transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={clsx("w-full", errors.name && "error")}
                  placeholder="e.g. John Doe"
                />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className={clsx("w-full", errors.email && "error")}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
              </div>
              
              {!userItem && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Temporary Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className={clsx("w-full", errors.password && "error")}
                    placeholder="******"
                  />
                  {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full appearance-none bg-surface border border-border px-3 py-2 rounded-md"
                >
                  <option value="admin">Admin</option>
                  <option value="officer">Procurement Officer</option>
                  <option value="manager">Manager</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>

              {userItem && (
                 <div>
                 <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                 <select
                   value={formData.is_active ? 'true' : 'false'}
                   onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}
                   className="w-full appearance-none bg-surface border border-border px-3 py-2 rounded-md"
                 >
                   <option value="true">Active</option>
                   <option value="false">Deactivated</option>
                 </select>
               </div>
              )}
          </form>
        </div>
        
        <div className="p-6 border-t border-border flex justify-end gap-3 bg-background/50">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" form="user-form" className="btn btn-primary">
            {userItem ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ userItem, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
    <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto mb-5 border border-danger/20">
        <AlertTriangle size={28} />
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">Delete User</h3>
      <p className="text-sm text-text-secondary mb-8">
        Are you sure you want to delete <span className="text-text-primary font-bold">{userItem.name}</span>? This action cannot be undone.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
        <button onClick={onConfirm} className="btn btn-danger flex-1">Yes, Delete</button>
      </div>
    </div>
  </div>
);

export default UsersList;

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Star, AlertTriangle, Building2, User, Phone, Mail, Hash } from 'lucide-react';
import api from '../lib/axios';
import clsx from 'clsx';

const initialMockData = [
  { id: 1, company_name: "TechSupplies Ltd", contact_person: "Amit Shah", email: "amit@tech.com", phone: "9876543210", category: "IT", gst_number: "GST123456", status: "active", rating: 4.5 },
  { id: 2, company_name: "Office Mart", contact_person: "Priya Patel", email: "priya@officemart.com", phone: "9123456789", category: "Stationery", gst_number: "GST789012", status: "inactive", rating: 3.2 },
  { id: 3, company_name: "BuildRight Co", contact_person: "Raj Mehta", email: "raj@buildright.com", phone: "9988776655", category: "Construction", gst_number: "GST345678", status: "active", rating: 4.8 }
];

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);
  
  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await api.get('/vendors');
        if (res.success && res.data) {
          setVendors(res.data);
        } else {
          setVendors(initialMockData);
        }
      } catch (err) {
        setVendors(initialMockData);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const handleOpenModal = (vendor = null) => {
    setCurrentVendor(vendor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVendor(null);
  };

  const confirmDelete = (vendor) => {
    setCurrentVendor(vendor);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!currentVendor) return;
    try {
      await api.delete(`/vendors/${currentVendor.id}`);
      setVendors(vendors.filter(v => v.id !== currentVendor.id));
    } catch (err) {
      // Mock local delete
      setVendors(vendors.filter(v => v.id !== currentVendor.id));
    } finally {
      setIsDeleteModalOpen(false);
      setCurrentVendor(null);
    }
  };

  const handleSave = async (vendorData) => {
    if (currentVendor) {
      // Edit
      try {
        await api.put(`/vendors/${currentVendor.id}`, vendorData);
        setVendors(vendors.map(v => v.id === currentVendor.id ? { ...v, ...vendorData } : v));
      } catch (err) {
        setVendors(vendors.map(v => v.id === currentVendor.id ? { ...currentVendor, ...vendorData } : v));
      }
    } else {
      // Add
      const newVendor = { ...vendorData, id: Date.now(), rating: 0 };
      try {
        const res = await api.post('/vendors', vendorData);
        if(res.success && res.data) {
           setVendors([...vendors, res.data]);
        } else {
           setVendors([...vendors, newVendor]);
        }
      } catch (err) {
        setVendors([...vendors, newVendor]);
      }
    }
    handleCloseModal();
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.company_name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? v.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(vendors.map(v => v.category))];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Vendors</h2>
        <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Vendor
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
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full !pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-48 appearance-none bg-surface"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 h-[250px] animate-pulse flex flex-col">
              <div className="w-1/2 h-6 bg-border rounded mb-6"></div>
              <div className="space-y-4 flex-1">
                {[1, 2, 3, 4].map(j => <div key={j} className="w-full h-4 bg-border rounded"></div>)}
              </div>
              <div className="mt-4 border-t border-border/50 pt-4 flex justify-between">
                <div className="w-24 h-6 bg-border rounded-full"></div>
                <div className="w-12 h-6 bg-border rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Building2 size={48} className="text-text-secondary mb-4" />
          <h3 className="text-lg font-bold text-text-primary mb-2">No vendors found.</h3>
          <p className="text-text-secondary mb-6">You don't have any vendors matching this criteria yet.</p>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            Add your first vendor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map(vendor => (
            <VendorCard key={vendor.id} vendor={vendor} onEdit={() => handleOpenModal(vendor)} onDelete={() => confirmDelete(vendor)} />
          ))}
        </div>
      )}

      {isModalOpen && <VendorModal vendor={currentVendor} onClose={handleCloseModal} onSave={handleSave} />}
      {isDeleteModalOpen && <DeleteConfirmModal vendor={currentVendor} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} />}
    </div>
  );
};

const VendorCard = ({ vendor, onEdit, onDelete }) => {
  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'inactive': return 'bg-warning/10 text-warning border-warning/20';
      case 'blacklisted': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col group hover:border-primary/50 transition-colors shadow-sm relative">
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-lg font-bold text-text-primary pr-8 truncate">{vendor.company_name}</h3>
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="text-text-secondary hover:text-primary transition-colors p-1.5 bg-background/50 rounded-md"><Edit2 size={16} /></button>
          <button onClick={onDelete} className="text-text-secondary hover:text-danger transition-colors p-1.5 bg-background/50 rounded-md"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="space-y-3 flex-1 mb-2">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <User size={16} className="text-primary/70 shrink-0" />
          <span className="truncate">{vendor.contact_person}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Mail size={16} className="text-primary/70 shrink-0" />
          <span className="truncate">{vendor.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Phone size={16} className="text-primary/70 shrink-0" />
          <span>{vendor.phone}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Hash size={16} className="text-primary/70 shrink-0" />
          <span className="font-mono text-text-primary tracking-wide">{vendor.gst_number}</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 truncate max-w-[100px]">{vendor.category}</span>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(vendor.status)} capitalize`}>{vendor.status}</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-warning bg-warning/10 px-2 py-1 rounded-md border border-warning/20">
          <Star size={14} className="fill-warning" />
          <span>{vendor.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

const VendorModal = ({ vendor, onClose, onSave }) => {
  const [formData, setFormData] = useState(vendor || {
    company_name: '', contact_person: '', email: '', phone: '', gst_number: '', category: '', status: 'active'
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.company_name.trim()) newErrors.company_name = 'Required';
    if (!formData.contact_person.trim()) newErrors.contact_person = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Required';
    if (!formData.gst_number.trim()) newErrors.gst_number = 'Required';
    if (!formData.category.trim()) newErrors.category = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-border bg-surface/50">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Building2 size={20} className="text-primary" />
            {vendor ? 'Edit Vendor' : 'Add New Vendor'}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary hover:bg-border/50 p-1.5 rounded-md transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="vendor-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={e => setFormData({...formData, company_name: e.target.value})}
                  className={clsx("w-full", errors.company_name && "error")}
                  placeholder="e.g. Acme Corp"
                />
                {errors.company_name && <p className="text-xs text-danger mt-1">{errors.company_name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Contact Person</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={e => setFormData({...formData, contact_person: e.target.value})}
                  className={clsx("w-full", errors.contact_person && "error")}
                  placeholder="John Doe"
                />
                {errors.contact_person && <p className="text-xs text-danger mt-1">{errors.contact_person}</p>}
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
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className={clsx("w-full", errors.phone && "error")}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className={clsx("w-full", errors.category && "error")}
                  placeholder="e.g. IT, Stationery"
                />
                {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">GST Number</label>
                <input
                  type="text"
                  value={formData.gst_number}
                  onChange={e => setFormData({...formData, gst_number: e.target.value})}
                  className={clsx("w-full font-mono uppercase", errors.gst_number && "error")}
                  placeholder="GSTIN..."
                />
                {errors.gst_number && <p className="text-xs text-danger mt-1">{errors.gst_number}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blacklisted">Blacklisted</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-border flex justify-end gap-3 bg-background/50">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" form="vendor-form" className="btn btn-primary">
            {vendor ? 'Save Changes' : 'Add Vendor'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ vendor, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
    <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto mb-5 border border-danger/20">
        <AlertTriangle size={28} />
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">Delete Vendor</h3>
      <p className="text-sm text-text-secondary mb-8">
        Are you sure you want to delete <span className="text-text-primary font-bold">{vendor.company_name}</span>? This action cannot be undone.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
        <button onClick={onConfirm} className="btn btn-danger flex-1">Yes, Delete</button>
      </div>
    </div>
  </div>
);

export default Vendors;

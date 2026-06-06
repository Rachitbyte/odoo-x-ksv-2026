import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UploadCloud, Send, Check } from 'lucide-react';
import api from '../../lib/axios';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';

const mockVendors = [
  { id: 1, company_name: 'TechSupplies Ltd', category: 'IT' },
  { id: 2, company_name: 'Office Mart', category: 'Stationery' },
  { id: 3, company_name: 'BuildRight Co', category: 'Construction' },
  { id: 4, company_name: 'EventPro Services', category: 'Events' }
];

const RFQCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    title: '', category: '', description: '', quantity: '', unit: '', deadline: '', assigned_vendors: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get('/vendors')
      .then(res => setVendors(res.success && res.data ? res.data : mockVendors))
      .catch(() => setVendors(mockVendors));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantity || isNaN(formData.quantity)) newErrors.quantity = 'Valid quantity is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    if (formData.assigned_vendors.length === 0) newErrors.vendors = 'Select at least one vendor';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVendorToggle = (vendorId) => {
    setFormData(prev => ({
      ...prev,
      assigned_vendors: prev.assigned_vendors.includes(vendorId)
        ? prev.assigned_vendors.filter(id => id !== vendorId)
        : [...prev.assigned_vendors, vendorId]
    }));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validate()) return;
    setLoading(true);
    try {
      await api.post('/rfq', { ...formData, status: isDraft ? 'draft' : 'open' });
      navigate('/rfqs');
    } catch {
      setTimeout(() => navigate('/rfqs'), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{
              padding: '6px', borderRadius: '8px', border: '1.5px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--txt-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ArrowLeft size={16} />
            </button>
            Create New RFQ
          </div>
        }
        subtitle="Define requirements and assign to vendors."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:grid-cols-3">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          <div className="card" style={{ padding: '24px' }}>
            <h3 className="section-label" style={{ marginTop: 0 }}>Request Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '8px' }}>RFQ Title</label>
                <input
                  type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', borderColor: errors.title ? 'var(--danger)' : 'var(--border)' }}
                  placeholder="e.g. Q1 Office Laptops"
                />
                {errors.title && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--danger)' }}>{errors.title}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '8px' }}>Category</label>
                <select
                  value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', borderColor: errors.category ? 'var(--danger)' : 'var(--border)' }}
                >
                  <option value="">Select a category...</option>
                  <option value="IT">IT & Hardware</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Furniture">Office Furniture</option>
                  <option value="Services">Services</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--danger)' }}>{errors.category}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '8px' }}>Description & Specs</label>
                <textarea
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', height: '120px', resize: 'none' }}
                  placeholder="Detailed specifications for the requested items..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '8px' }}>Quantity</label>
                  <input
                    type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    style={{ width: '100%', borderColor: errors.quantity ? 'var(--danger)' : 'var(--border)' }}
                    placeholder="e.g. 50"
                  />
                  {errors.quantity && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--danger)' }}>{errors.quantity}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '8px' }}>Unit of Measure</label>
                  <input
                    type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    style={{ width: '100%' }} placeholder="pcs, kg, units..."
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '8px' }}>Submission Deadline</label>
                <input
                  type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  style={{ width: '100%', borderColor: errors.deadline ? 'var(--danger)' : 'var(--border)' }}
                />
                {errors.deadline && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--danger)' }}>{errors.deadline}</p>}
              </div>

              {/* Attachments Section */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--txt)', marginBottom: '8px' }}>Attachments</label>
                <div style={{
                  border: '2px dashed var(--border)', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s'
                }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--primary-m)'; }}
                   onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <UploadCloud size={32} style={{ color: 'var(--txt-m)', margin: '0 auto 12px' }} />
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--txt)' }}>Drag & drop files here</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--txt-2)' }}>or click to browse (PDF, DOCX, JPG)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Vendor Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--txt)' }}>Assign Vendors</h3>
              <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'var(--primary-m)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '999px' }}>
                {formData.assigned_vendors.length} Selected
              </span>
            </div>
            {errors.vendors && <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--danger)' }}>{errors.vendors}</p>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
              {vendors.map(vendor => {
                const isSelected = formData.assigned_vendors.includes(vendor.id);
                return (
                  <div
                    key={vendor.id}
                    onClick={() => handleVendorToggle(vendor.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px',
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: isSelected ? 'var(--primary-m)' : 'var(--surface)',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--txt-m)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '4px', border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--txt-m)'}`,
                      backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--txt)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {vendor.company_name}
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--txt-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {vendor.category}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Button variant="outline" loading={loading} icon={<Save size={16} />} onClick={() => handleSubmit(true)} style={{ justifyContent: 'center' }}>
              Draft
            </Button>
            <Button variant="primary" loading={loading} icon={<Send size={16} />} onClick={() => handleSubmit(false)} style={{ justifyContent: 'center' }}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQCreate;

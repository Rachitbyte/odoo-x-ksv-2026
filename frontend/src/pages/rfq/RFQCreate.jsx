import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, UploadCloud, Send } from 'lucide-react';
import api from '../../lib/axios';
import clsx from 'clsx';

const mockVendors = [
  { id: 1, company_name: "TechSupplies Ltd", category: "IT" },
  { id: 2, company_name: "Office Mart", category: "Stationery" },
  { id: 3, company_name: "BuildRight Co", category: "Construction" },
  { id: 4, company_name: "EventPro Services", category: "Events" }
];

const RFQCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    quantity: '',
    unit: '',
    deadline: '',
    assigned_vendors: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await api.get('/vendors');
        if(res.success) setVendors(res.data);
        else setVendors(mockVendors);
      } catch (err) {
        setVendors(mockVendors);
      }
    };
    fetchVendors();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.quantity || isNaN(formData.quantity)) newErrors.quantity = "Valid quantity is required";
    if (!formData.deadline) newErrors.deadline = "Deadline is required";
    if (formData.assigned_vendors.length === 0) newErrors.vendors = "Select at least one vendor";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVendorToggle = (vendorId) => {
    if (formData.assigned_vendors.includes(vendorId)) {
      setFormData({
        ...formData,
        assigned_vendors: formData.assigned_vendors.filter(id => id !== vendorId)
      });
    } else {
      setFormData({
        ...formData,
        assigned_vendors: [...formData.assigned_vendors, vendorId]
      });
    }
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validate()) return;
    
    setLoading(true);
    try {
      await api.post('/rfq', { ...formData, status: isDraft ? 'draft' : 'open' });
      navigate('/rfqs');
    } catch (err) {
      setTimeout(() => navigate('/rfqs'), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <button onClick={() => navigate(-1)} className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Create New RFQ</h2>
          <p className="text-sm text-text-secondary">Define requirements and assign to vendors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-medium text-text-primary mb-4">Request Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">RFQ Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className={clsx("w-full", errors.title && "error")}
                  placeholder="e.g. Q1 Office Laptops"
                />
                {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className={clsx("w-full bg-background", errors.category && "error")}
                >
                  <option value="">Select a category...</option>
                  <option value="IT">IT & Hardware</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Furniture">Office Furniture</option>
                  <option value="Services">Services</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Description & Specs</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full h-32 resize-none"
                  placeholder="Detailed specifications for the requested items..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: e.target.value})}
                    className={clsx("w-full", errors.quantity && "error")}
                    placeholder="e.g. 50"
                  />
                  {errors.quantity && <p className="text-xs text-danger mt-1">{errors.quantity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-full"
                    placeholder="pcs, kg, units..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Submission Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={e => setFormData({...formData, deadline: e.target.value})}
                  className={clsx("w-full", errors.deadline && "error")}
                />
                {errors.deadline && <p className="text-xs text-danger mt-1">{errors.deadline}</p>}
              </div>

              {/* Attachments Section */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Attachments</label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group">
                  <UploadCloud size={32} className="mx-auto text-text-secondary group-hover:text-primary mb-3 transition-colors" />
                  <p className="text-sm font-medium text-text-primary">Drag & drop files here</p>
                  <p className="text-xs text-text-secondary mt-1">or click to browse (PDF, DOCX, JPG)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Vendor Selection */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-text-primary">Assign Vendors</h3>
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                {formData.assigned_vendors.length} Selected
              </span>
            </div>
            {errors.vendors && <p className="text-xs text-danger mb-3">{errors.vendors}</p>}
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {vendors.map(vendor => {
                const isSelected = formData.assigned_vendors.includes(vendor.id);
                return (
                  <div 
                    key={vendor.id}
                    onClick={() => handleVendorToggle(vendor.id)}
                    className={clsx(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      isSelected ? "bg-primary/10 border-primary/40 text-primary" : "bg-background border-border hover:border-text-secondary/50 text-text-primary"
                    )}
                  >
                    <div className={clsx(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                      isSelected ? "bg-primary border-primary" : "border-text-secondary"
                    )}>
                      {isSelected && <Save size={10} className="text-white fill-white" />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium text-sm truncate">{vendor.company_name}</p>
                      <p className={clsx("text-xs truncate", isSelected ? "text-primary/70" : "text-text-secondary")}>
                        {vendor.category}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="flex-1 btn bg-surface border border-border text-text-primary hover:bg-background transition-colors flex justify-center items-center gap-2"
            >
              <Save size={18} />
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="flex-1 btn btn-primary flex justify-center items-center gap-2"
            >
              <Send size={18} />
              Save & Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQCreate;

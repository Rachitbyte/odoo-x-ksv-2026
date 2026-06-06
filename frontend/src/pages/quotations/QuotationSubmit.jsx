import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import api from '../../lib/axios';

const QuotationSubmit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [taxPercent, setTaxPercent] = useState(18);
  const [notes, setNotes] = useState('');
  
  // Wireframe indicates a multi-item table structure for the quotation
  const [items, setItems] = useState([
    { id: 1, name: "Ergonomic chair", quantity: 25, unit_price: 3500, delivery_days: 7 },
    { id: 2, name: "Standing desk", quantity: 10, unit_price: 8200, delivery_days: 14 }
  ]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.unit_price || 0) * parseInt(item.quantity || 0)), 0);
  const taxAmount = subtotal * (parseFloat(taxPercent || 0) / 100);
  const grandTotal = subtotal + taxAmount;

  const handleSubmit = async (isDraft = false) => {
    setLoading(true);
    try {
      await api.post(`/rfq/${id}/quotations`, { 
        items, 
        subtotal, 
        tax_percent: taxPercent, 
        tax_amount: taxAmount, 
        total_price: grandTotal, 
        notes,
        status: isDraft ? 'draft' : 'submitted' 
      });
      navigate('/dashboard'); 
    } catch (err) {
      setTimeout(() => navigate('/dashboard'), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Submit Quotation</h2>
          <p className="text-sm text-text-secondary">RFQ: office furniture procurement q2 - deadline 15 june 2025</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-sm font-bold text-text-primary mb-2">RFQ Summary</h3>
        <p className="text-sm text-text-secondary mb-6 pb-6 border-b border-border">
          Ergonomic chair * 25, standing desk * 10 - category furniture
        </p>

        <h3 className="text-sm font-bold text-text-primary mb-3">Your Quotation</h3>
        
        <div className="border border-border rounded-lg overflow-hidden mb-6">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/50 border-b border-border text-text-secondary">
              <tr>
                <th className="p-4 font-medium w-1/3 border-r border-border">Item</th>
                <th className="p-4 font-medium border-r border-border text-center">Qty</th>
                <th className="p-4 font-medium border-r border-border">Unit price</th>
                <th className="p-4 font-medium border-r border-border">Total</th>
                <th className="p-4 font-medium text-center">Delivery (days)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item, idx) => {
                const total = (parseFloat(item.unit_price || 0) * parseInt(item.quantity || 0));
                return (
                  <tr key={item.id} className="bg-background">
                    <td className="p-4 border-r border-border text-text-primary">{item.name}</td>
                    <td className="p-4 border-r border-border text-center font-mono">{item.quantity}</td>
                    <td className="p-4 border-r border-border">
                      <div className="flex items-center">
                        <span className="text-text-secondary mr-2">₹</span>
                        <input 
                          type="number" 
                          value={item.unit_price} 
                          onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                          className="w-full bg-transparent border-none p-0 focus:ring-0 font-mono text-text-primary"
                        />
                      </div>
                    </td>
                    <td className="p-4 border-r border-border font-mono text-text-primary">
                      ₹{total.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        value={item.delivery_days} 
                        onChange={(e) => handleItemChange(idx, 'delivery_days', e.target.value)}
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-center font-mono text-text-primary"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">tax / GST %</label>
              <input 
                type="number" 
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="w-1/3 bg-background" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Note / terms</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-24 bg-background resize-none" 
                placeholder="Payment terms: 20 days net..."
              />
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-6 flex flex-col justify-center">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-text-secondary">Subtotal</span>
              <span className="font-mono text-text-primary">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span className="text-text-secondary">GST ({taxPercent}%)</span>
              <span className="font-mono text-text-primary">₹{taxAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-border">
              <span className="font-bold text-text-primary">Grand total</span>
              <span className="font-mono font-bold text-lg text-primary">₹{grandTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-border">
          <button 
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2 px-8"
          >
            <Send size={18} /> Submit Quotation
          </button>
          <button 
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="btn bg-background border border-border text-text-primary hover:border-primary transition-colors flex items-center gap-2 px-8"
          >
            <Save size={18} /> Save Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationSubmit;

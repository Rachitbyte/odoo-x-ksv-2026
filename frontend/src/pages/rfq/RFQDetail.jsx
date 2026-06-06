import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, CheckCircle, Package, Scale, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

const mockRFQ = {
  id: 1, 
  rfq_number: "RFQ-2024-0001", 
  title: "Office Laptops Q1 Procurement", 
  description: "High-performance laptops for engineering team. Minimum 16GB RAM, 512GB SSD, latest generation processors.",
  quantity: 50, 
  unit: "pcs", 
  deadline: "2024-12-15", 
  status: "under_review", 
  created_at: "2024-12-01"
};

const mockQuotations = [
  { id: 101, vendor_name: "TechSupplies Ltd", vendor_rating: 4.5, unit_price: 1200, total_price: 60000, delivery_days: 14, status: "submitted" },
  { id: 102, vendor_name: "ComputeIndia", vendor_rating: 4.8, unit_price: 1150, total_price: 57500, delivery_days: 21, status: "submitted" },
  { id: 103, vendor_name: "GlobalIT Corp", vendor_rating: 3.9, unit_price: 1300, total_price: 65000, delivery_days: 7, status: "submitted" }
];

const RFQDetail = () => {
  const { user } = useAuth();
  const canCompare = user?.role === 'officer' || user?.role === 'manager';

  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rfq, setRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [rfqRes, qtRes] = await Promise.all([
          api.get(`/rfq/${id}`),
          api.get(`/rfq/${id}/quotations`)
        ]);
        setRfq(rfqRes.success ? rfqRes.data : mockRFQ);
        setQuotations(qtRes.success ? qtRes.data : mockQuotations);
      } catch (err) {
        setRfq(mockRFQ);
        setQuotations(mockQuotations);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'approved': return 'bg-success/10 text-success border-success/20';
      case 'under_review': return 'bg-warning/10 text-warning border-warning/20';
      case 'open': return 'bg-primary/10 text-primary border-primary/20';
      case 'rejected': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-surface text-text-primary border-border';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-surface rounded w-1/3"></div>
        <div className="h-48 bg-surface rounded-xl w-full"></div>
        <div className="h-64 bg-surface rounded-xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/rfq')} className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              {rfq.title}
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(rfq.status)} capitalize`}>
                {rfq.status.replace('_', ' ')}
              </span>
            </h2>
            <p className="text-sm font-mono text-text-secondary mt-1">{rfq.rfq_number}</p>
          </div>
        </div>
        
        {canCompare && (
          <Link to={`/rfq/${id}/compare`} className="btn btn-primary flex items-center gap-2">
            <Scale size={18} />
            Compare Quotations
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RFQ Meta Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">Request Details</h3>
            
            <div className="flex items-start gap-3">
              <Package size={18} className="text-primary mt-0.5" />
              <div>
                <p className="text-xs text-text-secondary">Quantity</p>
                <p className="text-sm font-medium text-text-primary">{rfq.quantity} {rfq.unit}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-warning mt-0.5" />
              <div>
                <p className="text-xs text-text-secondary">Submission Deadline</p>
                <p className="text-sm font-medium text-text-primary">{rfq.deadline}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-success mt-0.5" />
              <div>
                <p className="text-xs text-text-secondary">Created On</p>
                <p className="text-sm font-medium text-text-primary">{rfq.created_at}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">Description</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {rfq.description}
            </p>
          </div>
        </div>

        {/* Quotations List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            Quotations Received ({quotations.length})
          </h3>

          {quotations.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center">
              <p className="text-text-secondary">No quotations received yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quotations.map(quote => (
                <div key={quote.id} className="bg-surface border border-border hover:border-primary/50 transition-colors rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-text-primary">{quote.vendor_name}</h4>
                    <div className="flex gap-4 mt-2 text-sm text-text-secondary">
                      <span className="font-mono">${quote.total_price.toLocaleString()}</span>
                      <span>•</span>
                      <span>{quote.delivery_days} days delivery</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-surface border border-border text-text-secondary capitalize">
                      {quote.status}
                    </span>
                    <button className="p-2 bg-background hover:bg-primary/10 text-text-secondary hover:text-primary rounded-md transition-colors ml-auto sm:ml-0">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RFQDetail;

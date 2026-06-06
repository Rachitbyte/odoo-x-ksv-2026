import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, CheckCircle, Package, Scale, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const mockRFQ = {
  id: 1, 
  rfq_number: 'RFQ-2024-0001', 
  title: 'Office Laptops Q1 Procurement', 
  description: 'High-performance laptops for engineering team. Minimum 16GB RAM, 512GB SSD, latest generation processors.',
  quantity: 50, 
  unit: 'pcs', 
  deadline: '2024-12-15', 
  status: 'under_review', 
  created_at: '2024-12-01'
};

const mockQuotations = [
  { id: 101, vendor_name: 'TechSupplies Ltd', vendor_rating: 4.5, unit_price: 1200, total_price: 60000, delivery_days: 14, status: 'submitted' },
  { id: 102, vendor_name: 'ComputeIndia',     vendor_rating: 4.8, unit_price: 1150, total_price: 57500, delivery_days: 21, status: 'submitted' },
  { id: 103, vendor_name: 'GlobalIT Corp',    vendor_rating: 3.9, unit_price: 1300, total_price: 65000, delivery_days: 7,  status: 'submitted' }
];

const RFQDetail = () => {
  const { user } = useAuth();
  const canCompare = user?.role === 'manager' || user?.role === 'admin';

  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rfq, setRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(`/rfq/${id}`).catch(() => ({ success: false })),
      api.get(`/rfq/${id}/quotations`).catch(() => ({ success: false }))
    ]).then(([rfqRes, qtRes]) => {
      setRfq(rfqRes.success && rfqRes.data ? rfqRes.data : mockRFQ);
      setQuotations(qtRes.success && qtRes.data ? qtRes.data : mockQuotations);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="skeleton" style={{ height: '80px', marginBottom: '24px', borderRadius: '12px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
          <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate('/rfq')} style={{
              padding: '6px', borderRadius: '8px', border: '1.5px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--txt-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ArrowLeft size={16} />
            </button>
            {rfq.title}
          </div>
        }
        subtitle={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{rfq.rfq_number}</span>
            <Badge status={rfq.status}>{rfq.status}</Badge>
          </div>
        }
        actions={canCompare && (
          <Button icon={<Scale size={16} />} onClick={() => navigate(`/rfq/${id}/compare`)}>
            Compare Quotations
          </Button>
        )}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="md:grid-cols-3">
        {/* RFQ Meta Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 className="section-label" style={{ marginTop: 0, padding: 0 }}>Request Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Package size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--txt-2)' }}>Quantity</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--txt)' }}>{rfq.quantity} {rfq.unit}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Clock size={18} color="var(--warning)" style={{ marginTop: '2px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--txt-2)' }}>Submission Deadline</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--txt)' }}>{rfq.deadline}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle size={18} color="var(--success)" style={{ marginTop: '2px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--txt-2)' }}>Created On</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--txt)' }}>{rfq.created_at}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '24px' }}>
            <h3 className="section-label" style={{ marginTop: 0, padding: 0 }}>Description</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--txt-2)', lineHeight: 1.6 }}>
              {rfq.description}
            </p>
          </div>
        </div>

        {/* Quotations List */}
        <div className="md:col-span-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <FileText size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--txt)' }}>
              Quotations Received ({quotations.length})
            </h3>
          </div>

          {quotations.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--txt-2)' }}>
              No quotations received yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quotations.map(quote => (
                <div key={quote.id} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: 'var(--txt)' }}>
                      {quote.vendor_name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--txt-2)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--txt)' }}>
                        ₹{quote.total_price.toLocaleString()}
                      </span>
                      <span>•</span>
                      <span>{quote.delivery_days} days delivery</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Badge status={quote.status}>{quote.status}</Badge>
                    <button style={{ padding: '8px', borderRadius: '8px', border: '1.5px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--txt-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary-m)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--txt-2)'; }}>
                      <ChevronRight size={16} />
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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Scale } from 'lucide-react';
import api from '../../lib/axios';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';

const QuotationCompare = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState([]);
  const [rfqTitle, setRfqTitle] = useState('');

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const [compRes, rfqRes] = await Promise.all([
          api.get(`/rfq/${id}/comparison`),
          api.get(`/rfq/${id}`).catch(() => null)
        ]);
        if (compRes.success && compRes.data) {
          setQuotations(compRes.data);
        }
        if (rfqRes?.success && rfqRes?.data) {
          setRfqTitle(rfqRes.data.title);
        }
      } catch (err) {
        setQuotations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [id]);

  const handleSelectVendor = async (quotationId) => {
    try {
      await api.post(`/approvals/${quotationId}/approve`);
      navigate('/approvals');
    } catch {
      navigate('/approvals');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="skeleton" style={{ height: '80px', marginBottom: '24px', borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
      </div>
    );
  }

  if (quotations.length === 0) {
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
              Quotation Comparison
            </div>
          }
        />
        <div className="card" style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--txt-2)' }}>
          <Scale size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
          <p style={{ margin: 0, fontSize: '15px' }}>Not enough quotations to compare for this RFQ.</p>
        </div>
      </div>
    );
  }

  const lowestPrice = Math.min(...quotations.map(q => q.grand_total));

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{
              padding: '6px', borderRadius: '8px', border: '1.5px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--txt-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ArrowLeft size={16} />
            </button>
            Quotation Comparison
          </div>
        }
        subtitle={`RFQ: ${rfqTitle || `ID #${id}`} — ${quotations.length} quotations received`}
      />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1.5px solid var(--border)' }}>
                <th style={{ padding: '16px', fontWeight: 700, color: 'var(--txt-2)', textAlign: 'left', width: '200px', borderRight: '1px solid var(--border)' }}>
                  Criteria
                </th>
                {quotations.map(quote => {
                  const isBest = quote.grand_total === lowestPrice;
                  return (
                    <th key={`head-${quote.id}`} style={{
                      padding: '16px', borderRight: '1px solid var(--border)',
                      backgroundColor: isBest ? 'var(--primary-m)' : 'transparent',
                      color: isBest ? 'var(--primary)' : 'var(--txt)',
                      fontWeight: 700, minWidth: '240px'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '16px' }}>{quote.vendor_name}</span>
                        {isBest && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', backgroundColor: 'var(--primary)', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Best Value</span>}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Grand Total Row */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--txt-2)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                  Grand Total
                </td>
                {quotations.map(quote => {
                  const isBest = quote.grand_total === lowestPrice;
                  return (
                    <td key={`total-${quote.id}`} style={{
                      padding: '16px', borderRight: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
                      backgroundColor: isBest ? 'var(--primary-m)' : 'transparent',
                      color: isBest ? 'var(--primary)' : 'var(--txt)', fontWeight: isBest ? 700 : 500, fontSize: '16px'
                    }}>
                      ₹{quote.grand_total.toLocaleString()}
                    </td>
                  );
                })}
              </tr>

              {/* GST % Row */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--txt-2)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                  GST %
                </td>
                {quotations.map(quote => {
                  const isBest = quote.grand_total === lowestPrice;
                  return (
                    <td key={`gst-${quote.id}`} style={{
                      padding: '16px', borderRight: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
                      backgroundColor: isBest ? 'var(--primary-m)' : 'transparent',
                      color: isBest ? 'var(--primary)' : 'var(--txt)'
                    }}>
                      {quote.gst_percent}%
                    </td>
                  );
                })}
              </tr>

              {/* Delivery Row */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--txt-2)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                  Delivery (days)
                </td>
                {quotations.map(quote => {
                  const isBest = quote.grand_total === lowestPrice;
                  return (
                    <td key={`del-${quote.id}`} style={{
                      padding: '16px', borderRight: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
                      backgroundColor: isBest ? 'var(--primary-m)' : 'transparent',
                      color: isBest ? 'var(--primary)' : 'var(--txt)'
                    }}>
                      {quote.delivery_days} days
                    </td>
                  );
                })}
              </tr>

              {/* Vendor Rating Row */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--txt-2)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                  Vendor Rating
                </td>
                {quotations.map(quote => {
                  const isBest = quote.grand_total === lowestPrice;
                  return (
                    <td key={`rat-${quote.id}`} style={{
                      padding: '16px', borderRight: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
                      backgroundColor: isBest ? 'var(--primary-m)' : 'transparent',
                      color: isBest ? 'var(--warning)' : 'var(--warning)', fontWeight: 600
                    }}>
                      {Number(quote.vendor_rating || 0).toFixed(1)} ⭐
                    </td>
                  );
                })}
              </tr>

              {/* Action Row */}
              <tr>
                <td style={{ padding: '24px 16px', fontWeight: 600, color: 'var(--txt-2)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                  Decision
                </td>
                {quotations.map(quote => {
                  const isBest = quote.grand_total === lowestPrice;
                  return (
                    <td key={`act-${quote.id}`} style={{
                      padding: '24px 16px', borderRight: '1px solid var(--border)',
                      backgroundColor: isBest ? 'var(--primary-m)' : 'transparent'
                    }}>
                      <Button
                        variant={isBest ? 'primary' : 'outline'}
                        style={{ width: '100%', justifyContent: 'center' }}
                        icon={<CheckCircle size={16} />}
                        onClick={() => handleSelectVendor(quote.id)}
                      >
                        Select Vendor
                      </Button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationCompare;

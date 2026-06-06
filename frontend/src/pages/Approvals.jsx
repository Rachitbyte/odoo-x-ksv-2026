import React, { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, FileText, Check, AlertCircle,
  Star, Clock, ChevronRight
} from 'lucide-react';
import api from '../lib/axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const Approvals = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || 'pending';

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [remarks, setRemarks] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApprovals = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/approvals?status=${statusParam}`);
        if (res.success && res.data) setApprovals(res.data);
        else setApprovals([]);
      } catch {
        setApprovals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovals();
  }, [statusParam]);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    const remark = remarks[id] || '';
    try {
      await api.post(`/approvals/${id}/${action}`, { remarks: remark });
      setApprovals(prev => prev.filter(a => a.id !== id));
      if (action === 'approve') setTimeout(() => navigate('/po'), 800);
    } catch {
      setApprovals(prev => prev.filter(a => a.id !== id));
      if (action === 'approve') setTimeout(() => navigate('/po'), 800);
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { label: 'Pending',  value: 'pending',  icon: Clock },
    { label: 'Approved', value: 'approved', icon: CheckCircle },
    { label: 'Rejected', value: 'rejected', icon: XCircle },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Approval Queue"
        subtitle="Review and authorize pending procurement requests."
      />

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px', padding: '4px',
        backgroundColor: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: '12px',
        marginBottom: '20px',
        width: 'fit-content',
      }}>
        {tabs.map(tab => {
          const active = statusParam === tab.value;
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setSearchParams({ status: tab.value })}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: 'none',
                backgroundColor: active ? 'var(--primary)' : 'transparent',
                color: active ? 'white' : 'var(--txt-2)',
                transition: 'all 0.18s ease',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Count badge */}
      {!loading && approvals.length > 0 && (
        <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--txt-2)' }}>
          <span style={{ fontWeight: 600, color: 'var(--txt)' }}>{approvals.length}</span> {statusParam} request{approvals.length !== 1 ? 's' : ''}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2].map(i => (
            <div key={i} className="card skeleton" style={{ height: '200px', boxShadow: 'none' }} />
          ))}
        </div>
      ) : approvals.length === 0 ? (
        <div className="card" style={{ padding: 0 }}>
          <EmptyState
            icon={CheckCircle}
            title={`No ${statusParam} requests`}
            description={`There are no ${statusParam} approval requests at this time.`}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {approvals.map(approval => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              isManager={isManager}
              statusParam={statusParam}
              actionLoading={actionLoading}
              remarks={remarks}
              onRemarkChange={(id, val) => setRemarks(p => ({ ...p, [id]: val }))}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ApprovalCard = ({ approval, isManager, statusParam, actionLoading, remarks, onRemarkChange, onAction }) => (
  <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
      {/* Main info */}
      <div style={{ flex: '1 1 300px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            backgroundColor: 'var(--primary-m)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FileText size={16} color="var(--primary)" />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--txt-m)' }}>
              RFQ Reference
            </span>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700,
              color: 'var(--txt)', margin: '2px 0 0', letterSpacing: '-0.01em',
            }}>
              {approval.rfq_title}
            </h3>
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '12px', padding: '16px',
          backgroundColor: 'var(--surface-2)',
          borderRadius: '10px', border: '1.5px solid var(--border)',
        }}>
          <InfoItem label="Selected Vendor">
            <div style={{ fontWeight: 600, color: 'var(--txt)', fontSize: '14px' }}>{approval.vendor_name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={10} fill={s <= Math.round(approval.vendor_rating || 0) ? 'var(--warning)' : 'transparent'} color="var(--warning)" />
              ))}
              <span style={{ fontSize: '11px', color: 'var(--txt-m)', marginLeft: '2px' }}>{approval.vendor_rating}/5</span>
            </div>
          </InfoItem>
          <InfoItem label="Total Value">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '17px', fontWeight: 700, color: 'var(--primary)' }}>
              ₹{Number(approval.total_price || 0).toLocaleString()}
            </span>
          </InfoItem>
          <InfoItem label="Submitted On">
            <span style={{ fontSize: '13px', color: 'var(--txt)' }}>{approval.submitted_at}</span>
          </InfoItem>
          <InfoItem label="Delivery">
            <span style={{ fontSize: '13px', color: 'var(--txt)' }}>{approval.delivery_days} days</span>
          </InfoItem>
        </div>
      </div>

      {/* Chain & actions */}
      <div style={{
        flex: '0 0 280px', padding: '24px',
        borderLeft: '1.5px solid var(--border)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        backgroundColor: 'var(--surface-2)',
      }}>
        <div>
          <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--txt-m)', marginBottom: '12px' }}>
            Approval Chain
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(approval.chain || []).map((stage, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                {idx < (approval.chain?.length - 1) && (
                  <div style={{ position: 'absolute', left: '7px', top: '20px', width: '2px', height: '18px', backgroundColor: 'var(--border)' }} />
                )}
                <div style={{
                  width: '16px', height: '16px', borderRadius: '999px',
                  border: `2px solid ${stage.status === 'approved' ? 'var(--primary)' : stage.status === 'pending' ? 'var(--warning)' : 'var(--border)'}`,
                  backgroundColor: stage.status === 'approved' ? 'var(--primary)' : 'var(--surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, zIndex: 1,
                }}>
                  {stage.status === 'approved' && <Check size={8} color="white" strokeWidth={3} />}
                  {stage.status === 'pending' && <div style={{ width: '6px', height: '6px', borderRadius: '999px', backgroundColor: 'var(--warning)' }} />}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: stage.status === 'locked' ? 'var(--txt-m)' : 'var(--txt)', margin: 0 }}>
                    {stage.role}
                  </p>
                  {stage.date && <p style={{ fontSize: '11px', color: 'var(--txt-m)', fontFamily: 'var(--font-mono)', margin: 0 }}>{stage.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isManager && statusParam === 'pending' && (
          <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--txt-2)', display: 'block', marginBottom: '6px' }}>
              Remarks (Optional)
            </label>
            <textarea
              value={remarks[approval.id] || ''}
              onChange={e => onRemarkChange(approval.id, e.target.value)}
              placeholder="Add notes…"
              style={{ width: '100%', minHeight: '60px', resize: 'none', fontSize: '13px', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onAction(approval.id, 'reject')}
                disabled={actionLoading === approval.id}
                className="btn btn-ghost"
                style={{ flex: 1, color: 'var(--danger)', borderColor: 'rgba(192,57,43,0.3)', fontSize: '13px' }}
              >
                <XCircle size={14} /> Reject
              </button>
              <button
                onClick={() => onAction(approval.id, 'approve')}
                disabled={actionLoading === approval.id}
                className="btn btn-primary"
                style={{ flex: 1, fontSize: '13px' }}
              >
                {actionLoading === approval.id ? '…' : <><Check size={14} /> Approve</>}
              </button>
            </div>
          </div>
        )}

        {statusParam !== 'pending' && approval.remarks && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1.5px solid var(--border)' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--txt-m)', marginBottom: '4px' }}>Remarks</p>
            <p style={{ fontSize: '13px', color: 'var(--txt)', fontStyle: 'italic' }}>{approval.remarks}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const InfoItem = ({ label, children }) => (
  <div>
    <p style={{ fontSize: '11px', color: 'var(--txt-m)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</p>
    {children}
  </div>
);

export default Approvals;

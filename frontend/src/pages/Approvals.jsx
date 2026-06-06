import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, Check, AlertCircle, Star, GitCommit } from 'lucide-react';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const mockApprovals = [
  { 
    id: 1, 
    quotation_id: 101, 
    vendor_name: "Infra Supplies", 
    vendor_rating: 4.5,
    rfq_title: "Office Furniture Procurement Q2", 
    total_price: 185000, 
    status: "pending", 
    submitted_at: "2024-12-05", 
    delivery_days: 10,
    stage: 2,
    chain: [
      { role: "Procurement Officer", status: "approved", date: "2024-12-05" },
      { role: "Department Manager", status: "pending", date: null },
      { role: "Finance Director", status: "locked", date: null }
    ]
  },
  { 
    id: 2, 
    quotation_id: 105, 
    vendor_name: "BuildRight Co", 
    vendor_rating: 4.8,
    rfq_title: "Warehouse Racking System", 
    total_price: 15000, 
    status: "pending", 
    submitted_at: "2024-12-08", 
    delivery_days: 21,
    stage: 1,
    chain: [
      { role: "Procurement Officer", status: "pending", date: null },
      { role: "Department Manager", status: "locked", date: null },
    ]
  }
];

const Approvals = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [remarks, setRemarks] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const res = await api.get('/approvals');
        if (res.success && res.data) setApprovals(res.data);
        else setApprovals(mockApprovals);
      } catch (err) {
        setApprovals(mockApprovals);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovals();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    const remark = remarks[id] || '';
    try {
      await api.post(`/approvals/${id}/${action}`, { remarks: remark });
      setApprovals(approvals.filter(a => a.id !== id));
      if (action === 'approve') {
        setTimeout(() => navigate('/po'), 800);
      }
    } catch (err) {
      setApprovals(approvals.filter(a => a.id !== id));
      if (action === 'approve') {
        setTimeout(() => navigate('/po'), 800);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemarkChange = (id, value) => {
    setRemarks(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Approval Queue</h2>
          <p className="text-sm text-text-secondary">Review and authorize pending procurement requests.</p>
        </div>
        <div className="bg-warning/10 text-warning px-3 py-1.5 rounded-full border border-warning/20 flex items-center gap-2 text-sm font-medium">
          <AlertCircle size={16} />
          {approvals.length} Pending
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-surface rounded-xl h-64 animate-pulse border border-border"></div>
          ))}
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-success/50" />
          <h3 className="text-xl font-bold text-text-primary mb-2">All caught up!</h3>
          <p className="text-text-secondary">There are no pending requests waiting for your approval.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {approvals.map(approval => (
            <div key={approval.id} className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col lg:flex-row gap-6">
              
              {/* Info Section */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-primary" />
                    <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">RFQ Reference</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">{approval.rfq_title}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-background/50 p-4 rounded-lg border border-border/50">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Selected Vendor</p>
                    <div className="flex flex-col">
                      <span className="font-medium text-text-primary">{approval.vendor_name}</span>
                      <span className="flex items-center gap-1 text-xs text-warning mt-0.5 font-medium">
                        <Star size={12} className="fill-warning" /> {approval.vendor_rating}/5 Rating
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Total Quotation Value</p>
                    <p className="font-mono text-lg font-bold text-success">₹{approval.total_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Submitted On</p>
                    <p className="text-sm text-text-primary">{approval.submitted_at}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Delivery Timeline</p>
                    <p className="text-sm text-text-primary">{approval.delivery_days} Days</p>
                  </div>
                </div>
              </div>

              {/* Chain & Action Section */}
              <div className="w-full lg:w-80 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
                
                {/* Approval Chain UI */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Approval Chain</h4>
                  <div className="space-y-3">
                    {approval.chain.map((stage, idx) => (
                      <div key={idx} className="flex gap-3 relative">
                        {idx !== approval.chain.length - 1 && (
                          <div className="absolute left-[7px] top-4 bottom-[-12px] w-[2px] bg-border"></div>
                        )}
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-surface
                          ${stage.status === 'approved' ? 'border-success' : stage.status === 'pending' ? 'border-warning' : 'border-border'}`}
                        >
                          {stage.status === 'approved' && <div className="w-2 h-2 rounded-full bg-success"></div>}
                          {stage.status === 'pending' && <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${stage.status === 'locked' ? 'text-text-secondary' : 'text-text-primary'}`}>
                            {stage.role}
                          </p>
                          {stage.date && <p className="text-xs text-text-secondary font-mono">{stage.date}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {isManager && (
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Your Remarks (Optional)</label>
                    <textarea
                      value={remarks[approval.id] || ''}
                      onChange={(e) => handleRemarkChange(approval.id, e.target.value)}
                      placeholder="Add approval or rejection notes..."
                      className="w-full h-16 text-sm resize-none mb-3"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(approval.id, 'reject')}
                        disabled={actionLoading === approval.id}
                        className="flex-1 btn btn-ghost text-danger hover:bg-danger/10 hover:text-danger hover:border-danger/30 flex justify-center items-center gap-2"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                      <button
                        onClick={() => handleAction(approval.id, 'approve')}
                        disabled={actionLoading === approval.id}
                        className="flex-1 btn btn-primary bg-success hover:bg-green-600 border-none flex justify-center items-center gap-2"
                      >
                        {actionLoading === approval.id ? 'Processing...' : (
                          <><Check size={16} /> Approve</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Approvals;

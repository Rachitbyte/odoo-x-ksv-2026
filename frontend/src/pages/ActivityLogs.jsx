import React, { useState, useEffect } from 'react';
import {
  Activity, User, Clock, FileText, CheckCircle, Package,
  Receipt, Users, Filter
} from 'lucide-react';
import api from '../lib/axios';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';

const mockLogs = [
  { id: 1, user_name: 'Admin User',       action: 'Created new RFQ',        entity_type: 'rfq',       entity_id: 'RFQ-2024-0001', created_at: '2024-12-01 10:30 AM' },
  { id: 2, user_name: 'TechSupplies Ltd', action: 'Submitted quotation',    entity_type: 'quotation', entity_id: 'Q-101',         created_at: '2024-12-05 02:15 PM' },
  { id: 3, user_name: 'Manager Sarah',    action: 'Approved quotation',     entity_type: 'approval',  entity_id: 'Q-101',         created_at: '2024-12-06 09:00 AM' },
  { id: 4, user_name: 'System',           action: 'Generated Purchase Order', entity_type: 'po',       entity_id: 'PO-2024-0001', created_at: '2024-12-06 09:01 AM' },
  { id: 5, user_name: 'System',           action: 'Generated Invoice',      entity_type: 'invoices',  entity_id: 'INV-2024-0001', created_at: '2024-12-06 04:45 PM' },
  { id: 6, user_name: 'Admin User',       action: 'Added new vendor',       entity_type: 'vendors',   entity_id: 'V-102',         created_at: '2024-12-07 11:20 AM' },
];

const entityConfig = {
  rfq:       { icon: FileText,    color: 'var(--info)',    bg: 'rgba(44,95,138,0.12)' },
  quotation: { icon: FileText,    color: 'var(--info)',    bg: 'rgba(44,95,138,0.12)' },
  approval:  { icon: CheckCircle, color: 'var(--primary)', bg: 'var(--primary-m)' },
  po:        { icon: Package,     color: 'var(--purple)',  bg: 'rgba(91,74,138,0.12)' },
  invoices:  { icon: Receipt,     color: 'var(--warning)', bg: 'rgba(184,115,51,0.12)' },
  vendors:   { icon: Users,       color: 'var(--success)', bg: 'rgba(45,74,62,0.12)' },
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/activity-logs')
      .then(res => setLogs(res.success ? res.data : mockLogs))
      .catch(() => setLogs(mockLogs))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.entity_type.includes(filter) || (filter === 'approval' && log.entity_type === 'quotation'));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }} className="animate-fade-in">
      <PageHeader
        title="Activity Logs"
        subtitle="Comprehensive audit trail of all platform actions."
        actions={
          <div className="input-icon-wrap" style={{ width: '180px' }}>
            <Filter size={14} className="input-icon" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '13px' }}
            >
              <option value="all">All Activities</option>
              <option value="rfq">RFQs & Quotations</option>
              <option value="approval">Approvals</option>
              <option value="invoices">Invoices & POs</option>
              <option value="vendors">Vendors</option>
            </select>
          </div>
        }
      />

      <div className="card" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '999px', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton" style={{ height: '14px', width: '55%' }} />
                  <div className="skeleton" style={{ height: '12px', width: '35%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity logs"
            description="No activity matches your current filter criteria."
          />
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute', left: '17px', top: '18px',
              bottom: '18px', width: '2px',
              backgroundColor: 'var(--border)',
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {filteredLogs.map((log, idx) => {
                const cfg = entityConfig[log.entity_type] || entityConfig.rfq;
                const Icon = cfg.icon;
                return (
                  <div key={log.id} style={{
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                    paddingBottom: idx < filteredLogs.length - 1 ? '20px' : 0,
                  }}
                    className="animate-fade-in"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '999px',
                      backgroundColor: cfg.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, zIndex: 1, position: 'relative',
                      border: '2px solid var(--surface)',
                    }}>
                      <Icon size={15} color={cfg.color} />
                    </div>

                    {/* Content */}
                    <div style={{
                      flex: 1, padding: '10px 14px', borderRadius: '10px',
                      border: '1.5px solid var(--border)',
                      backgroundColor: 'var(--surface-2)',
                      transition: 'border-color 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-s)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <p style={{ fontWeight: 600, color: 'var(--txt)', fontSize: '14px', margin: 0 }}>
                          {log.action}
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, color: 'var(--txt-m)', fontSize: '12px', marginLeft: '8px' }}>
                            ({log.entity_id})
                          </span>
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--txt-m)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                          <Clock size={11} />
                          {log.created_at}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--txt-2)' }}>
                        <User size={12} />
                        <span>By <strong style={{ color: 'var(--txt)', fontWeight: 600 }}>{log.user_name}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;

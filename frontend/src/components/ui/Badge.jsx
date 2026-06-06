/* Badge component — variants: success, warning, danger, info, purple, neutral */
const variantMap = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'badge-info',
  purple:  'badge-purple',
  neutral: 'badge-neutral',
};

/* Automatic status → variant mapping for procurement domain */
const statusVariant = {
  open:           'info',
  active:         'info',
  under_review:   'warning',
  pending:        'warning',
  pending_review: 'warning',
  approved:       'success',
  sent:           'success',
  received:       'success',
  paid:           'success',
  completed:      'success',
  rejected:       'danger',
  cancelled:      'danger',
  overdue:        'danger',
  closed:         'neutral',
  draft:          'neutral',
  submitted:      'purple',
  selected:       'success',
};

const statusLabel = {
  open:           'Open',
  active:         'Active',
  under_review:   'Under Review',
  pending:        'Pending',
  pending_review: 'Pending Review',
  approved:       'Approved',
  sent:           'Sent',
  received:       'Received',
  paid:           'Paid',
  completed:      'Completed',
  rejected:       'Rejected',
  cancelled:      'Cancelled',
  overdue:        'Overdue',
  closed:         'Closed',
  draft:          'Draft',
  submitted:      'Submitted',
  selected:       'Selected',
};

const Badge = ({ status, variant, children, className = '' }) => {
  const resolvedVariant = variant || statusVariant[status] || 'neutral';
  const cls = variantMap[resolvedVariant] || 'badge-neutral';
  const label = children || statusLabel[status] || status;

  return (
    <span className={`badge ${cls} ${className}`}>
      {label}
    </span>
  );
};

export default Badge;

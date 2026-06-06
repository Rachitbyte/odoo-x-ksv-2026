/* EmptyState component */
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  action = null,
  className = '',
}) => (
  <div
    className={className}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 32px',
      textAlign: 'center',
    }}
  >
    <div style={{
      width: '64px', height: '64px',
      borderRadius: '20px',
      backgroundColor: 'var(--primary-m)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '20px',
    }}>
      <Icon size={28} color="var(--primary)" strokeWidth={1.5} />
    </div>
    <h3 style={{
      fontFamily: 'var(--font-display)',
      fontSize: '18px',
      fontWeight: 600,
      color: 'var(--txt)',
      marginBottom: '8px',
    }}>
      {title}
    </h3>
    {description && (
      <p style={{
        fontSize: '14px',
        color: 'var(--txt-2)',
        maxWidth: '320px',
        lineHeight: 1.6,
        marginBottom: action ? '24px' : 0,
      }}>
        {description}
      </p>
    )}
    {action && action}
  </div>
);

export default EmptyState;

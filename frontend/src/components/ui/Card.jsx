/* Card component — premium enterprise surface */
const Card = ({
  children,
  className = '',
  interactive = false,
  padding = '24px',
  style = {},
  ...props
}) => (
  <div
    className={`card ${interactive ? 'card-interactive' : ''} ${className}`}
    style={{ padding, ...style }}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }) => (
  <div
    className={className}
    style={{
      paddingBottom: '16px',
      marginBottom: '16px',
      borderBottom: '1.5px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    }}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, subtitle, className = '' }) => (
  <div className={className}>
    <h3 style={{
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: '16px',
      color: 'var(--txt)',
      letterSpacing: '-0.01em',
      margin: 0,
    }}>
      {children}
    </h3>
    {subtitle && (
      <p style={{ fontSize: '13px', color: 'var(--txt-2)', marginTop: '2px' }}>
        {subtitle}
      </p>
    )}
  </div>
);

export default Card;

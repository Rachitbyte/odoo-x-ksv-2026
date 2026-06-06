/* PageHeader component — consistent page title area */
const PageHeader = ({ title, subtitle, actions, className = '' }) => (
  <div
    className={`animate-fade-in ${className}`}
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap',
    }}
  >
    <div>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '24px',
        fontWeight: 700,
        color: 'var(--txt)',
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        margin: 0,
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{
          fontSize: '14px',
          color: 'var(--txt-2)',
          marginTop: '4px',
          lineHeight: 1.5,
        }}>
          {subtitle}
        </p>
      )}
    </div>
    {actions && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {actions}
      </div>
    )}
  </div>
);

export default PageHeader;

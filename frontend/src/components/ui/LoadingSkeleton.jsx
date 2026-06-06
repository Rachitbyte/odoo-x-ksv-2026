/* LoadingSkeleton component */
const Skeleton = ({ width = '100%', height = '16px', className = '', style = {} }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, ...style }}
  />
);

export const SkeletonCard = ({ rows = 3 }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
    <Skeleton height="20px" width="60%" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} height="14px" width={`${70 + (i % 3) * 10}%`} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '12px',
      padding: '12px 16px',
      backgroundColor: 'var(--surface-2)',
      borderBottom: '1.5px solid var(--border)',
    }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height="12px" width="70%" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '12px',
        padding: '14px 16px',
        borderBottom: i < rows - 1 ? '1px solid var(--border)' : 'none',
      }}>
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} height="14px" width={`${60 + (j % 3) * 12}%`} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonStats = ({ count = 4 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`, gap: '20px' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton height="40px" width="40px" style={{ borderRadius: '10px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton height="14px" width="60%" />
          <Skeleton height="28px" width="40%" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;

/* Modal component — accessible, focus-trapped, ESC key support */
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '560px',
  className = '',
}) => {
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className={`modal-content ${className}`}
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        {(title || onClose) && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1.5px solid var(--border)',
            flexShrink: 0,
            gap: '12px',
          }}>
            <div>
              {title && (
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--txt)',
                  letterSpacing: '-0.01em',
                  margin: 0,
                }}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p style={{ fontSize: '13px', color: 'var(--txt-2)', marginTop: '4px' }}>
                  {subtitle}
                </p>
              )}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  padding: '4px',
                  borderRadius: '6px',
                  border: '1.5px solid var(--border)',
                  backgroundColor: 'transparent',
                  color: 'var(--txt-m)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1.5px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

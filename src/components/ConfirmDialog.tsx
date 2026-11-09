interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'oklch(20% 0.02 340 / 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 340,
          background: 'var(--surface)',
          borderRadius: 24,
          padding: 22,
          boxShadow: '0 20px 48px oklch(20% 0.02 340 / 0.3)',
        }}
      >
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 10 }}>
          {title}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-secondary)', marginBottom: 22 }}>{message}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div
            onClick={onCancel}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '12px 0',
              borderRadius: 14,
              background: 'var(--surface-alt)',
              color: 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </div>
          <div
            onClick={onConfirm}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '12px 0',
              borderRadius: 14,
              background: 'oklch(55% 0.2 25)',
              color: 'white',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

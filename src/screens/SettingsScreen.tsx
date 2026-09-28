import { useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface SettingsScreenProps {
  onClose: () => void;
  onExport: () => void;
  exporting: boolean;
  onImport: (file: File) => void;
  showRestorePurchases: boolean;
  onRestorePurchases: () => void;
}

export default function SettingsScreen({
  onClose,
  onExport,
  exporting,
  onImport,
  showRestorePurchases,
  onRestorePurchases,
}: SettingsScreenProps) {
  const { t } = useLanguage();
  const importInputRef = useRef<HTMLInputElement>(null);

  const items = [
    { icon: '⬇️', label: exporting ? t.home.menuExporting : t.home.menuExport, onClick: onExport, disabled: exporting },
    { icon: '⬆️', label: t.home.menuImport, onClick: () => importInputRef.current?.click(), disabled: false },
    ...(showRestorePurchases
      ? [{ icon: '♻️', label: t.premium.restoreMenuLabel, onClick: onRestorePurchases, disabled: false }]
      : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onImport(file);
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px 10px', flexShrink: 0 }}>
        <div
          onClick={onClose}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'var(--surface)',
            boxShadow: '0 2px 8px oklch(50% 0.05 340 / 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          ←
        </div>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 19, color: 'var(--text-primary)' }}>
          {t.settings.title}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item) => (
          <div
            key={item.icon}
            onClick={() => {
              if (item.disabled) return;
              item.onClick();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'var(--surface)',
              borderRadius: 16,
              padding: '14px 16px',
              fontSize: 15,
              fontWeight: 700,
              color: item.disabled ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: item.disabled ? 'default' : 'pointer',
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

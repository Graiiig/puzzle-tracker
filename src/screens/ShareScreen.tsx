import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { ShareInvite, SharedOwner } from '../types';

interface ShareScreenProps {
  pseudo: string;
  onSavePseudo: (value: string) => Promise<boolean>;
  myShares: ShareInvite[];
  onAddShare: (email: string) => Promise<boolean>;
  onRemoveShare: (id: string) => void;
  sharedWithMe: SharedOwner[];
  onClose: () => void;
}

export default function ShareScreen({
  pseudo,
  onSavePseudo,
  myShares,
  onAddShare,
  onRemoveShare,
  sharedWithMe,
  onClose,
}: ShareScreenProps) {
  const { t } = useLanguage();
  const [pseudoInput, setPseudoInput] = useState(pseudo);
  const [pseudoSaved, setPseudoSaved] = useState(false);
  const [savingPseudo, setSavingPseudo] = useState(false);
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState(false);

  async function handleSavePseudo() {
    const trimmed = pseudoInput.trim();
    if (!trimmed || savingPseudo) return;
    setSavingPseudo(true);
    const ok = await onSavePseudo(trimmed);
    setSavingPseudo(false);
    setPseudoSaved(ok);
  }

  async function handleInvite() {
    const trimmed = email.trim();
    if (!trimmed || inviting) return;
    setInviting(true);
    setInviteError(false);
    const ok = await onAddShare(trimmed);
    setInviting(false);
    if (ok) {
      setEmail('');
    } else {
      setInviteError(true);
    }
  }

  function handleRemove(share: ShareInvite) {
    if (window.confirm(t.share.removeConfirm(share.invitedEmail))) {
      onRemoveShare(share.id);
    }
  }

  const canInvite = pseudo.trim().length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'oklch(97% 0.015 70)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px 10px', flexShrink: 0 }}>
        <div
          onClick={onClose}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 2px 8px oklch(50% 0.05 340 / 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            cursor: 'pointer',
            color: 'oklch(35% 0.02 340)',
          }}
        >
          ←
        </div>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 19, color: 'oklch(28% 0.02 340)' }}>
          {t.share.title}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 28px' }}>
        <div style={{ marginTop: 8 }}>
          <div className="field-label">{t.share.pseudoLabel}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="field-input"
              value={pseudoInput}
              onChange={(e) => {
                setPseudoInput(e.target.value);
                setPseudoSaved(false);
              }}
              placeholder={t.share.pseudoPlaceholder}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleSavePseudo}
              disabled={savingPseudo || !pseudoInput.trim()}
              style={{
                flexShrink: 0,
                padding: '0 18px',
                borderRadius: 14,
                border: 'none',
                background: 'oklch(93% 0.05 300)',
                color: 'oklch(42% 0.16 300)',
                fontWeight: 800,
                fontSize: 13,
                cursor: savingPseudo || !pseudoInput.trim() ? 'default' : 'pointer',
                opacity: savingPseudo || !pseudoInput.trim() ? 0.6 : 1,
              }}
            >
              {t.share.pseudoSave}
            </button>
          </div>
          {pseudoSaved && (
            <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: 'oklch(50% 0.15 150)' }}>
              {t.share.pseudoSaved}
            </div>
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <div className="field-label">{t.share.inviteTitle}</div>
          {!canInvite && (
            <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'oklch(55% 0.03 340)' }}>
              {t.share.pseudoRequiredHint}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="field-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setInviteError(false);
              }}
              placeholder={t.share.inviteEmailPlaceholder}
              disabled={!canInvite}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleInvite}
              disabled={!canInvite || inviting || !email.trim()}
              style={{
                flexShrink: 0,
                padding: '0 18px',
                borderRadius: 14,
                border: 'none',
                background: 'oklch(93% 0.05 300)',
                color: 'oklch(42% 0.16 300)',
                fontWeight: 800,
                fontSize: 13,
                cursor: !canInvite || inviting || !email.trim() ? 'default' : 'pointer',
                opacity: !canInvite || inviting || !email.trim() ? 0.6 : 1,
              }}
            >
              {t.share.inviteButton}
            </button>
          </div>
          {inviteError && (
            <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: 'oklch(50% 0.18 30)' }}>
              {t.share.inviteError}
            </div>
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <div className="field-label" style={{ marginBottom: 8 }}>
            {t.share.invitedListTitle}
          </div>
          {myShares.length === 0 && (
            <div style={{ fontSize: 13, fontWeight: 600, color: 'oklch(55% 0.03 340)' }}>{t.share.invitedEmpty}</div>
          )}
          {myShares.map((share) => (
            <div
              key={share.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'white',
                borderRadius: 14,
                padding: '11px 14px',
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: 'oklch(30% 0.02 340)' }}>{share.invitedEmail}</span>
              <span onClick={() => handleRemove(share)} style={{ cursor: 'pointer', fontSize: 16, color: 'oklch(55% 0.03 340)' }}>
                ✕
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <div className="field-label" style={{ marginBottom: 8 }}>
            {t.share.sharedWithMeTitle}
          </div>
          {sharedWithMe.length === 0 && (
            <div style={{ fontSize: 13, fontWeight: 600, color: 'oklch(55% 0.03 340)' }}>
              {t.share.sharedWithMeEmpty}
            </div>
          )}
          {sharedWithMe.length > 0 && (
            <>
              {sharedWithMe.map((owner) => (
                <div
                  key={owner.userId}
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    padding: '11px 14px',
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'oklch(30% 0.02 340)',
                  }}
                >
                  {owner.pseudo}
                </div>
              ))}
              <div style={{ fontSize: 12, fontWeight: 600, color: 'oklch(55% 0.03 340)', marginTop: 4 }}>
                {t.share.sharedWithMeHint}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

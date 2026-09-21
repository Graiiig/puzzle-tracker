import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { ShareInvite, SharedOwner } from '../types';

interface ShareScreenProps {
  pseudo: string;
  onSavePseudo: (value: string) => Promise<boolean>;
  myShares: ShareInvite[];
  onAddShare: (email: string, options: { shareCollection: boolean; shareWishlist: boolean }) => Promise<boolean>;
  onUpdateShare: (id: string, patch: { shareCollection?: boolean; shareWishlist?: boolean }) => void;
  onRemoveShare: (id: string) => void;
  sharedCollectionOwners: SharedOwner[];
  sharedWishlistOwners: SharedOwner[];
  onClose: () => void;
}

export default function ShareScreen({
  pseudo,
  onSavePseudo,
  myShares,
  onAddShare,
  onUpdateShare,
  onRemoveShare,
  sharedCollectionOwners,
  sharedWishlistOwners,
  onClose,
}: ShareScreenProps) {
  const { t } = useLanguage();
  const [pseudoInput, setPseudoInput] = useState(pseudo);
  const [pseudoSaved, setPseudoSaved] = useState(false);
  const [savingPseudo, setSavingPseudo] = useState(false);
  const [email, setEmail] = useState('');
  const [shareCollection, setShareCollection] = useState(true);
  const [shareWishlist, setShareWishlist] = useState(false);
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
    if (!trimmed || inviting || (!shareCollection && !shareWishlist)) return;
    setInviting(true);
    setInviteError(false);
    const ok = await onAddShare(trimmed, { shareCollection, shareWishlist });
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

  function toggleShareFlag(share: ShareInvite, flag: 'shareCollection' | 'shareWishlist') {
    const next = !share[flag];
    const other = flag === 'shareCollection' ? share.shareWishlist : share.shareCollection;
    if (!next && !other) return; // keep at least one enabled
    onUpdateShare(share.id, { [flag]: next });
  }

  const canInvite = pseudo.trim().length > 0;

  const sharedWithMeMap = new Map<string, { userId: string; pseudo: string; collection: boolean; wishlist: boolean }>();
  for (const o of sharedCollectionOwners) {
    sharedWithMeMap.set(o.userId, { userId: o.userId, pseudo: o.pseudo, collection: true, wishlist: false });
  }
  for (const o of sharedWishlistOwners) {
    const existing = sharedWithMeMap.get(o.userId);
    sharedWithMeMap.set(o.userId, {
      userId: o.userId,
      pseudo: o.pseudo,
      collection: existing?.collection ?? false,
      wishlist: true,
    });
  }
  const sharedWithMe = [...sharedWithMeMap.values()];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
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
            <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
              {t.share.pseudoRequiredHint}
            </div>
          )}
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
          />
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={shareCollection}
                onChange={(e) => setShareCollection(e.target.checked)}
                disabled={!canInvite}
              />
              {t.share.shareCollectionLabel}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={shareWishlist}
                onChange={(e) => setShareWishlist(e.target.checked)}
                disabled={!canInvite}
              />
              {t.share.shareWishlistLabel}
            </label>
          </div>
          {!shareCollection && !shareWishlist && (
            <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: 'oklch(50% 0.18 30)' }}>
              {t.share.atLeastOneRequiredHint}
            </div>
          )}
          <button
            type="button"
            onClick={handleInvite}
            disabled={!canInvite || inviting || !email.trim() || (!shareCollection && !shareWishlist)}
            style={{
              width: '100%',
              marginTop: 10,
              padding: '11px 18px',
              borderRadius: 14,
              border: 'none',
              background: 'oklch(93% 0.05 300)',
              color: 'oklch(42% 0.16 300)',
              fontWeight: 800,
              fontSize: 13,
              cursor:
                !canInvite || inviting || !email.trim() || (!shareCollection && !shareWishlist) ? 'default' : 'pointer',
              opacity: !canInvite || inviting || !email.trim() || (!shareCollection && !shareWishlist) ? 0.6 : 1,
            }}
          >
            {t.share.inviteButton}
          </button>
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
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{t.share.invitedEmpty}</div>
          )}
          {myShares.map((share) => (
            <div
              key={share.id}
              style={{
                background: 'var(--surface)',
                borderRadius: 14,
                padding: '11px 14px',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{share.invitedEmail}</span>
                <span onClick={() => handleRemove(share)} style={{ cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}>
                  ✕
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>
                  <input
                    type="checkbox"
                    checked={share.shareCollection}
                    onChange={() => toggleShareFlag(share, 'shareCollection')}
                  />
                  {t.share.shareCollectionLabel}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>
                  <input
                    type="checkbox"
                    checked={share.shareWishlist}
                    onChange={() => toggleShareFlag(share, 'shareWishlist')}
                  />
                  {t.share.shareWishlistLabel}
                </label>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <div className="field-label" style={{ marginBottom: 8 }}>
            {t.share.sharedWithMeTitle}
          </div>
          {sharedWithMe.length === 0 && (
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
              {t.share.sharedWithMeEmpty}
            </div>
          )}
          {sharedWithMe.length > 0 && (
            <>
              {sharedWithMe.map((owner) => (
                <div
                  key={owner.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--surface)',
                    borderRadius: 14,
                    padding: '11px 14px',
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{owner.pseudo}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {owner.collection && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: 100,
                          background: 'oklch(92% 0.05 300)',
                          color: 'oklch(42% 0.16 300)',
                        }}
                      >
                        {t.share.shareCollectionLabel}
                      </span>
                    )}
                    {owner.wishlist && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: 100,
                          background: 'oklch(93% 0.06 350)',
                          color: 'oklch(45% 0.2 350)',
                        }}
                      >
                        {t.share.shareWishlistLabel}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>
                {t.share.sharedWithMeHint}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';

const ADMIN_EMAIL = 'gregory.verguin@hotmail.fr';

interface AdminChampionship {
  id: string;
  title: string;
  start_date: string;
  end_date: string | null;
  location: string;
  stream_url: string | null;
  info_url: string | null;
  is_live: boolean;
  is_published: boolean;
}

interface FormState {
  id: string | null;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  streamUrl: string;
  infoUrl: string;
  isLive: boolean;
  isPublished: boolean;
}

const EMPTY_FORM: FormState = {
  id: null,
  title: '',
  startDate: '',
  endDate: '',
  location: '',
  streamUrl: '',
  infoUrl: '',
  isLive: false,
  isPublished: true,
};

function toFormState(c: AdminChampionship): FormState {
  return {
    id: c.id,
    title: c.title,
    startDate: c.start_date,
    endDate: c.end_date ?? '',
    location: c.location,
    streamUrl: c.stream_url ?? '',
    infoUrl: c.info_url ?? '',
    isLive: c.is_live,
    isPublished: c.is_published,
  };
}

const labelStyle: CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' };
const inputStyle: CSSProperties = {
  width: '100%',
  padding: '9px 11px',
  borderRadius: 10,
  border: '1px solid oklch(85% 0.02 340)',
  fontSize: 14,
  fontFamily: "'Nunito',sans-serif",
  marginBottom: 12,
  boxSizing: 'border-box',
};
const buttonStyle: CSSProperties = {
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  fontWeight: 800,
  fontSize: 14,
  cursor: 'pointer',
};

function LoginPanel() {
  const { signInWithEmail, verifyCode } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signInWithEmail(email.trim());
    setBusy(false);
    if (error) setError(error);
    else setSent(true);
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await verifyCode(email.trim(), code);
    setBusy(false);
    if (error) setError(error);
  }

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', padding: 24 }}>
      <h1 style={{ fontFamily: "'Baloo 2',sans-serif", fontSize: 22, marginBottom: 16 }}>Admin — Championnats</h1>
      {!sent ? (
        <form onSubmit={handleSend}>
          <label style={labelStyle}>Adresse email</label>
          <input
            style={inputStyle}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.com"
            required
          />
          <button style={{ ...buttonStyle, background: 'var(--accent-pink)', color: 'white' }} disabled={busy}>
            {busy ? 'Envoi...' : 'Recevoir le code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <label style={labelStyle}>Code reçu par email</label>
          <input
            style={inputStyle}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code"
            required
          />
          <button style={{ ...buttonStyle, background: 'var(--accent-pink)', color: 'white' }} disabled={busy}>
            {busy ? 'Vérification...' : 'Se connecter'}
          </button>
        </form>
      )}
      {error && <div style={{ color: 'var(--badge-red-fg)', marginTop: 12, fontWeight: 700 }}>{error}</div>}
    </div>
  );
}

export default function AdminApp() {
  const { user, loading, signOut } = useAuth();
  const [items, setItems] = useState<AdminChampionship[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  const refresh = useCallback(async () => {
    setListLoading(true);
    const { data, error } = await supabase.from('championships').select('*').order('start_date', { ascending: false });
    if (!error && data) setItems(data as AdminChampionship[]);
    setListLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin, refresh]);

  if (loading) return <div style={{ padding: 40 }}>Chargement...</div>;
  if (!user) return <LoginPanel />;
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 360, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <p style={{ fontWeight: 700 }}>Ce compte n'est pas autorisé à accéder à cette page.</p>
        <button style={{ ...buttonStyle, background: 'var(--surface-alt)', marginTop: 12 }} onClick={signOut}>
          Se déconnecter
        </button>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaveError(null);
    const payload = {
      title: form.title.trim(),
      start_date: form.startDate,
      end_date: form.endDate || null,
      location: form.location.trim(),
      stream_url: form.streamUrl.trim() || null,
      info_url: form.infoUrl.trim() || null,
      is_live: form.isLive,
      is_published: form.isPublished,
    };
    const { error } = form.id
      ? await supabase.from('championships').update(payload).eq('id', form.id)
      : await supabase.from('championships').insert(payload);
    if (error) {
      setSaveError(error.message);
      return;
    }
    setForm(null);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Supprimer ce championnat ?')) return;
    await supabase.from('championships').delete().eq('id', id);
    refresh();
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Baloo 2',sans-serif", fontSize: 22, margin: 0 }}>Admin — Championnats</h1>
        <button style={{ ...buttonStyle, background: 'var(--surface-alt)' }} onClick={signOut}>
          Se déconnecter
        </button>
      </div>

      {form ? (
        <form
          onSubmit={handleSubmit}
          style={{ background: 'var(--surface)', borderRadius: 16, padding: 20, marginBottom: 24 }}
        >
          <label style={labelStyle}>Titre</label>
          <input
            style={inputStyle}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date de début</label>
              <input
                style={inputStyle}
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date de fin (optionnel)</label>
              <input
                style={inputStyle}
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <label style={labelStyle}>Lieu</label>
          <input style={inputStyle} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <label style={labelStyle}>Lien du stream (optionnel)</label>
          <input
            style={inputStyle}
            type="url"
            value={form.streamUrl}
            onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
            placeholder="https://..."
          />
          <label style={labelStyle}>Lien infos (optionnel)</label>
          <input
            style={inputStyle}
            type="url"
            value={form.infoUrl}
            onChange={(e) => setForm({ ...form, infoUrl: e.target.value })}
            placeholder="https://..."
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 10 }}>
            <input type="checkbox" checked={form.isLive} onChange={(e) => setForm({ ...form, isLive: e.target.checked })} />
            En direct maintenant (affiche le bandeau live dans l'app)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 16 }}>
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            Publié (visible dans l'app)
          </label>
          {saveError && <div style={{ color: 'var(--badge-red-fg)', marginBottom: 12, fontWeight: 700 }}>{saveError}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ ...buttonStyle, background: 'var(--accent-pink)', color: 'white' }}>Enregistrer</button>
            <button type="button" style={{ ...buttonStyle, background: 'var(--surface-alt)' }} onClick={() => setForm(null)}>
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button style={{ ...buttonStyle, background: 'var(--accent-pink)', color: 'white', marginBottom: 20 }} onClick={() => setForm(EMPTY_FORM)}>
          + Ajouter un championnat
        </button>
      )}

      {listLoading ? (
        <div>Chargement...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((c) => (
            <div key={c.id} style={{ background: 'var(--surface)', borderRadius: 14, padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>
                  {c.title}
                  {c.is_live && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--badge-red-fg)', background: 'var(--badge-red-bg)', borderRadius: 999, padding: '2px 8px' }}>🔴 live</span>}
                  {!c.is_published && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface-alt)', borderRadius: 999, padding: '2px 8px' }}>brouillon</span>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  {c.start_date}
                  {c.end_date ? ` → ${c.end_date}` : ''}
                  {c.location ? ` · ${c.location}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button style={{ ...buttonStyle, background: 'var(--surface-alt)', padding: '6px 12px', fontSize: 13 }} onClick={() => setForm(toFormState(c))}>
                  Modifier
                </button>
                <button style={{ ...buttonStyle, background: 'var(--badge-red-bg)', color: 'var(--badge-red-fg)', padding: '6px 12px', fontSize: 13 }} onClick={() => handleDelete(c.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div style={{ color: 'var(--text-muted)' }}>Aucun championnat pour l'instant.</div>}
        </div>
      )}
    </div>
  );
}

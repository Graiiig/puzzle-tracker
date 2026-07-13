import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const { signInWithEmail, verifyCode } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    setError('');
    const { error } = await signInWithEmail(email.trim());
    if (error) {
      setError(error);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus('verifying');
    setError('');
    const { error } = await verifyCode(email.trim(), code);
    if (error) {
      setError(error);
      setStatus('sent');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'oklch(97% 0.015 70)' }}>
      <div
        style={{
          padding: '40px 24px 32px',
          background: 'linear-gradient(135deg, oklch(68% 0.23 350), oklch(64% 0.2 320))',
          borderRadius: '0 0 28px 28px',
          boxShadow: '0 8px 24px oklch(70% 0.2 350 / 0.35)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 40 }}>🧩</div>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 26, color: 'white', marginTop: 8 }}>
          Mes Puzzles
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'oklch(97% 0.02 70 / 0.9)', marginTop: 6 }}>
          Ta collection, synchronisée partout
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 28px' }}>
        {status === 'sent' || status === 'verifying' ? (
          <form onSubmit={handleVerifyCode}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
              <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 18, color: 'oklch(28% 0.02 340)' }}>
                Vérifie ta boîte mail
              </div>
              <div style={{ fontSize: 14, color: 'oklch(50% 0.03 340)', marginTop: 8, lineHeight: 1.5 }}>
                On a envoyé un code à 6 chiffres à <strong>{email}</strong>.
              </div>
            </div>
            <div className="field-label">Code de connexion</div>
            <input
              className="field-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              style={{ textAlign: 'center', letterSpacing: 6, fontSize: 20, fontWeight: 700 }}
            />
            {error ? (
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: 'oklch(55% 0.2 25)' }}>{error}</div>
            ) : null}
            <button
              type="submit"
              disabled={status === 'verifying'}
              style={{
                marginTop: 16,
                width: '100%',
                background: 'linear-gradient(135deg, oklch(68% 0.23 350), oklch(62% 0.19 320))',
                color: 'white',
                fontFamily: "'Baloo 2',sans-serif",
                fontWeight: 700,
                fontSize: 16,
                textAlign: 'center',
                padding: 15,
                borderRadius: 16,
                border: 'none',
                cursor: status === 'verifying' ? 'default' : 'pointer',
                opacity: status === 'verifying' ? 0.7 : 1,
                boxShadow: '0 6px 16px oklch(60% 0.2 350 / 0.3)',
              }}
            >
              {status === 'verifying' ? 'Vérification...' : 'Se connecter'}
            </button>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800 }}>
              <span
                onClick={() => {
                  setStatus('idle');
                  setCode('');
                  setError('');
                }}
                style={{ color: 'oklch(55% 0.03 340)', cursor: 'pointer' }}
              >
                Modifier l'adresse email
              </span>
              <span
                onClick={(e) => handleSendCode(e as unknown as React.FormEvent)}
                style={{ color: 'oklch(55% 0.2 350)', cursor: 'pointer' }}
              >
                Renvoyer le code
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendCode}>
            <div className="field-label">Ton adresse email</div>
            <input
              className="field-input"
              type="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.com"
            />
            {status === 'error' && (
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: 'oklch(55% 0.2 25)' }}>{error}</div>
            )}
            <button
              type="submit"
              disabled={status === 'sending'}
              style={{
                marginTop: 16,
                width: '100%',
                background: 'linear-gradient(135deg, oklch(68% 0.23 350), oklch(62% 0.19 320))',
                color: 'white',
                fontFamily: "'Baloo 2',sans-serif",
                fontWeight: 700,
                fontSize: 16,
                textAlign: 'center',
                padding: 15,
                borderRadius: 16,
                border: 'none',
                cursor: status === 'sending' ? 'default' : 'pointer',
                opacity: status === 'sending' ? 0.7 : 1,
                boxShadow: '0 6px 16px oklch(60% 0.2 350 / 0.3)',
              }}
            >
              {status === 'sending' ? 'Envoi...' : 'Recevoir le code'}
            </button>
            <div style={{ marginTop: 14, fontSize: 12, color: 'oklch(55% 0.03 340)', textAlign: 'center', lineHeight: 1.5 }}>
              Pas de mot de passe : tu reçois un code à 6 chiffres par email pour te connecter.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

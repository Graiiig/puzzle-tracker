import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface TimerScreenProps {
  onClose: () => void;
}

type Mode = 'stopwatch' | 'countdown';

const PRESET_MINUTES = [15, 30, 45, 60];

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

function playBeep() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => ctx.close();
  } catch {
    // Web Audio unsupported — fail silently, the finished state is still shown visually.
  }
}

export default function TimerScreen({ onClose }: TimerScreenProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('stopwatch');

  const [swElapsed, setSwElapsed] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const swStartRef = useRef<number | null>(null);

  const [cdMinutes, setCdMinutes] = useState(30);
  const [cdRemaining, setCdRemaining] = useState<number | null>(null);
  const [cdRunning, setCdRunning] = useState(false);
  const [cdFinished, setCdFinished] = useState(false);
  const cdTargetRef = useRef<number | null>(null);

  useEffect(() => {
    if (!swRunning) return;
    const id = setInterval(() => {
      if (swStartRef.current !== null) setSwElapsed((Date.now() - swStartRef.current) / 1000);
    }, 250);
    return () => clearInterval(id);
  }, [swRunning]);

  useEffect(() => {
    if (!cdRunning) return;
    const id = setInterval(() => {
      if (cdTargetRef.current === null) return;
      const remaining = (cdTargetRef.current - Date.now()) / 1000;
      if (remaining <= 0) {
        setCdRemaining(0);
        setCdRunning(false);
        setCdFinished(true);
        playBeep();
      } else {
        setCdRemaining(remaining);
      }
    }, 250);
    return () => clearInterval(id);
  }, [cdRunning]);

  function startStopwatch() {
    swStartRef.current = Date.now() - swElapsed * 1000;
    setSwRunning(true);
  }
  function resetStopwatch() {
    setSwRunning(false);
    setSwElapsed(0);
    swStartRef.current = null;
  }

  function startCountdown() {
    const base = cdRemaining ?? cdMinutes * 60;
    cdTargetRef.current = Date.now() + base * 1000;
    setCdRemaining(base);
    setCdFinished(false);
    setCdRunning(true);
  }
  function pauseCountdown() {
    if (cdTargetRef.current !== null) setCdRemaining(Math.max(0, (cdTargetRef.current - Date.now()) / 1000));
    setCdRunning(false);
  }
  function resetCountdown() {
    setCdRunning(false);
    setCdFinished(false);
    setCdRemaining(null);
    cdTargetRef.current = null;
  }

  function switchMode(next: Mode) {
    setMode(next);
  }

  const bigDigitStyle = {
    fontFamily: "'Baloo 2',sans-serif",
    fontWeight: 800,
    fontSize: 56,
    color: 'var(--text-primary)',
    letterSpacing: 1,
  };

  function actionButtonStyle(variant: 'primary' | 'secondary') {
    return {
      flex: 1,
      textAlign: 'center' as const,
      padding: '14px 0',
      borderRadius: 16,
      background: variant === 'primary' ? 'var(--accent-gradient)' : 'var(--surface-alt)',
      color: variant === 'primary' ? 'white' : 'var(--text-secondary)',
      fontWeight: 800,
      fontSize: 15,
      cursor: 'pointer',
    };
  }

  const cdNotStarted = cdRemaining === null && !cdFinished;

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
          {t.timer.title}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 8, background: 'var(--surface-alt)', borderRadius: 14, padding: 4 }}>
          {(['stopwatch', 'countdown'] as Mode[]).map((m) => (
            <div
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px 0',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === m ? '0 2px 8px oklch(50% 0.05 340 / 0.12)' : 'none',
              }}
            >
              {m === 'stopwatch' ? t.timer.tabStopwatch : t.timer.tabCountdown}
            </div>
          ))}
        </div>

        {mode === 'stopwatch' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, marginTop: 20 }}>
            <div style={bigDigitStyle}>{formatTime(swElapsed)}</div>
            <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 320 }}>
              <div style={actionButtonStyle('secondary')} onClick={resetStopwatch}>
                {t.timer.reset}
              </div>
              <div
                style={actionButtonStyle('primary')}
                onClick={() => (swRunning ? setSwRunning(false) : startStopwatch())}
              >
                {swRunning ? t.timer.pause : swElapsed > 0 ? t.timer.resume : t.timer.start}
              </div>
            </div>
          </div>
        )}

        {mode === 'countdown' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, marginTop: 20 }}>
            {cdNotStarted ? (
              <>
                <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>{t.timer.durationLabel}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {PRESET_MINUTES.map((n) => (
                      <div
                        key={n}
                        onClick={() => setCdMinutes(n)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: 999,
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: 'pointer',
                          background: cdMinutes === n ? 'var(--accent-gradient)' : 'var(--surface)',
                          color: cdMinutes === n ? 'white' : 'var(--text-tertiary)',
                        }}
                      >
                        {t.timer.presetMinutes(n)}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginTop: 6 }}>
                    {t.timer.customLabel}
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={cdMinutes}
                    onChange={(e) => setCdMinutes(Math.max(1, Math.min(999, Number(e.target.value) || 1)))}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: 'none',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  />
                </div>
                <div style={{ width: '100%', maxWidth: 320 }}>
                  <div style={actionButtonStyle('primary')} onClick={startCountdown}>
                    {t.timer.start}
                  </div>
                </div>
              </>
            ) : cdFinished ? (
              <>
                <div style={bigDigitStyle}>{formatTime(0)}</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--text-primary)' }}>
                    {t.timer.finishedTitle}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>
                    {t.timer.finishedBody}
                  </div>
                </div>
                <div style={{ width: '100%', maxWidth: 320 }}>
                  <div style={actionButtonStyle('primary')} onClick={resetCountdown}>
                    {t.timer.newCountdown}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={bigDigitStyle}>{formatTime(cdRemaining ?? 0)}</div>
                <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 320 }}>
                  <div style={actionButtonStyle('secondary')} onClick={resetCountdown}>
                    {t.timer.reset}
                  </div>
                  <div style={actionButtonStyle('primary')} onClick={() => (cdRunning ? pauseCountdown() : startCountdown())}>
                    {cdRunning ? t.timer.pause : t.timer.resume}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

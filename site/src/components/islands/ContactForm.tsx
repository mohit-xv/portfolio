/** @jsxImportSource react */
/**
 * ContactForm — Phase 5.
 *
 * Intercepts the HTML form's submit event and POSTs JSON to the contact Lambda.
 * Shows a loading state on the button and a success / error message afterward.
 *
 * API_URL is injected at build time via import.meta.env.PUBLIC_API_URL.
 * In local dev (no env var) the fetch will fail gracefully — the error state
 * shows instead of crashing the page.
 *
 * Turnstile widget is loaded lazily when the site key env var is present.
 * In local dev with no site key, the widget is skipped — the Lambda accepts
 * submissions with an empty token when TURNSTILE_SECRET_KEY is not set.
 */
import { useState, useRef } from 'react';
import type { FormEvent } from 'react';

const API_URL = import.meta.env.PUBLIC_API_URL;
const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus]     = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const formRef                 = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;

    setStatus('loading');
    setErrorMsg('');

    const data = new FormData(formRef.current);
    const payload: Record<string, string> = {};
    data.forEach((v, k) => { payload[k] = String(v); });

    const endpoint = API_URL ? `${API_URL}/api/contact` : '/api/contact';

    try {
      const res = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const json = await res.json() as { ok: boolean; error?: string };

      if (json.ok) {
        setStatus('success');
        formRef.current?.reset();
      } else {
        setStatus('error');
        setErrorMsg(json.error ?? 'Something went wrong — please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Could not reach the server — check your connection and try again.');
    }
  }

  if (status === 'success') {
    return (
      <div style={successStyle}>
        <p style={successHeadStyle}>Message received.</p>
        <p style={successSubStyle}>
          I reply within 48 hours. No sales deck, no discovery call — just a
          conversation about the problem.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
    >
      {/* Honeypot — hidden from real users, bots fill it */}
      <input
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, overflow: 'hidden' }}
      />

      <Field id="name"    label="Name"    type="text"  name="name"    required autocomplete="name"   placeholder="Mohit Singh" />
      <Field id="email"   label="Email"   type="email" name="email"   required autocomplete="email"  placeholder="you@company.com" />

      <div style={fieldStyle}>
        <label htmlFor="context" style={labelStyle}>Context</label>
        <select id="context" name="context" required style={selectStyle}>
          <option value="" disabled>What's this about?</option>
          <option value="role">A role or internship</option>
          <option value="aws-bill">An AWS bill that looks wrong</option>
          <option value="project">A project or collaboration</option>
          <option value="other">Something else</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label htmlFor="message" style={labelStyle}>Message</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Brief context — what you're working on, what you need."
          style={textareaStyle}
        />
      </div>

      {TURNSTILE_SITE_KEY && (
        <div
          className="cf-turnstile"
          data-sitekey={TURNSTILE_SITE_KEY}
          data-theme="dark"
        />
      )}

      {status === 'error' && (
        <p style={errorStyle} role="alert">{errorMsg}</p>
      )}

      <button type="submit" disabled={status === 'loading'} style={submitStyle(status === 'loading')}>
        {status === 'loading' ? 'Sending…' : 'Send message'}
        {status !== 'loading' && <span aria-hidden="true" style={{ transition: 'transform 0.2s' }}>→</span>}
      </button>
    </form>
  );
}

/* ── Sub-components ────────────────────────────────────────────────────────── */

function Field({
  id, label, type, name, required, autocomplete, placeholder,
}: {
  id: string; label: string; type: string; name: string;
  required?: boolean; autocomplete?: string; placeholder?: string;
}) {
  return (
    <div style={fieldStyle}>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      <input
        id={id} type={type} name={name}
        required={required} autoComplete={autocomplete}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

/* ── Inline styles (match global.css tokens via CSS custom properties) ─────── */

const fieldStyle: React.CSSProperties = {
  display:       'flex',
  flexDirection: 'column',
  gap:           'var(--space-2)',
};

const labelStyle: React.CSSProperties = {
  fontFamily:    'var(--font-mono)',
  fontSize:      'var(--text-xs)',
  letterSpacing: 'var(--tracking-wider)',
  textTransform: 'uppercase',
  color:         'var(--gold)',
};

const inputBase: React.CSSProperties = {
  fontFamily:    'var(--font-ui)',
  fontSize:      'var(--text-base)',
  color:         'var(--bone)',
  background:    'var(--smoke)',
  border:        '1px solid color-mix(in srgb, var(--gold) 20%, transparent)',
  borderRadius:  'var(--radius-sm)',
  padding:       'var(--space-4) var(--space-5)',
  outline:       'none',
  width:         '100%',
  boxSizing:     'border-box',
};

const inputStyle: React.CSSProperties   = { ...inputBase };
const selectStyle: React.CSSProperties  = { ...inputBase, appearance: 'none', WebkitAppearance: 'none' };
const textareaStyle: React.CSSProperties = { ...inputBase, resize: 'vertical', minHeight: '140px', lineHeight: 'var(--leading-loose)' };

const submitStyle = (loading: boolean): React.CSSProperties => ({
  display:        'inline-flex',
  alignItems:     'center',
  gap:            'var(--space-3)',
  fontFamily:     'var(--font-mono)',
  fontSize:       'var(--text-xs)',
  letterSpacing:  'var(--tracking-wider)',
  textTransform:  'uppercase',
  color:          'var(--ink)',
  background:     loading ? 'color-mix(in srgb, var(--gold) 60%, transparent)' : 'var(--gold)',
  border:         'none',
  borderRadius:   'var(--radius-sm)',
  padding:        'var(--space-4) var(--space-8)',
  cursor:         loading ? 'not-allowed' : 'pointer',
  alignSelf:      'flex-start',
  transition:     'background-color 0.2s',
});

const errorStyle: React.CSSProperties = {
  fontFamily:  'var(--font-mono)',
  fontSize:    'var(--text-xs)',
  color:       '#E57373',
  letterSpacing: 'var(--tracking-wide)',
};

const successStyle: React.CSSProperties = {
  padding:      'var(--space-12) 0',
  display:      'flex',
  flexDirection: 'column',
  gap:          'var(--space-4)',
};

const successHeadStyle: React.CSSProperties = {
  fontFamily:    'var(--font-display)',
  fontSize:      'var(--text-3xl)',
  fontWeight:    300,
  color:         'var(--gold-bright)',
  letterSpacing: 'var(--tracking-tight)',
};

const successSubStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize:   'var(--text-base)',
  color:      'color-mix(in srgb, var(--bone) 65%, transparent)',
  maxWidth:   '46ch',
  lineHeight: 'var(--leading-loose)',
};

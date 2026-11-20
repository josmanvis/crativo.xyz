'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { generateFingerprint } from '@/lib/fingerprint';
import { hud } from '@/lib/hud';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/** The contact form, framed as a transmission: compose → TX → ACK. */
export default function TransmitForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    generateFingerprint().then(setFingerprint);
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim() || status === 'sending') return;
    setStatus('sending');
    setError('');
    hud.flash('TX … transmitting', 10000);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Anonymous',
          email: email.trim(),
          message: message.trim(),
          fingerprint,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.blocked) throw new Error('Unable to send message.');
      if (!res.ok) throw new Error(data.error || 'Failed to send.');
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
      hud.flash('TX … sent · ACK received · reply within a day');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to send.');
      hud.flash('TX … failed · try again or email directly');
    }
  };

  if (status === 'sent') {
    return (
      <div className="border border-ink p-6 md:p-10" role="status">
        <p className="t-label text-signal-ink flex items-center gap-2 mb-4">
          <span className="led" data-on="true" /> ACK — transmission received
        </p>
        <p className="t-h2 max-w-[18ch]">Got it. I&apos;ll get back to you soon.</p>
        <p className="text-graphite mt-4">Check your spam folder too — email is chaos.</p>
        <button type="button" onClick={() => setStatus('idle')} className="btn mt-8">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" aria-describedby="tx-help">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
        <label className="block">
          <span className="t-label text-graphite">01 — Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Optional"
            className="field text-xl"
          />
        </label>
        <label className="block">
          <span className="t-label text-graphite">02 — Email *</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className="field text-xl"
          />
        </label>
      </div>
      <label className="block">
        <span className="t-label text-graphite">03 — Message *</span>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Projects, weird tech problems, or tabs vs. spaces (it's spaces)."
          className="field text-xl resize-y"
          data-lenis-prevent
        />
      </label>
      {status === 'error' && <p className="text-signal-ink">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p id="tx-help" className="t-label text-graphite">
          Lands as an SMS + email · reply ≈ 24h
        </p>
        <button type="submit" className="btn" data-variant="solid" disabled={status === 'sending'}>
          {status === 'sending' ? 'Transmitting…' : 'Transmit'}
          <ArrowRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </form>
  );
}

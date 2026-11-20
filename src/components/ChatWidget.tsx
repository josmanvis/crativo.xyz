'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, ArrowRight } from 'lucide-react';
import { generateFingerprint } from '@/lib/fingerprint';
import { ensureGsap, gsap, EASE } from '@/lib/gsap';
import { hud, prefersReducedMotion } from '@/lib/hud';

/** Floating quick-message panel. Sits above the HUD; hidden on /contact. */
export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateFingerprint().then(setFingerprint);
  }, []);

  useEffect(() => {
    const node = panel.current;
    if (!node) return;
    ensureGsap();
    const to = isOpen ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)';
    if (prefersReducedMotion()) gsap.set(node, { clipPath: to });
    else gsap.to(node, { clipPath: to, duration: isOpen ? 0.4 : 0.25, ease: EASE.transition });
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !email.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    hud.flash('TX … sending message');

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
      const data = await res.json();
      if (data.blocked) {
        setError('Unable to send message.');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Failed to send');

      setIsSent(true);
      setName('');
      setEmail('');
      setMessage('');
      hud.flash('TX … sent · reply within a day');
    } catch {
      setError('Failed to send. Please try again.');
      hud.flash('TX … failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (pathname.startsWith('/contact') || pathname.startsWith('/admin')) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen((v) => !v);
          if (isSent) {
            setIsSent(false);
            setError(null);
          }
        }}
        aria-expanded={isOpen}
        aria-controls="quick-message"
        data-hud={isOpen ? 'Close message panel' : 'Quick message · lands on Jose’s phone'}
        className="fixed right-[var(--gutter)] bottom-[calc(var(--hud-h)+16px)] z-[55] t-label hidden md:flex items-center gap-2 h-11 px-4 bg-ink text-paper border border-paper/40 hover:bg-signal hover:text-[#111110] active:scale-[0.97] transition-[background-color,color,transform] duration-150 ease-[var(--ease-primary)]"
      >
        {isOpen ? <X size={16} strokeWidth={1.5} /> : <MessageSquare size={16} strokeWidth={1.5} />}
        {isOpen ? 'Close' : 'Message'}
      </button>

      <div
        id="quick-message"
        ref={panel}
        role="dialog"
        aria-label="Send a quick message"
        aria-hidden={!isOpen}
        inert={!isOpen}
        style={{ clipPath: 'inset(100% 0% 0% 0%)' }}
        className="fixed right-[var(--gutter)] bottom-[calc(var(--hud-h)+72px)] z-[55] w-[calc(100vw-2*var(--gutter))] max-w-[380px] bg-paper border border-ink"
      >
        <div className="flex items-center justify-between px-4 h-10 border-b border-rule-strong t-label">
          <span className="flex items-center gap-2">
            <span className="led" data-on="true" />
            Direct line
          </span>
          <span className="text-graphite">Reply ≈ 24h</span>
        </div>

        {isSent ? (
          <div className="p-5">
            <p className="t-label text-signal-ink mb-2">Transmission received</p>
            <p className="text-graphite">Thanks. I&apos;ll get back to you soon — check spam, email is chaos.</p>
            <button type="button" onClick={() => setIsSent(false)} className="btn mt-5">
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <label className="block">
              <span className="t-label text-graphite">Name (optional)</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field"
                autoComplete="name"
              />
            </label>
            <label className="block">
              <span className="t-label text-graphite">Email *</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="t-label text-graphite">Message *</span>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="field resize-none"
                data-lenis-prevent
              />
            </label>
            {error && <p className="text-sm text-signal-ink">{error}</p>}
            <button type="submit" disabled={isLoading} className="btn w-full justify-between" data-variant="solid">
              {isLoading ? 'Transmitting…' : 'Transmit'}
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </form>
        )}
      </div>
    </>
  );
}

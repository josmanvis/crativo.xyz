'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { hud } from '@/lib/hud';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setStatus('loading');
    
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        hud.flash('Subscribed · next issue on its way');
        setMessage('You\'re in! Check your inbox for a confirmation.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Try again.');
    }
  };

  return (
    <section
      className="border border-ink grid grid-cols-1 lg:grid-cols-12"
      data-hud-section="Newsletter"
      aria-labelledby="newsletter-title"
    >
      <div className="lg:col-span-5 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-ink">
        <p className="t-label text-graphite mb-4 flex items-center gap-2">
          <span className="led" data-on="true" /> Dispatch
        </p>
        <h3 id="newsletter-title" className="t-h2 max-w-[12ch]">
          New entries, in your inbox.
        </h3>
      </div>
      <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-end">
        <p className="text-graphite mb-6 max-w-[48ch]">
          One email when something new ships. No spam, unsubscribe in one click.
        </p>
        {status === 'success' ? (
          <p className="t-label text-signal-ink flex items-center gap-2" role="status">
            <span className="led" data-on="true" /> {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <label className="flex-1">
              <span className="t-label text-graphite">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="field"
              />
            </label>
            <button type="submit" disabled={status === 'loading'} className="btn" data-variant="solid">
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </form>
        )}
        {status === 'error' && <p className="mt-3 text-signal-ink text-sm">{message}</p>}
      </div>
    </section>
  );
}

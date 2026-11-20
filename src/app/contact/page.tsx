import type { Metadata } from 'next';
import { ArrowUpRight, Calendar, Mail } from 'lucide-react';
import { contactInfo } from '@/data/contact';
import TransmitForm from '@/components/contact/TransmitForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Jose. Send a message, book a call, or just say hi.',
  alternates: { canonical: 'https://crativo.xyz/contact' },
};

export default function ContactPage() {
  const channels = [
    {
      label: 'Email',
      value: contactInfo.email,
      href: `mailto:${contactInfo.email}`,
      icon: <Mail size={16} strokeWidth={1.5} />,
    },
    {
      label: 'Calendar',
      value: 'Book 30 minutes',
      href: contactInfo.calendarUrl,
      icon: <Calendar size={16} strokeWidth={1.5} />,
    },
    ...contactInfo.socialLinks.map((s) => ({
      label: s.platform,
      value: s.url.replace(/^https?:\/\/(www\.)?/, ''),
      href: s.url,
      icon: <ArrowUpRight size={16} strokeWidth={1.5} />,
    })),
  ];

  return (
    <main className="shell pt-10 md:pt-16">
      <div className="relative flex items-center justify-between gap-4 pb-3 t-label text-graphite">
        <span>§ 04 — Transmit</span>
        <span className="flex items-center gap-2">
          <span className="led" data-on="true" /> Channel open
        </span>
        <span aria-hidden="true" data-reveal="rule" className="absolute inset-x-0 bottom-0 h-px bg-ink" />
      </div>

      <h1
        data-reveal="mask"
        data-reveal-load
        data-hud-section="§ 04 — Transmit"
        className="t-display mt-8 md:mt-12 max-w-[10ch]"
      >
        Send a signal.
      </h1>
      <p data-reveal="up" data-reveal-load data-delay="0.1" className="t-lede text-graphite mt-8 max-w-[44ch]">
        Usually replies within a day — unless he&apos;s debugging Safari. Then who knows.
      </p>

      <div className="mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-16">
        <section className="lg:col-span-7" aria-label="Message form" data-reveal="up" data-reveal-load data-delay="0.2">
          <TransmitForm />
        </section>

        <aside className="lg:col-span-4 lg:col-start-9" aria-label="Direct channels">
          <p className="t-label text-graphite pb-3 border-b border-ink">Direct channels</p>
          <ul>
            {channels.map((c) => {
              const external = c.href.startsWith('http');
              return (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    data-hud={`${c.label} · ${c.value}`}
                    className="group grid grid-cols-[6rem_minmax(0,1fr)_auto] items-center gap-4 py-4 border-b border-rule-strong hover:bg-paper-2 transition-colors duration-150"
                  >
                    <span className="t-label text-graphite pl-1">{c.label}</span>
                    <span className="truncate">{c.value}</span>
                    <span className="arrow-nudge pr-1">{c.icon}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </main>
  );
}

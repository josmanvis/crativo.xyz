'use client';

import { useEffect } from 'react';

interface DisqusPage {
  identifier: string;
  title: string;
  url: string;
}

interface DisqusInstance {
  reset: (options: { reload: boolean; config: (this: { page: DisqusPage }) => void }) => void;
}

declare global {
  interface Window {
    DISQUS?: DisqusInstance;
    disqus_config?: (this: { page: DisqusPage }) => void;
  }
}

interface DisqusCommentsProps {
  identifier: string;
  title: string;
  url?: string;
}

export default function DisqusComments({ identifier, title, url }: DisqusCommentsProps) {
  useEffect(() => {
    // Reset Disqus if it's already loaded
    if (typeof window !== 'undefined' && window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: function() {
          this.page.identifier = identifier;
          this.page.title = title;
          this.page.url = url || window.location.href;
        }
      });
      return;
    }

    // Configure Disqus
    window.disqus_config = function() {
      this.page.url = url || window.location.href;
      this.page.identifier = identifier;
      this.page.title = title;
    };

    // Load Disqus script
    const script = document.createElement('script');
    script.src = 'https://crativo.disqus.com/embed.js';
    script.setAttribute('data-timestamp', String(+new Date()));
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      const disqusThread = document.getElementById('disqus_thread');
      if (disqusThread) {
        disqusThread.innerHTML = '';
      }
    };
  }, [identifier, title, url]);

  return (
    <section data-hud-section="Discussion">
      <div className="relative flex items-center justify-between gap-4 pb-3 mb-8 t-label text-graphite">
        <span>Discussion</span>
        <span>Be nice, or be funny. Preferably both.</span>
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-ink" />
      </div>
      <div id="disqus_thread" className="disqus-comments" />
      <noscript>
        <p className="text-graphite">
          Please enable JavaScript to view the comments. Or don&apos;t. I&apos;m not your mom.
        </p>
      </noscript>
    </section>
  );
}

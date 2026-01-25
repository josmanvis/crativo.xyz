'use client';

import { useEffect } from 'react';

interface DisqusCommentsProps {
  identifier: string;
  title: string;
  url?: string;
}

export default function DisqusComments({ identifier, title, url }: DisqusCommentsProps) {
  useEffect(() => {
    // Reset Disqus if it's already loaded
    if (typeof window !== 'undefined' && (window as any).DISQUS) {
      (window as any).DISQUS.reset({
        reload: true,
        config: function() {
          (this as any).page.identifier = identifier;
          (this as any).page.title = title;
          (this as any).page.url = url || window.location.href;
        }
      });
      return;
    }

    // Configure Disqus
    (window as any).disqus_config = function() {
      (this as any).page.url = url || window.location.href;
      (this as any).page.identifier = identifier;
      (this as any).page.title = title;
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
    <section className="py-12 border-t border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-semibold text-white">Discussion</h2>
        <span className="text-sm text-zinc-500">💬 Be nice, or be funny. Preferably both.</span>
      </div>
      <div id="disqus_thread" className="disqus-comments" />
      <noscript>
        <p className="text-zinc-500">
          Please enable JavaScript to view the comments. Or don't. I'm not your mom.
        </p>
      </noscript>
      
      <style jsx global>{`
        #disqus_thread {
          color-scheme: dark;
        }
        #disqus_thread a {
          color: #22c55e !important;
        }
      `}</style>
    </section>
  );
}

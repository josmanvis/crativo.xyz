'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-[#0a0a0a] py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <p className="text-neutral-500 text-sm">
            Built by{' '}
            <a
              href="https://github.com/josmanvis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-400 transition-colors font-medium"
            >
              jose
            </a>
          </p>
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} crativo.xyz
          </p>
        </div>
      </div>
    </footer>
  );
}

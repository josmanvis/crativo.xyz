'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Projects', matchPaths: ['/', '/projects'] },
  { href: '/blog', label: 'Blog', matchPaths: ['/blog'] },
  { href: '/videos', label: 'Videos', matchPaths: ['/videos'] },
  { href: '/about', label: 'About', matchPaths: ['/about'] },
  { href: '/contact', label: 'Contact', matchPaths: ['/contact'] },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (item: typeof navItems[0]) => {
    // Exact match for home
    if (item.href === '/' && pathname === '/') return true;
    // Check if pathname starts with any match path (for nested routes like /projects/qortr)
    return item.matchPaths.some(path => 
      path !== '/' && pathname.startsWith(path)
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="group flex items-baseline hover:opacity-80 transition-opacity flex-shrink-0">
            <span className="text-xl md:text-2xl font-bold italic text-white" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              crativo
            </span>
            <span className="text-xl md:text-2xl font-bold italic text-yellow-400" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              .xyz
            </span>
          </Link>

          {/* Navigation Links - Horizontal scroll on mobile */}
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide -mr-4 pr-4 md:mr-0 md:pr-0">
            <ul className="flex items-center gap-4 md:gap-8">
              {navItems.map((item) => {
                const active = isActive(item);
                return (
                  <li key={item.href} className="flex-shrink-0">
                    <Link
                      href={item.href}
                      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                      className={`
                        relative text-sm md:text-base whitespace-nowrap px-2 py-1
                        transition-all duration-150 
                        active:scale-95 active:opacity-70
                        ${active 
                          ? 'text-yellow-400 font-medium' 
                          : 'text-neutral-400 hover:text-white'
                        }
                      `}
                    >
                      {item.label}
                      {active && (
                        <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-yellow-400 rounded-full" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="text-lg md:text-xl font-bold hover:text-neutral-300 transition-colors flex-shrink-0">
            crativo
          </Link>

          {/* Navigation Links - Horizontal scroll on mobile */}
          <div className="overflow-x-auto scrollbar-hide -mr-4 pr-4 md:mr-0 md:pr-0">
            <ul className="flex items-center gap-4 md:gap-8">
              <li className="flex-shrink-0">
                <Link
                  href="/"
                  className="text-sm md:text-base text-neutral-400 hover:text-white transition-colors whitespace-nowrap px-2 py-1"
                >
                  Projects
                </Link>
              </li>
              <li className="flex-shrink-0">
                <Link
                  href="/blog"
                  className="text-sm md:text-base text-neutral-400 hover:text-white transition-colors whitespace-nowrap px-2 py-1"
                >
                  Blog
                </Link>
              </li>
              <li className="flex-shrink-0">
                <Link
                  href="/videos"
                  className="text-sm md:text-base text-neutral-400 hover:text-white transition-colors whitespace-nowrap px-2 py-1"
                >
                  Videos
                </Link>
              </li>
              <li className="flex-shrink-0">
                <Link
                  href="/about"
                  className="text-sm md:text-base text-neutral-400 hover:text-white transition-colors whitespace-nowrap px-2 py-1"
                >
                  About
                </Link>
              </li>
              <li className="flex-shrink-0">
                <Link
                  href="/contact"
                  className="text-sm md:text-base text-neutral-400 hover:text-white transition-colors whitespace-nowrap px-2 py-1"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

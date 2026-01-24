import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold hover:text-neutral-300 transition-colors">
            crativo
          </Link>

          {/* Navigation Links */}
          <ul className="flex items-center gap-8">
            <li>
              <Link
                href="/"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Projects
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

interface CalendarLinkProps {
  url: string;
}

export default function CalendarLink({ url }: CalendarLinkProps) {
  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold mb-6">Schedule a Call</h2>
      <p className="text-neutral-400 mb-4">
        Prefer to talk? Book a time on my calendar for a quick chat.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white hover:bg-neutral-700 hover:border-neutral-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Book a Time</span>
      </a>
    </div>
  );
}

import { Metadata } from 'next';
import { contactInfo } from '@/data/contact';
import ContactChat from '@/components/contact/ContactChat';
import { DotGrid } from '@/components/DotGrid';

export const metadata: Metadata = {
  title: 'Contact | crativo',
  description: 'Get in touch with Jose. Send a message, grab coffee, or just say hi.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white py-20 px-4 md:px-6 relative">
      <DotGrid opacity={0.12} spacing={60} dotSize={1.5} />
      
      <div className="max-w-2xl mx-auto relative z-10">
        {/* iMessage-style header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">JE</span>
          </div>
          <h1 className="text-2xl font-semibold mb-1">Jose Einstein Pants</h1>
          <p className="text-zinc-500 text-sm">Usually responds within a day</p>
          <p className="text-zinc-600 text-xs mt-1">Unless he's debugging Safari. Then who knows.</p>
        </div>

        {/* Chat interface */}
        <ContactChat contactInfo={contactInfo} />
      </div>
    </main>
  );
}

import { contactInfo } from '@/data/contact';
import ContactInfo from '@/components/contact/ContactInfo';
import ContactForm from '@/components/contact/ContactForm';
import CalendarLink from '@/components/contact/CalendarLink';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-3">Contact</h1>
          <p className="text-xl text-neutral-400">
            Let's work together on something great
          </p>
        </div>

        <ContactInfo info={contactInfo} />
        <ContactForm />
        <CalendarLink url={contactInfo.calendarUrl} />
      </div>
    </main>
  );
}

'use client';

import { useState, FormEvent } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
            placeholder="Your name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
            placeholder="your.email@example.com"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-neutral-300 mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
            placeholder="What's this about?"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-300 mb-2">
            Message
          </label>
          <textarea
            id="message"
            required
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors resize-none"
            placeholder="Your message..."
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-300">
            Message sent successfully! I'll get back to you soon.
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}

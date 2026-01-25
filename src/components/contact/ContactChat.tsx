'use client';

import { useState, FormEvent, useEffect } from 'react';
import { ContactInfo } from '@/types/contact';

interface ContactChatProps {
  contactInfo: ContactInfo;
}

type MessageType = {
  id: number;
  text: string;
  sender: 'jose' | 'user';
  time: string;
};

const initialMessages: MessageType[] = [
  {
    id: 1,
    text: "Hey! 👋 Thanks for stopping by.",
    sender: 'jose',
    time: 'now',
  },
  {
    id: 2,
    text: "I'm always down to chat about projects, weird tech problems, or whether tabs or spaces is the hill worth dying on.",
    sender: 'jose',
    time: 'now',
  },
  {
    id: 3,
    text: "(It's spaces. But I'll tolerate your tab-based lifestyle.)",
    sender: 'jose',
    time: 'now',
  },
];

export default function ContactChat({ contactInfo }: ContactChatProps) {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [email, setEmail] = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pendingMessage, setPendingMessage] = useState('');

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    const userMessage: MessageType = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      time: getCurrentTime(),
    };

    setMessages(prev => [...prev, userMessage]);
    setPendingMessage(inputValue);
    setInputValue('');
    setShowEmailPrompt(true);
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setStatus('loading');

    // Add typing indicator
    const typingId = messages.length + 2;
    setMessages(prev => [...prev, {
      id: typingId,
      text: '...',
      sender: 'jose',
      time: getCurrentTime(),
    }]);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Contact Form User',
          email: email,
          subject: 'Message from crativo.xyz',
          message: pendingMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send');

      // Replace typing with success message
      setMessages(prev => prev.filter(m => m.id !== typingId));
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: "Got it! 🎉 I'll hit you back soon. Check your inbox (or spam folder, because email is chaos).",
          sender: 'jose',
          time: getCurrentTime(),
        }]);
      }, 500);

      setStatus('success');
      setShowEmailPrompt(false);
      setEmail('');
      setPendingMessage('');

    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== typingId));
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Oof, something broke. Try emailing me directly? 😅",
        sender: 'jose',
        time: getCurrentTime(),
      }]);
      setStatus('error');
    }
  };

  return (
    <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden">
      {/* Chat messages */}
      <div className="p-4 md:p-6 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-zinc-800 text-zinc-100 rounded-bl-md'
              }`}
            >
              <p className="text-sm md:text-base">{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Email prompt overlay */}
      {showEmailPrompt && (
        <div className="px-4 md:px-6 py-4 bg-zinc-800/80 border-t border-zinc-700">
          <p className="text-sm text-zinc-400 mb-3">
            Sweet! Drop your email so I can reply 📬
          </p>
          <form onSubmit={handleEmailSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-sm"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-5 py-2.5 bg-emerald-500 text-white rounded-full font-medium text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}

      {/* Input area */}
      {!showEmailPrompt && (
        <form onSubmit={handleSend} className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="iMessage... jk, but type here"
              className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 text-sm"
            />
            <button
              type="submit"
              className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      )}

      {/* Social links */}
      <div className="px-4 md:px-6 py-4 border-t border-zinc-800 bg-zinc-900/30">
        <p className="text-xs text-zinc-500 text-center mb-3">Or find me elsewhere on the internet</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {contactInfo.socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-sm"
            >
              {link.platform}
            </a>
          ))}
          <a
            href={`mailto:${contactInfo.email}`}
            className="px-4 py-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-sm"
          >
            Email
          </a>
        </div>
      </div>
    </div>
  );
}

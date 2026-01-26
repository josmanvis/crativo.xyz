'use client';

import { useState } from 'react';

// Default placeholder ads (same as AdUnit.tsx)
const defaultAds = [
  {
    id: '1',
    image: 'https://placehold.co/130x100/1a1a1a/3b82f6?text=Raycast',
    title: 'Raycast Pro',
    description: 'Your shortcut to everything. Supercharge your workflow with AI-powered tools.',
    link: '#',
    sponsor: 'Raycast',
    active: true,
  },
  {
    id: '2',
    image: 'https://placehold.co/130x100/1a1a1a/10b981?text=Linear',
    title: 'Linear',
    description: "The issue tracking tool you'll enjoy using. Built for high-performance teams.",
    link: '#',
    sponsor: 'Linear',
    active: true,
  },
  {
    id: '3',
    image: 'https://placehold.co/130x100/1a1a1a/f59e0b?text=Vercel',
    title: 'Vercel',
    description: 'Deploy your frontend instantly. The platform for frontend developers.',
    link: '#',
    sponsor: 'Vercel',
    active: true,
  },
  {
    id: '4',
    image: 'https://placehold.co/130x100/1a1a1a/8b5cf6?text=Arc',
    title: 'Arc Browser',
    description: 'The browser that organizes everything for you. Browse beautifully.',
    link: '#',
    sponsor: 'The Browser Company',
    active: true,
  },
];

interface Ad {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  sponsor: string;
  active: boolean;
}

export default function CarbonAdminPage() {
  const [ads, setAds] = useState<Ad[]>(defaultAds);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carbonSettings, setCarbonSettings] = useState({
    usePlaceholders: true,
    carbonServeId: '',
    carbonPlacementId: '',
  });

  const handleSaveAd = (ad: Ad) => {
    if (ad.id) {
      setAds(prev => prev.map(a => a.id === ad.id ? ad : a));
    } else {
      setAds(prev => [...prev, { ...ad, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
    setEditingAd(null);
  };

  const handleDeleteAd = (id: string) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      setAds(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Carbon Ads Admin</h1>
          <p className="text-zinc-400">Manage ad placements and Carbon Ads integration</p>
        </div>

        {/* Settings Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={carbonSettings.usePlaceholders}
                onChange={(e) => setCarbonSettings(prev => ({ ...prev, usePlaceholders: e.target.checked }))}
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-zinc-300">Use placeholder ads (no Carbon Ads script)</span>
            </label>

            {!carbonSettings.usePlaceholders && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-zinc-800/50 rounded-lg">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Carbon Serve ID</label>
                  <input
                    type="text"
                    value={carbonSettings.carbonServeId}
                    onChange={(e) => setCarbonSettings(prev => ({ ...prev, carbonServeId: e.target.value }))}
                    placeholder="CKYIK27L"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Carbon Placement ID</label>
                  <input
                    type="text"
                    value={carbonSettings.carbonPlacementId}
                    onChange={(e) => setCarbonSettings(prev => ({ ...prev, carbonPlacementId: e.target.value }))}
                    placeholder="crativoxyz"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="col-span-2 text-xs text-zinc-500">
                  Get your Carbon Ads credentials at{' '}
                  <a href="https://www.carbonads.net/" target="_blank" rel="noopener" className="text-emerald-400 hover:underline">
                    carbonads.net
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Placeholder Ads Management */}
        {carbonSettings.usePlaceholders && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Placeholder Ads</h2>
              <button
                onClick={() => {
                  setEditingAd({ id: '', image: '', title: '', description: '', link: '', sponsor: '', active: true });
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
              >
                + Add Ad
              </button>
            </div>

            <div className="grid gap-4">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                    ad.active 
                      ? 'border-zinc-700 bg-zinc-800/50' 
                      : 'border-zinc-800 bg-zinc-900/50 opacity-50'
                  }`}
                >
                  {/* Ad Preview */}
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-[100px] h-[75px] rounded-lg object-cover bg-zinc-800 flex-shrink-0"
                  />

                  {/* Ad Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{ad.title}</h3>
                    <p className="text-zinc-400 text-sm truncate">{ad.description}</p>
                    <p className="text-zinc-500 text-xs mt-1">Sponsor: {ad.sponsor}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(ad.id)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        ad.active
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {ad.active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingAd(ad);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-zinc-400 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {ads.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                No ads configured. Click "Add Ad" to create one.
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && editingAd && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg">
              <h3 className="text-xl font-semibold text-white mb-4">
                {editingAd.id ? 'Edit Ad' : 'Add New Ad'}
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveAd(editingAd);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingAd.title}
                    onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Description</label>
                  <textarea
                    value={editingAd.description}
                    onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                    required
                    rows={2}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={editingAd.image}
                    onChange={(e) => setEditingAd({ ...editingAd, image: e.target.value })}
                    required
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Link URL</label>
                  <input
                    type="url"
                    value={editingAd.link}
                    onChange={(e) => setEditingAd({ ...editingAd, link: e.target.value })}
                    required
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Sponsor Name</label>
                  <input
                    type="text"
                    value={editingAd.sponsor}
                    onChange={(e) => setEditingAd({ ...editingAd, sponsor: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingAd(null);
                    }}
                    className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-zinc-600 text-sm">
          <p>
            Carbon Ads is a developer-focused ad network.{' '}
            <a href="https://www.carbonads.net/" target="_blank" rel="noopener" className="text-emerald-500 hover:underline">
              Learn more →
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

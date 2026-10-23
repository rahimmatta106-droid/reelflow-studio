import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  Settings2, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Sliders, 
  X,
  ExternalLink
} from 'lucide-react';
import type { FacebookPage } from '../types';

interface PageManagerViewProps {
  pages: FacebookPage[];
  onUpdatePage: (updatedPage: Partial<FacebookPage> & { id: string }) => void;
  onBulkToggle: (pageIds: string[], enable: boolean) => void;
}

export const PageManagerView: React.FC<PageManagerViewProps> = ({
  pages,
  onUpdatePage,
  onBulkToggle,
}) => {
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled' | 'expiring'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingPage, setEditingPage] = useState<FacebookPage | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  const niches = [
    'all',
    'Tech & AI',
    'Fitness & Wellness',
    'Travel & Adventure',
    'Cuisine & Cooking',
    'Finance & Crypto',
    'Comedy & Humor',
    'Real Estate & Luxury',
    'Automotive',
    'Gaming',
    'Life Hacks',
  ];

  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      if (selectedNiche !== 'all' && page.niche !== selectedNiche) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = page.name.toLowerCase().includes(q);
        const matchesId = page.pageId.includes(q);
        if (!matchesName && !matchesId) return false;
      }
      if (statusFilter === 'enabled' && !page.isEnabled) return false;
      if (statusFilter === 'disabled' && page.isEnabled) return false;
      if (statusFilter === 'expiring' && page.tokenStatus !== 'expiring_soon') return false;
      return true;
    });
  }, [pages, selectedNiche, searchQuery, statusFilter]);

  const totalPagesCount = Math.ceil(filteredPages.length / pageSize) || 1;
  const paginatedPages = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPages.slice(start, start + pageSize);
  }, [filteredPages, currentPage, pageSize]);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedPages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedPages.map(p => p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkEnable = (enable: boolean) => {
    if (selectedIds.size === 0) return;
    onBulkToggle(Array.from(selectedIds), enable);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">100 Facebook Pages Manager</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Independent publishing queues, per-page prompt customizer, daily post limits, and OAuth token health.
          </p>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-300 font-medium font-mono">{selectedIds.size} selected</span>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => handleBulkEnable(true)}
              className="text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
            >
              Enable All
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => handleBulkEnable(false)}
              className="text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
            >
              Disable All
            </button>
          </div>
        )}
      </div>

      {/* Filters Strip */}
      <div className="space-y-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        {/* Niche Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {niches.map(niche => (
            <button
              key={niche}
              onClick={() => { setSelectedNiche(niche); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors font-medium cursor-pointer ${
                selectedNiche === niche
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {niche === 'all' ? 'All Niches (100)' : niche}
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by page name or Meta ID..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
            <span className="text-slate-500">Status:</span>
            <button
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded cursor-pointer ${statusFilter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => { setStatusFilter('enabled'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded cursor-pointer ${statusFilter === 'enabled' ? 'bg-emerald-950 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Active
            </button>
            <button
              onClick={() => { setStatusFilter('disabled'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded cursor-pointer ${statusFilter === 'disabled' ? 'bg-rose-950 text-rose-300 font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Disabled
            </button>
            <button
              onClick={() => { setStatusFilter('expiring'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded cursor-pointer ${statusFilter === 'expiring' ? 'bg-amber-950 text-amber-300 font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Expiring Tokens
            </button>
          </div>
        </div>
      </div>

      {/* Pages Table / Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-mono">
              <tr>
                <th className="p-3 w-10">
                  <button onClick={toggleSelectAll} className="cursor-pointer text-slate-400 hover:text-white">
                    {selectedIds.size === paginatedPages.length && paginatedPages.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3">Page & Category</th>
                <th className="p-3">Niche</th>
                <th className="p-3">Meta Page ID</th>
                <th className="p-3 text-right">Audience</th>
                <th className="p-3">Token Health</th>
                <th className="p-3">Cadence & Limit</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedPages.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No Facebook Pages match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedPages.map(page => (
                  <tr 
                    key={page.id} 
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3">
                      <button 
                        onClick={() => toggleSelectOne(page.id)}
                        className="cursor-pointer text-slate-400 hover:text-white"
                      >
                        {selectedIds.has(page.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-white">{page.name}</div>
                      <div className="text-[11px] text-slate-500">{page.category}</div>
                    </td>

                    <td className="p-3">
                      <span className="text-slate-300 font-medium">{page.niche}</span>
                    </td>

                    <td className="p-3 font-mono text-slate-400 text-[11px]">
                      {page.pageId}
                    </td>

                    <td className="p-3 text-right font-mono text-slate-300">
                      {(page.followers / 1000).toFixed(0)}k followers
                    </td>

                    <td className="p-3">
                      {page.tokenStatus === 'active' ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Expiring soon</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-slate-400">
                      <div>Every {page.postingFrequencyHours}h ({page.dailyLimit}/day)</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {page.postsPublishedToday} published today · {page.timezone.split('/')[1]}
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => onUpdatePage({ id: page.id, isEnabled: !page.isEnabled })}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                          page.isEnabled
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {page.isEnabled ? 'ENABLED' : 'PAUSED'}
                      </button>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => setEditingPage(page)}
                        className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                      >
                        Edit Rules
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredPages.length)} of {filteredPages.length} Pages
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white rounded cursor-pointer"
            >
              Previous
            </button>
            <span className="font-mono text-slate-300">Page {currentPage} of {totalPagesCount}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPagesCount, p + 1))}
              disabled={currentPage === totalPagesCount}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white rounded cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Page Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Edit Page Settings</h3>
                <p className="text-xs text-slate-400">{editingPage.name} (ID: {editingPage.pageId})</p>
              </div>
              <button 
                onClick={() => setEditingPage(null)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Page State</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="isEnabled"
                      checked={editingPage.isEnabled}
                      onChange={() => setEditingPage({ ...editingPage, isEnabled: true })}
                      className="text-blue-600"
                    />
                    <span>Active & Publishing</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="isEnabled"
                      checked={!editingPage.isEnabled}
                      onChange={() => setEditingPage({ ...editingPage, isEnabled: false })}
                      className="text-blue-600"
                    />
                    <span>Paused</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Daily Reels Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingPage.dailyLimit}
                    onChange={e => setEditingPage({ ...editingPage, dailyLimit: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cadence (Hours between Reels)</label>
                  <select
                    value={editingPage.postingFrequencyHours}
                    onChange={e => setEditingPage({ ...editingPage, postingFrequencyHours: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value={4}>Every 4 hours</option>
                    <option value={6}>Every 6 hours</option>
                    <option value={8}>Every 8 hours</option>
                    <option value={12}>Every 12 hours</option>
                    <option value={24}>Once daily</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Timezone</label>
                <select
                  value={editingPage.timezone}
                  onChange={e => setEditingPage({ ...editingPage, timezone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Chicago">America/Chicago (CST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Page-Specific Custom Prompt Rules</label>
                <textarea
                  rows={3}
                  value={editingPage.customPromptRules}
                  onChange={e => setEditingPage({ ...editingPage, customPromptRules: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-500"
                  placeholder="e.g. Always begin with a high-energy 2s movement hook, use vibrant contrast..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Default 5 Hashtags (comma separated)</label>
                <input
                  type="text"
                  value={editingPage.defaultHashtags.join(', ')}
                  onChange={e => setEditingPage({ ...editingPage, defaultHashtags: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingPage(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdatePage(editingPage);
                  setEditingPage(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

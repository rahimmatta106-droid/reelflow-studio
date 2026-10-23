import React, { useState } from 'react';
import { 
  DollarSign, 
  ShieldAlert, 
  Sliders, 
  Activity, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import type { BudgetConfig, AuditLog } from '../types';

interface BudgetSettingsViewProps {
  budget: BudgetConfig;
  auditLogs: AuditLog[];
  onUpdateBudget: (budget: Partial<BudgetConfig>) => void;
  onToggleEmergencyStop: () => void;
}

export const BudgetSettingsView: React.FC<BudgetSettingsViewProps> = ({
  budget,
  auditLogs,
  onUpdateBudget,
  onToggleEmergencyStop,
}) => {
  const [dailyLimit, setDailyLimit] = useState<number>(budget.dailyLimitUsd);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(budget.monthlyLimitUsd);
  const [concurrentLimit, setConcurrentLimit] = useState<number>(budget.concurrentJobsLimit);
  const [lowCostDev, setLowCostDev] = useState<boolean>(budget.lowCostDevMode);
  const [searchLog, setSearchLog] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveBudget = () => {
    onUpdateBudget({
      dailyLimitUsd: dailyLimit,
      monthlyLimitUsd: monthlyLimit,
      concurrentJobsLimit: concurrentLimit,
      lowCostDevMode: lowCostDev,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  const filteredLogs = auditLogs.filter(log => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (searchLog) {
      const q = searchLog.toLowerCase();
      return log.action.toLowerCase().includes(q) || log.details.toLowerCase().includes(q) || log.actor.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Usage Limits, API Health & Audit Logs</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time budget governance, external API service status, and immutable security audit records.
        </p>
      </div>

      {/* Emergency Stop & Kill Switch Card */}
      <div className={`p-5 rounded-xl border transition-all ${
        budget.emergencyStopActive
          ? 'bg-rose-950/70 border-rose-700'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className={`w-6 h-6 shrink-0 mt-0.5 ${
              budget.emergencyStopActive ? 'text-rose-400 animate-pulse' : 'text-slate-400'
            }`} />
            <div>
              <h3 className="text-sm font-semibold text-white">Manual Global Emergency Stop</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Immediately suspends all AI video generation requests, task workers, and Facebook publishing across all 100 Pages.
              </p>
            </div>
          </div>

          <button
            onClick={onToggleEmergencyStop}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide cursor-pointer transition-colors shadow-sm shrink-0 ${
              budget.emergencyStopActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {budget.emergencyStopActive ? 'DISENGAGE EMERGENCY STOP' : 'ENGAGE EMERGENCY STOP'}
          </button>
        </div>
      </div>

      {/* Budget & Cost Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Caps */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Generation Budget Controls</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Enforced per 24h</span>
          </div>

          {/* Daily Limit */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Daily Generation Limit (USD)</span>
              <span className="font-mono font-bold text-white">${dailyLimit.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={dailyLimit}
              onChange={e => setDailyLimit(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Spent Today: ${budget.currentDaySpentUsd.toFixed(2)}</span>
              <span>Remaining: ${(dailyLimit - budget.currentDaySpentUsd).toFixed(2)}</span>
            </div>
          </div>

          {/* Monthly Limit */}
          <div className="space-y-1.5 text-xs pt-2">
            <div className="flex justify-between text-slate-300">
              <span>Monthly Budget Cap (USD)</span>
              <span className="font-mono font-bold text-white">${monthlyLimit.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={monthlyLimit}
              onChange={e => setMonthlyLimit(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Spent This Month: ${budget.currentMonthSpentUsd.toFixed(2)}</span>
              <span>Remaining: ${(monthlyLimit - budget.currentMonthSpentUsd).toFixed(2)}</span>
            </div>
          </div>

          {/* Concurrency Limit */}
          <div className="space-y-1.5 text-xs pt-2">
            <div className="flex justify-between text-slate-300">
              <span>Max Concurrent AI Jobs</span>
              <span className="font-mono font-bold text-white">{concurrentLimit}</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={concurrentLimit}
              onChange={e => setConcurrentLimit(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Low-Cost Dev Mode Toggle */}
          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
            <div>
              <div className="font-medium text-white">Low-Cost Development Mode</div>
              <div className="text-[11px] text-slate-500">Uses synthetic media to preserve AI credits</div>
            </div>
            <button
              onClick={() => setLowCostDev(!lowCostDev)}
              className={`px-3 py-1 rounded font-medium text-xs cursor-pointer transition-colors ${
                lowCostDev ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {lowCostDev ? 'ON' : 'OFF'}
            </button>
          </div>

          <button
            onClick={handleSaveBudget}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            {savedSuccess ? '✓ Saved!' : 'Apply Budget Settings'}
          </button>
        </div>

        {/* API Providers Diagnostic */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-sky-400" />
              <span>External API Integrations</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Status Check</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Google Gemini 3.8 Flash</div>
                <div className="text-[11px] text-slate-400">Title, Caption, and Hashtag Engine</div>
              </div>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Google Veo-2 Video Adapter</div>
                <div className="text-[11px] text-slate-400">Vertical 9:16 Reels Synthesizer</div>
              </div>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready</span>
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">WhatsApp Cloud Platform</div>
                <div className="text-[11px] text-slate-400">Webhook: /api/whatsapp/webhook</div>
              </div>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Meta Graph API (100 Pages)</div>
                <div className="text-[11px] text-slate-400">Version: v21.0 · Reels Endpoint</div>
              </div>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100 Bound</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Logs Stream */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Immutable Security & Operations Audit Logs</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks every generation, WhatsApp webhook callback, reviewer decision, and Meta publish response.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchLog}
              onChange={e => setSearchLog(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white placeholder-slate-500"
            />
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-mono">
              <tr>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Action</th>
                <th className="p-2.5">Actor / System</th>
                <th className="p-2.5">Details</th>
                <th className="p-2.5 text-center">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-2.5 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-2.5 text-white font-semibold whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="p-2.5 text-slate-300 whitespace-nowrap">
                    {log.actor}
                  </td>
                  <td className="p-2.5 text-slate-400 max-w-md truncate font-sans">
                    {log.details}
                  </td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.severity === 'critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : log.severity === 'warning'
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

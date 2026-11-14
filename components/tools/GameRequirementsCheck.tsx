'use client';

import { useState } from 'react';
import { Gamepad2, Search, Loader2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface SearchResult {
  name: string;
  url: string;
}

interface Requirements {
  name: string;
  minimum: string[];
  recommended: string[];
}

interface Props {
  cores: number;
  deviceMemoryGB: number;
}

function parseRamGb(lines: string[]): number | null {
  for (const line of lines) {
    const match = line.match(/memory[:\s]*([\d.]+)\s*(gb|mb)/i) || line.match(/ram[:\s]*([\d.]+)\s*(gb|mb)/i);
    if (match) {
      const value = parseFloat(match[1]);
      return match[2].toLowerCase() === 'mb' ? value / 1024 : value;
    }
  }
  return null;
}

export default function GameRequirementsCheck({ cores, deviceMemoryGB }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loadingReq, setLoadingReq] = useState(false);
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [error, setError] = useState('');

  const translateError = (code?: string) => {
    if (!code) return t('tools.ycpu.gameReq.error');
    const text = t(`tools.ycpu.gameReq.errors.${code}`);
    return text.startsWith('tools.ycpu.gameReq.errors.') ? t('tools.ycpu.gameReq.error') : text;
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError('');
    setResults(null);
    setRequirements(null);
    try {
      const res = await fetch(`/api/game-requirements?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(translateError(data.error));
      setResults(data.results);
      if (!data.results.length) setError(t('tools.ycpu.gameReq.noResults'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.ycpu.gameReq.error'));
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = async (url: string) => {
    setLoadingReq(true);
    setError('');
    setRequirements(null);
    try {
      const res = await fetch('/api/game-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(translateError(data.error));
      setRequirements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.ycpu.gameReq.error'));
    } finally {
      setLoadingReq(false);
    }
  };

  const minRam = requirements ? parseRamGb(requirements.minimum) : null;
  const recRam = requirements ? parseRamGb(requirements.recommended) : null;

  return (
    <div className="glass p-6">
      <h3 className="flex items-center gap-2 font-semibold text-sm mb-2">
        <Gamepad2 size={16} className="text-accent" /> {t('tools.ycpu.gameReq.title')}
      </h3>
      <p className="text-sm text-muted mb-4">{t('tools.ycpu.gameReq.description')}</p>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder={t('tools.ycpu.gameReq.placeholder')}
          className="flex-1 min-w-0 rounded-lg border border-subtle bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="btn-primary flex items-center gap-2 !py-2 text-sm whitespace-nowrap"
        >
          {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {t('tools.ycpu.gameReq.searchButton')}
        </button>
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-2 text-sm text-red-500">
          <AlertTriangle size={14} /> {error}
        </p>
      )}

      {results && results.length > 0 && !requirements && (
        <ul className="mt-4 space-y-1.5">
          {results.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => handleSelect(r.url)}
                disabled={loadingReq}
                className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-left text-sm hover:border-primary-light/40 hover:bg-surface-hover"
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {loadingReq && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" /> {t('tools.ycpu.gameReq.checking')}
        </p>
      )}

      {requirements && (
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-3">{requirements.name}</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs text-muted mb-2">{t('tools.ycpu.gameReq.minimum')}</div>
              <ul className="space-y-1 text-sm text-body">
                {requirements.minimum.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
              {minRam !== null && (
                <RamVerdict t={t} requiredGb={minRam} deviceMemoryGB={deviceMemoryGB} />
              )}
            </div>
            <div>
              <div className="text-xs text-muted mb-2">{t('tools.ycpu.gameReq.recommended')}</div>
              <ul className="space-y-1 text-sm text-body">
                {requirements.recommended.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
              {recRam !== null && (
                <RamVerdict t={t} requiredGb={recRam} deviceMemoryGB={deviceMemoryGB} />
              )}
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">
            {t('tools.ycpu.gameReq.deviceSpecs')}: {cores} CPU · {deviceMemoryGB || '?'} GB RAM.{' '}
            {t('tools.ycpu.gameReq.ramOnlyNote')}
          </p>
        </div>
      )}
    </div>
  );
}

function RamVerdict({ t, requiredGb, deviceMemoryGB }: { t: (p: string) => string; requiredGb: number; deviceMemoryGB: number }) {
  if (!deviceMemoryGB) return null;
  const meets = deviceMemoryGB >= requiredGb;
  return (
    <p className={`mt-2 flex items-center gap-1.5 text-xs ${meets ? 'text-green-500' : 'text-red-500'}`}>
      {meets ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      {meets ? t('tools.ycpu.gameReq.ramOk') : t('tools.ycpu.gameReq.ramLow')}
    </p>
  );
}

'use client';

import { useState } from 'react';
import { ShieldCheck, Search, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface SeoIssue {
  code: string;
  count?: number;
}

interface SecurityIssue {
  code: string;
  solution: string;
}

interface SeoResult {
  seoScore: number;
  seoIssues: SeoIssue[];
  possiblyIncomplete?: boolean;
}

interface SecurityResult {
  securityScore: number;
  issues: SecurityIssue[];
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function issueText(t: (path: string) => string, code: string, count?: number): string {
  const text = t(`seoChecker.issues.${code}`);
  return count !== undefined ? text.replace('{count}', String(count)) : text;
}

function translateApiError(t: (path: string) => string, code?: string): string {
  if (!code) return t('seoChecker.error');
  const text = t(`seoChecker.errors.${code}`);
  return text.startsWith('seoChecker.errors.') ? t('seoChecker.error') : text;
}

export default function SeoSecurityChecker() {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seoResult, setSeoResult] = useState<SeoResult | null>(null);
  const [securityResult, setSecurityResult] = useState<SecurityResult | null>(null);

  const handleCheck = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setSeoResult(null);
    setSecurityResult(null);

    try {
      const [seoRes, securityRes] = await Promise.all([
        fetch('/api/check-seo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        }),
        fetch('/api/check-security', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        }),
      ]);

      const [seoData, securityData] = await Promise.all([seoRes.json(), securityRes.json()]);

      if (!seoRes.ok || seoData.error) throw new Error(translateApiError(t, seoData.error));
      if (!securityRes.ok || securityData.error) throw new Error(translateApiError(t, securityData.error));

      setSeoResult(seoData);
      setSecurityResult(securityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('seoChecker.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] px-6 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <span className="section-tag">{t('seoChecker.tag')}</span>
        <h1 className="section-title mb-2">
          {t('seoChecker.title')} <span className="grad-text">{t('seoChecker.titleHighlight')}</span>
        </h1>
        <p className="text-muted mb-6">{t('seoChecker.description')}</p>

        <div className="glass p-4">
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              placeholder={t('seoChecker.placeholder')}
              className="flex-1 min-w-0 rounded-lg border border-subtle bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50"
            />
            <button
              onClick={handleCheck}
              disabled={loading || !url.trim()}
              className="btn-primary flex items-center gap-2 !py-2 text-sm whitespace-nowrap"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              {loading ? t('seoChecker.checking') : t('seoChecker.checkButton')}
            </button>
          </div>
          {error && (
            <p className="mt-3 flex items-center gap-2 text-sm text-red-500">
              <AlertTriangle size={14} /> {error}
            </p>
          )}
        </div>

        {(seoResult || securityResult) && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {seoResult && (
              <div className="glass p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Search size={15} /> {t('seoChecker.seoScore')}
                  </h3>
                  <span className={`text-xl font-bold ${scoreColor(seoResult.seoScore)}`}>
                    {seoResult.seoScore}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface-hover overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${scoreBarColor(seoResult.seoScore)}`}
                    style={{ width: `${Math.max(0, seoResult.seoScore)}%` }}
                  />
                </div>
                {seoResult.possiblyIncomplete && (
                  <p className="mb-3 flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2.5 text-xs text-yellow-600 dark:text-yellow-400">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {t('seoChecker.possiblyIncomplete')}
                  </p>
                )}
                {seoResult.seoIssues.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-green-500">
                    <CheckCircle2 size={14} /> {t('seoChecker.noIssues')}
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {seoResult.seoIssues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted">
                        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-yellow-500" />
                        {issueText(t, issue.code, issue.count)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {securityResult && (
              <div className="glass p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck size={15} /> {t('seoChecker.securityScore')}
                  </h3>
                  <span className={`text-xl font-bold ${scoreColor(securityResult.securityScore)}`}>
                    {securityResult.securityScore}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface-hover overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${scoreBarColor(securityResult.securityScore)}`}
                    style={{ width: `${Math.max(0, securityResult.securityScore)}%` }}
                  />
                </div>
                {securityResult.issues.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-green-500">
                    <CheckCircle2 size={14} /> {t('seoChecker.noIssues')}
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {securityResult.issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted">
                        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-red-500" />
                        {issueText(t, issue.code)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

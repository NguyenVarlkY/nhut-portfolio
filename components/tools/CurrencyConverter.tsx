'use client';

import { useState } from 'react';
import { ArrowLeftRight, Copy } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

const CURRENCY_RATES: Record<string, number> = {
  VND: 1,
  USD: 0.000042,
  EUR: 0.000039,
  JPY: 0.0064,
  KRW: 0.056,
  CNY: 0.00030,
  GBP: 0.000033,
  AUD: 0.000064,
  CAD: 0.000057,
  SGD: 0.000056,
};

const CURRENCY_NAMES: Record<string, string> = {
  VND: 'VND',
  USD: 'USD',
  EUR: 'EUR',
  JPY: 'JPY',
  KRW: 'KRW',
  CNY: 'CNY',
  GBP: 'GBP',
  AUD: 'AUD',
  CAD: 'CAD',
  SGD: 'SGD',
};

const OPTION_STYLE = 'dark:[&>option]:bg-[#0c0c16] [&>option]:bg-[#f8f9fc] [&>option]:text-body';

export default function CurrencyConverter() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('VND');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setResult(t('currencyConverter.placeholder'));
      return;
    }
    setIsConverting(true);
    setTimeout(() => {
      const amountNum = parseFloat(amount);
      const fromRate = CURRENCY_RATES[fromCurrency];
      const toRate = CURRENCY_RATES[toCurrency];
      const amountInVND = amountNum / fromRate;
      const convertedAmount = amountInVND * toRate;
      setResult(`${convertedAmount.toFixed(4)} ${toCurrency}`);
      setIsConverting(false);
    }, 350);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    if (amount) handleConvert();
  };

  const selectCls = `rounded-lg border border-subtle bg-transparent px-2 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-light/50 cursor-pointer ${OPTION_STYLE}`;

  return (
    <div className="glass p-4">
      <div className="space-y-3">
        {/* Input row */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder={t('currencyConverter.placeholder')}
            className="flex-1 min-w-0 rounded-lg border border-subtle bg-transparent px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-light/50"
          />
          <select aria-label="From currency" value={fromCurrency} onChange={e => setFromCurrency(e.target.value)} className={selectCls}>
            {Object.entries(CURRENCY_NAMES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        {/* Swap */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleSwap}
            disabled={isConverting}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-subtle bg-surface text-muted transition-colors hover:bg-surface-hover hover:text-body"
            title={t('currencyConverter.swap')}
          >
            <ArrowLeftRight size={15} />
          </button>
        </div>

        {/* Result row */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={result}
            readOnly
            placeholder="—"
            className="flex-1 min-w-0 rounded-lg border border-subtle bg-transparent px-3 py-2 text-sm font-medium focus:outline-none"
          />
          <select aria-label="To currency" value={toCurrency} onChange={e => setToCurrency(e.target.value)} className={selectCls}>
            {Object.entries(CURRENCY_NAMES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleConvert}
            disabled={isConverting || !amount}
            className="btn-primary flex-1 !py-2 text-sm"
          >
            {isConverting ? t('currencyConverter.converting') : t('currencyConverter.convert')}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(result)}
            disabled={!result}
            className="btn-ghost !px-3 !py-2"
            title={t('currencyConverter.copyResult')}
          >
            <Copy size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

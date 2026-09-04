'use client';

import { useState } from 'react';
import { ListTodo, Coins, Cpu, AudioLines, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import TestTodo from '@/components/tools/TestTodo';
import CurrencyConverter from '@/components/tools/CurrencyConverter';
import YCPUSimulator from '@/components/tools/YCPUSimulator';
import Yspeech from '@/components/tools/Yspeech';

type ToolId = 'todo' | 'currency' | 'ycpu' | 'yspeech';

const TOOLS: { id: ToolId; labelKey: string; icon: React.ReactNode }[] = [
  { id: 'todo', labelKey: 'tools.todo.title', icon: <ListTodo size={16} /> },
  { id: 'currency', labelKey: 'currencyConverter.title', icon: <Coins size={16} /> },
  { id: 'ycpu', labelKey: 'tools.ycpu.title', icon: <Cpu size={16} /> },
  { id: 'yspeech', labelKey: 'tools.yspeech.title', icon: <AudioLines size={16} /> },
];

export default function ToolsPage() {
  const { t } = useTranslation();
  const [tool, setTool] = useState<ToolId>('todo');

  return (
    <div className="min-h-screen">
      <div className="sticky top-[70px] z-40 border-b border-subtle bg-base/90 backdrop-blur-xl">
        <div className="container-port flex items-center gap-3 py-3">
          <span className="text-sm font-semibold text-muted hidden sm:inline">{t('tools.title')}</span>
          <div className="relative">
            <select
              value={tool}
              onChange={e => setTool(e.target.value as ToolId)}
              className="appearance-none rounded-xl border border-subtle bg-transparent px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-light/50 cursor-pointer dark:[&>option]:bg-[#0c0c16] [&>option]:bg-[#f8f9fc] [&>option]:text-body"
            >
              {TOOLS.map(tb => (
                <option key={tb.id} value={tb.id}>{t(tb.labelKey)}</option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>
          <div className="flex gap-1.5 ml-2">
            {TOOLS.map(tb => (
              <button
                key={tb.id}
                onClick={() => setTool(tb.id)}
                title={t(tb.labelKey)}
                className={tool === tb.id ? 'border-primary-light/40 bg-surface-hover text-primary-light' : 'border-subtle bg-surface text-muted hover:border-primary-light/40 hover:text-body'}
              >
                {tb.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-port">
        {tool === 'todo' && <TestTodo />}
        {tool === 'currency' && (
          <div className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-center px-6 py-16">
            <div className="w-full max-w-md">
              <span className="section-tag">{t('currencyConverter.title')}</span>
              <h1 className="section-title mb-6">
                {t('currencyConverter.title')} <span className="grad-text">{t('currencyConverter.titleHighlight')}</span>
              </h1>
              <CurrencyConverter />
            </div>
          </div>
        )}
        {tool === 'ycpu' && <YCPUSimulator />}
        {tool === 'yspeech' && <Yspeech />}
      </div>
    </div>
  );
}

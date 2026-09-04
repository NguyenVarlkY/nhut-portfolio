'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, Copy, Download, Trash2, Upload, AudioLines, FileText } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: any) => void) | null;
  start: () => void;
  stop: () => void;
}

const RECOGNITION_LANGS: Record<string, string> = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'vi-VN': 'Tiếng Việt',
  'ko-KR': '한국어',
  'zh-CN': '中文',
  'ja-JP': '日本語',
  'de-DE': 'Deutsch',
  'fr-FR': 'Français',
};

export default function Yspeech() {
  const { t } = useTranslation();
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState('en-US');
  const [supported, setSupported] = useState(true);
  const [note, setNote] = useState('');
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    recRef.current = rec;
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let interimTxt = '';
      let finalTxt = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalTxt += r[0].transcript;
        else interimTxt += r[0].transcript;
      }
      setTranscript(prev => prev + finalTxt);
      setInterim(interimTxt);
    };
    rec.onend = () => setListening(false);
    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') setListening(false);
    };
    return () => { rec.stop(); };
  }, [lang]);

  const start = useCallback(() => {
    if (!recRef.current) return;
    try {
      recRef.current.lang = lang;
      recRef.current.start();
      setListening(true);
      setInterim('');
    } catch { /* already started */ }
  }, [lang]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const toggle = () => (listening ? stop() : start());

  const clearAll = () => { setTranscript(''); setInterim(''); };

  const download = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yspeech-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File) => {
    setNote(`Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Live transcription via microphone is supported. For file transcription, paste text below or use the mic.`);
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col items-center px-6 pt-16 pb-12">
      <div className="container-port w-full max-w-3xl">
        <div className="mb-8">
          <span className="section-tag">{t('tools.yspeech.tag')}</span>
          <h1 className="section-title mb-4">
            {t('tools.yspeech.title')} <span className="grad-text">{t('tools.yspeech.titleHighlight')}</span>
          </h1>
          <p className="text-muted max-w-2xl">{t('tools.yspeech.description')}</p>
        </div>

        {!supported ? (
          <div className="glass p-8 text-center">
            <Mic size={40} className="mx-auto text-muted mb-3" />
            <p className="text-muted">{t('tools.yspeech.unsupported')}</p>
          </div>
        ) : (
          <div className="glass w-full p-6">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <button
                onClick={toggle}
                className={`btn ${listening ? 'btn-ghost !text-red-400' : 'btn-primary'} !py-2.5`}
              >
                {listening ? <Square size={18} /> : <Mic size={18} />}
                {listening ? t('tools.yspeech.stop') : t('tools.yspeech.start')}
              </button>
<select
                value={lang}
                onChange={e => setLang(e.target.value)}
                disabled={listening}
                className="rounded-xl border border-subtle bg-transparent px-3 py-2.5 text-sm text-body backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 dark:[&>option]:bg-[#0c0c16] [&>option]:bg-[#f8f9fc] [&>option]:text-body"
              >
                {Object.entries(RECOGNITION_LANGS).map(([code, label]) => (
                  <option key={code} value={code} className="bg-transparent text-body">{label}</option>
                ))}
              </select>
              <label className="btn btn-ghost !py-2.5 cursor-pointer">
                <Upload size={18} /> {t('tools.yspeech.upload')}
                <input type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </label>
              <div className="flex-1" />
              <button onClick={clearAll} className="btn btn-ghost !px-3 !py-2.5" title={t('tools.yspeech.clear')}>
                <Trash2 size={16} />
              </button>
            </div>

            {note && <p className="mb-4 text-sm text-accent">{note}</p>}

            <div className="flex items-center gap-2 mb-3">
              <span className={`h-2.5 w-2.5 rounded-full ${listening ? 'bg-red-400 animate-pulse' : 'bg-muted'}`} />
              <span className="text-sm text-muted">
                {listening ? t('tools.yspeech.listening') : t('tools.yspeech.idle')}
              </span>
            </div>

            <div className="rounded-xl border border-subtle bg-[var(--bg-base)] p-4 min-h-[240px]">
              <div className="flex items-center gap-2 mb-3 text-muted">
                <AudioLines size={16} className="text-accent" />
                <span className="text-sm font-medium">{t('tools.yspeech.transcript')}</span>
              </div>
              <textarea
                value={transcript + (interim ? ` ${interim}` : '')}
                onChange={e => setTranscript(e.target.value)}
                placeholder={t('tools.yspeech.placeholder')}
                className="w-full min-h-[180px] bg-transparent text-body placeholder-placeholder text-sm leading-relaxed focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(transcript)} disabled={!transcript} className="btn btn-ghost !py-2">
                  <Copy size={16} /> {t('tools.yspeech.copy')}
                </button>
                <button onClick={download} disabled={!transcript} className="btn btn-ghost !py-2">
                  <Download size={16} /> {t('tools.yspeech.download')}
                </button>
              </div>
              <div className="text-sm text-muted flex items-center gap-1">
                <FileText size={14} /> {transcript.split(/\s+/).filter(Boolean).length} {t('tools.yspeech.words')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

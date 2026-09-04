'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Monitor, Cpu, MemoryStick, Battery, Wifi, Languages, RefreshCw, HardDrive,
  Globe, Fingerprint, Clock, Shield, MapPin, AudioLines, Tv, Database, Network,
  Gauge, Plug, Info, Lock, Building2, MemoryStick as RamIcon, Disc3, Bug
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface SystemInfo {
  userAgent: string;
  platform: string;
  lang: string;
  languages: string[];
  cores: number;
  deviceMemory: number;
  colorDepth: number;
  pixelRatio: number;
  width: number;
  height: number;
  maxTouchPoints: number;
  online: boolean;
  timezone: string;
  country: string;
  browser: string;
  vendor: string;
  engine: string;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  storageQuota: number;
  storageUsage: number;
  audioInputs: string[];
  audioOutputs: string[];
  videoInputs: string[];
  battery: { level: number; charging: boolean; chargingTime: number; dischargingTime: number } | null;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getCPUInfo(ua: string): string {
  const model = ua.match(/\(([^)]+)\)/)?.[1] || 'Unknown';
  return model;
}

function getBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return 'Microsoft Edge';
  if (/Chrome\//.test(ua)) return 'Google Chrome';
  if (/Firefox\//.test(ua)) return 'Mozilla Firefox';
  if (/Safari\//.test(ua)) return 'Safari';
  if (/Opera|OPR\//.test(ua)) return 'Opera';
  return 'Unknown';
}

function getOS(ua: string): string {
  if (/Windows NT 10/.test(ua)) return 'Windows 10/11';
  if (/Windows NT 6.3/.test(ua)) return 'Windows 8.1';
  if (/Windows NT 6.1/.test(ua)) return 'Windows 7';
  if (/Mac OS X/.test(ua)) return 'macOS';
  if (/Android/.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown';
}

function getCountryFromTimezone(tz: string): string {
  if (!tz) return 'Unknown';
  const parts = tz.split('/');
  if (parts.length < 2) return tz;
  const region = parts[0];
  const city = parts[1]?.replace(/_/g, ' ');
  return `${region} — ${city}`;
}

export default function SystemInfoViewer() {
  const { t } = useTranslation();
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [mounted, setMounted] = useState(false);

  const collect = useCallback(async () => {
    const nav = navigator as any;
    const w = window as any;
    const conn = (nav.connection || nav.mozConnection || nav.webkitConnection) as any;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';

    let storageQuota = 0;
    let storageUsage = 0;
    try {
      if (nav.storage && nav.storage.estimate) {
        const est = await nav.storage.estimate();
        storageQuota = est.quota || 0;
        storageUsage = est.usage || 0;
      }
    } catch { /* ignore */ }

    let audioInputs: string[] = [];
    let audioOutputs: string[] = [];
    let videoInputs: string[] = [];
    try {
      if (nav.mediaDevices && nav.mediaDevices.enumerateDevices) {
const devices = await nav.mediaDevices.enumerateDevices();
        audioInputs = devices.filter((d: { kind: string }) => d.kind === 'audioinput').map((d: { label: string }) => d.label || 'Microphone');
        audioOutputs = devices.filter((d: { kind: string }) => d.kind === 'audiooutput').map((d: { label: string }) => d.label || 'Speaker');
        videoInputs = devices.filter((d: { kind: string }) => d.kind === 'videoinput').map((d: { label: string }) => d.label || 'Camera');
      }
    } catch { /* ignore */ }

    let battery: SystemInfo['battery'] = null;
    try {
      if (nav.getBattery) {
        const b = await nav.getBattery();
        battery = {
          level: b.level,
          charging: b.charging,
          chargingTime: b.chargingTime,
          dischargingTime: b.dischargingTime,
        };
      }
    } catch { /* ignore */ }

    const data: SystemInfo = {
      userAgent: navigator.userAgent,
      platform: getOS(navigator.userAgent),
      lang: navigator.language,
      languages: Array.from(navigator.languages || []),
      cores: nav.hardwareConcurrency ?? 0,
      deviceMemory: nav.deviceMemory ?? 0,
      colorDepth: w.screen?.colorDepth ?? 0,
      pixelRatio: w.devicePixelRatio ?? 1,
      width: w.screen?.width ?? 0,
      height: w.screen?.height ?? 0,
      maxTouchPoints: nav.maxTouchPoints ?? 0,
      online: navigator.onLine ?? false,
      timezone: tz,
      country: getCountryFromTimezone(tz),
      browser: getBrowser(navigator.userAgent),
      vendor: nav.vendor || 'Unknown',
      engine: getBrowser(navigator.userAgent) === 'Safari' ? 'WebKit' : 'Blink',
      connectionType: conn?.type || 'unknown',
      effectiveType: conn?.effectiveType || '4g',
      downlink: conn?.downlink || 0,
      rtt: conn?.rtt || 0,
      saveData: conn?.saveData || false,
      storageQuota,
      storageUsage,
      audioInputs,
      audioOutputs,
      videoInputs,
      battery,
    };
    setInfo(data);
  }, []);

  useEffect(() => {
    setMounted(true);
    // Request permission for device labels (needed for audio/video device names)
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then((stream) => {
          stream.getTracks().forEach((tr) => tr.stop());
          collect();
        })
        .catch(() => collect());
    } else {
      collect();
    }
    const onOnline = () => collect();
    const onOffline = () => collect();
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [collect]);

  if (!mounted) return null;

  const memoryMB = info?.deviceMemory ? info.deviceMemory * 1024 : 0;
  const storagePercent = info?.storageQuota ? Math.min(100, (info.storageUsage / info.storageQuota) * 100) : 0;
  const batteryPercent = info?.battery ? Math.round(info.battery.level * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col items-center px-6 pt-16 pb-12">
      <div className="container-port w-full max-w-4xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="section-tag">{t('tools.ycpu.tag')}</span>
            <h1 className="section-title mb-4">
              {t('tools.ycpu.title')} <span className="grad-text">{t('tools.ycpu.titleHighlight')}</span>
            </h1>
            <p className="text-muted max-w-2xl">{t('tools.ycpu.description')}</p>
          </div>
          <button onClick={collect} className="btn btn-ghost !py-2.5">
            <RefreshCw size={16} /> {t('tools.ycpu.refresh')}
          </button>
        </div>

        {!info ? (
          <div className="glass p-8 text-center">
            <Monitor size={40} className="mx-auto text-muted mb-3" />
            <p className="text-muted">{t('tools.ycpu.unsupported')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* System Overview */}
            <div className="glass p-6">
              <h3 className="flex items-center gap-2 font-semibold text-sm mb-4">
                <Monitor size={16} className="text-accent" /> {t('tools.ycpu.systemInfo')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={<Building2 size={15} />} label={t('tools.ycpu.os') + ' / ' + t('tools.ycpu.platform')} value={info.platform} />
                <InfoRow icon={<Globe size={15} />} label={t('tools.ycpu.browser')} value={info.browser} />
                <InfoRow icon={<Fingerprint size={15} />} label={t('tools.ycpu.languages')} value={info.languages.join(', ')} />
                <InfoRow icon={<Clock size={15} />} label={t('tools.ycpu.timezone')} value={info.timezone} />
                <InfoRow icon={<MapPin size={15} />} label={t('tools.ycpu.country')} value={info.country} />
                <InfoRow icon={<Wifi size={15} />} label={t('tools.ycpu.connected')} value={info.online ? t('tools.ycpu.online') : t('tools.ycpu.offline')} />
                <InfoRow icon={<Info size={15} />} label={t('tools.ycpu.vendor')} value={info.vendor} />
                <InfoRow icon={<Cpu size={15} />} label={t('tools.ycpu.userAgent')} value={info.userAgent.slice(0, 60) + '…'} mono />
              </div>
            </div>

            {/* Hardware */}
            <div className="glass p-6">
              <h3 className="flex items-center gap-2 font-semibold text-sm mb-4">
                <HardDrive size={16} className="text-accent" /> {t('tools.ycpu.hardware')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={<Cpu size={15} />} label={t('tools.ycpu.cpuModel')} value={getCPUInfo(info.userAgent)} />
                <InfoRow icon={<Cpu size={15} />} label={t('tools.ycpu.cores')} value={`${info.cores} CPU`} />
                <InfoRow icon={<RamIcon size={15} />} label={t('tools.ycpu.memory')} value={formatBytes(memoryMB * 1024 * 1024)} />
                <InfoRow icon={<Battery size={15} />} label={t('tools.ycpu.battery')} value={info.battery ? `${batteryPercent}% ${info.battery.charging ? `(${t('tools.ycpu.charging')})` : ''}` : '—'} />
              </div>

              {/* Memory usage */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>{t('tools.ycpu.memoryUsage')}</span>
                  <span>{formatBytes(memoryMB * 1024 * 1024)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-hover overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${Math.min(100, memoryMB)}%` }} />
                </div>
              </div>

              {/* Battery details */}
              {info.battery && (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <InfoRow icon={<Battery size={15} />} label={t('tools.ycpu.batteryLevel')} value={`${batteryPercent}%`} />
                  <InfoRow icon={<Plug size={15} />} label={t('tools.ycpu.charging')} value={info.battery.charging ? 'Yes' : 'No'} />
                  <InfoRow icon={<Gauge size={15} />} label={t('tools.ycpu.batteryTime')} value={
                    info.battery.charging
                      ? info.battery.chargingTime === Infinity ? '—' : `${Math.round(info.battery.chargingTime / 60)} min`
                      : info.battery.dischargingTime === Infinity ? '—' : `${Math.round(info.battery.dischargingTime / 60)} min`
                  } />
                </div>
              )}
            </div>

            {/* Network */}
            <div className="glass p-6">
              <h3 className="flex items-center gap-2 font-semibold text-sm mb-4">
                <Network size={16} className="text-accent" /> {t('tools.ycpu.network')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={<Wifi size={15} />} label={t('tools.ycpu.connectionType')} value={info.connectionType} />
                <InfoRow icon={<Gauge size={15} />} label={t('tools.ycpu.effectiveType')} value={info.effectiveType} />
                <InfoRow icon={<Gauge size={15} />} label={t('tools.ycpu.downlink')} value={`${info.downlink} Mbps`} />
                <InfoRow icon={<Gauge size={15} />} label={t('tools.ycpu.rtt')} value={`${info.rtt} ms`} />
                <InfoRow icon={<Plug size={15} />} label={t('tools.ycpu.saveData')} value={info.saveData ? 'Yes' : 'No'} />
                <InfoRow icon={<Wifi size={15} />} label={t('tools.ycpu.connected')} value={info.online ? t('tools.ycpu.online') : t('tools.ycpu.offline')} />
              </div>
            </div>

            {/* Devices */}
            <div className="glass p-6">
              <h3 className="flex items-center gap-2 font-semibold text-sm mb-4">
                <AudioLines size={16} className="text-accent" /> {t('tools.ycpu.devices')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted mb-2">{t('tools.ycpu.audioInputs')}</div>
                  {info.audioInputs.length ? (
                    <ul className="space-y-1.5">
                      {info.audioInputs.map((d, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-body"><AudioLines size={14} className="text-primary-light" /> {d}</li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted">—</p>}
                </div>
                <div>
                  <div className="text-xs text-muted mb-2">{t('tools.ycpu.audioOutputs')}</div>
                  {info.audioOutputs.length ? (
                    <ul className="space-y-1.5">
                      {info.audioOutputs.map((d, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-body"><AudioLines size={14} className="text-primary-light" /> {d}</li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted">—</p>}
                </div>
                <div>
                  <div className="text-xs text-muted mb-2">{t('tools.ycpu.videoInputs')}</div>
                  {info.videoInputs.length ? (
                    <ul className="space-y-1.5">
                      {info.videoInputs.map((d, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-body"><Tv size={14} className="text-primary-light" /> {d}</li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted">—</p>}
                </div>
              </div>
            </div>

            {/* Storage */}
            <div className="glass p-6">
              <h3 className="flex items-center gap-2 font-semibold text-sm mb-4">
                <Database size={16} className="text-accent" /> {t('tools.ycpu.storage')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={<Database size={15} />} label={t('tools.ycpu.storageQuota')} value={formatBytes(info.storageQuota)} />
                <InfoRow icon={<Disc3 size={15} />} label={t('tools.ycpu.storageUsage')} value={`${formatBytes(info.storageUsage)} (${storagePercent.toFixed(1)}%)`} />
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>{t('tools.ycpu.storageUsage')}</span>
                  <span>{storagePercent.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-hover overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${storagePercent}%` }} />
                </div>
              </div>
            </div>

            {/* Display */}
            <div className="glass p-6">
              <h3 className="flex items-center gap-2 font-semibold text-sm mb-4">
                <Monitor size={16} className="text-accent" /> {t('tools.ycpu.display')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={<Monitor size={15} />} label={t('tools.ycpu.resolution')} value={`${info.width} × ${info.height}`} />
                <InfoRow icon={<Monitor size={15} />} label={t('tools.ycpu.colorDepth')} value={`${info.colorDepth}-bit`} />
                <InfoRow icon={<Monitor size={15} />} label="Pixel Ratio" value={`${info.pixelRatio}`} />
                <InfoRow icon={<Languages size={15} />} label={t('tools.ycpu.maxTouch')} value={`${info.maxTouchPoints}`} />
              </div>
            </div>

            {/* System-level info (not available in browser) */}
            <div className="glass border-amber-500/30 p-6">
              <h3 className="flex items-center gap-2 font-semibold text-sm mb-2 text-amber-400">
                <Lock size={16} /> {t('tools.ycpu.systemLevel')}
              </h3>
              <p className="text-sm text-muted mb-4">{t('tools.ycpu.systemLevelNote')}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={<Shield size={15} />} label={t('tools.ycpu.firewall')} value={t('tools.ycpu.notAvailable')} />
                <InfoRow icon={<Bug size={15} />} label={t('tools.ycpu.antivirus')} value={t('tools.ycpu.notAvailable')} />
                <InfoRow icon={<Fingerprint size={15} />} label={t('tools.ycpu.bios')} value={t('tools.ycpu.notAvailable')} />
                <InfoRow icon={<Fingerprint size={15} />} label={t('tools.ycpu.macAddress')} value={t('tools.ycpu.notAvailable')} />
                <InfoRow icon={<Wifi size={15} />} label={t('tools.ycpu.wifiName')} value={t('tools.ycpu.notAvailable')} />
                <InfoRow icon={<Bug size={15} />} label={t('tools.ycpu.backgroundProcesses')} value={t('tools.ycpu.notAvailable')} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-subtle bg-surface p-3.5">
      <span className="mt-0.5 shrink-0 text-primary-light">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-muted">{label}</div>
        <div className={`text-sm text-body break-words ${mono ? 'font-mono text-xs' : 'font-medium'}`}>{value}</div>
      </div>
    </div>
  );
}

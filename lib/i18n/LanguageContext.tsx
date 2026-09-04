"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import en from "./en.json";
import vi from "./vi.json";
import ko from "./ko.json";
import zh from "./zh.json";
import ja from "./ja.json";
import de from "./de.json";
import fr from "./fr.json";

export type Lang = "en" | "vi" | "ko" | "zh" | "ja" | "de" | "fr";
export const LANGS: Lang[] = ["en", "vi", "ko", "zh", "ja", "de", "fr"];
export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  vi: "Tiếng Việt",
  ko: "한국어",
  zh: "中文",
  ja: "日本語",
  de: "Deutsch",
  fr: "Français",
};
export const LANG_CODES: Record<Lang, string> = {
  en: "EN",
  vi: "VI",
  ko: "KO",
  zh: "中",
  ja: "日",
  de: "DE",
  fr: "FR",
};

const TRANSLATIONS: Record<Lang, Record<string, any>> = {
  en,
  vi,
  ko,
  zh,
  ja,
  de,
  fr,
};

const LOCALE_OVERRIDES: Partial<Record<Lang, Record<string, string>>> = {
  zh: {
    "nav.tools": "工具",
    "tools.todo.tabTasks": "任务",
    "tools.todo.tabGoals": "目标",
    "tools.todo.tabPlans": "计划",
    "tools.todo.tabSchedule": "日程",
    "tools.todo.tabAnalytics": "分析",
    "tools.todo.priorityLow": "低",
    "tools.todo.priorityMedium": "中",
    "tools.todo.priorityHigh": "高",
    "tools.todo.goalTitle": "目标名称",
    "tools.todo.goalDesc": "描述",
    "tools.todo.goalTarget": "目标值",
    "tools.todo.goalProgress": "进度",
    "tools.todo.addGoal": "添加",
    "tools.todo.planTitle": "计划名称",
    "tools.todo.addPlan": "添加计划",
    "tools.todo.emptyPlans": "还没有计划。创建一个计划开始吧！",
    "tools.todo.planStepPlaceholder": "添加步骤...",
    "tools.todo.scheduleTitle": "事件名称",
    "tools.todo.upcoming": "即将到来",
    "tools.todo.completed": "已完成",
    "tools.todo.emptySchedule": "还没有日程事件。添加一个事件开始吧！",
    "tools.todo.analyticsCompletion": "完成度",
    "tools.todo.analyticsGoals": "目标",
    "tools.todo.analyticsPlans": "计划",
    "tools.todo.analyticsSchedule": "日程",
    "tools.todo.analyticsOverall": "总体进度",
    "tools.todo.analyticsTasks": "任务",
    "tools.todo.analyticsWeek": "本周任务",
    "tools.todo.analyticsPriority": "按优先级统计活动任务",
    "tools.todo.analyticsGoalProgress": "目标进度",
    "tools.ycpu.title": "系统信息",
    "tools.ycpu.titleHighlight": "查看器",
    "tools.ycpu.tag": "// 工具",
    "tools.ycpu.description": "直接在浏览器中实时查看电脑规格，包括 CPU、内存、存储、电池等信息。",
    "tools.ycpu.os": "操作系统",
    "tools.ycpu.platform": "平台",
    "tools.ycpu.cores": "CPU 核心数",
    "tools.ycpu.cpuModel": "CPU 型号",
    "tools.ycpu.memory": "总内存",
    "tools.ycpu.usedMemory": "已用内存",
    "tools.ycpu.freeMemory": "可用内存",
    "tools.ycpu.memoryUsage": "内存使用情况",
    "tools.ycpu.battery": "电池",
    "tools.ycpu.batteryLevel": "电池电量",
    "tools.ycpu.charging": "充电中",
    "tools.ycpu.connected": "网络",
    "tools.ycpu.online": "在线",
    "tools.ycpu.offline": "离线",
    "tools.ycpu.display": "显示",
    "tools.ycpu.resolution": "分辨率",
    "tools.ycpu.colorDepth": "色深",
    "tools.ycpu.languages": "语言",
    "tools.ycpu.userAgent": "用户代理",
    "tools.ycpu.type": "类型",
    "tools.ycpu.vendor": "供应商",
    "tools.ycpu.engine": "引擎",
    "tools.ycpu.maxTouch": "最大触控点数",
    "tools.ycpu.refresh": "刷新",
    "tools.ycpu.detect": "检测我的系统",
    "tools.ycpu.systemInfo": "系统信息",
    "tools.ycpu.hardware": "硬件",
    "tools.ycpu.refreshInfo": "刷新系统信息",
    "tools.ycpu.unsupported": "系统信息需要浏览器环境。",
    "tools.ycpu.browser": "浏览器",
    "tools.ycpu.timezone": "时区",
    "tools.ycpu.country": "国家/地区",
    "tools.ycpu.network": "网络",
    "tools.ycpu.connectionType": "连接类型",
    "tools.ycpu.effectiveType": "有效类型",
    "tools.ycpu.downlink": "下载速度",
    "tools.ycpu.rtt": "RTT（延迟）",
    "tools.ycpu.saveData": "省流量模式",
    "tools.ycpu.devices": "媒体设备",
    "tools.ycpu.audioInputs": "音频输入",
    "tools.ycpu.audioOutputs": "音频输出",
    "tools.ycpu.videoInputs": "视频输入",
    "tools.ycpu.storage": "存储",
    "tools.ycpu.storageQuota": "存储配额",
    "tools.ycpu.storageUsage": "存储使用量",
    "tools.ycpu.systemLevel": "系统级信息（仅原生应用）",
    "tools.ycpu.systemLevelNote": "以下信息需要原生配套应用（Electron/Tauri），浏览器无法提供。此处展示这些项目以供参考。",
    "tools.ycpu.firewall": "防火墙",
    "tools.ycpu.antivirus": "杀毒软件",
    "tools.ycpu.bios": "BIOS / UEFI",
    "tools.ycpu.macAddress": "MAC 地址",
    "tools.ycpu.wifiName": "Wi-Fi 名称（SSID）",
    "tools.ycpu.backgroundProcesses": "后台进程",
    "tools.ycpu.notAvailable": "浏览器中不可用",
    "tools.ycpu.batteryTime": "剩余时间",
    "tools.yspeech.title": "Yspeech",
    "tools.yspeech.titleHighlight": "语音转文字",
    "tools.yspeech.tag": "// 工具",
    "tools.yspeech.description": "支持多种语言的实时语音转写。使用麦克风或上传音频，将语音转换为文字。",
    "tools.yspeech.start": "开始",
    "tools.yspeech.stop": "停止",
    "tools.yspeech.upload": "上传",
    "tools.yspeech.clear": "清除",
    "tools.yspeech.transcript": "转写内容",
    "tools.yspeech.placeholder": "现在开始说话，或在这里输入...",
    "tools.yspeech.listening": "正在聆听...",
    "tools.yspeech.idle": "空闲",
    "tools.yspeech.copy": "复制",
    "tools.yspeech.download": "下载",
    "tools.yspeech.words": "字",
    "tools.yspeech.unsupported": "您的浏览器不支持 Web Speech API。请使用受支持的浏览器（Chrome、Edge 或 Safari）。",
  },
};

const STORAGE_KEY = "ny-portfolio-lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLang(v: string | null): v is Lang {
  return v !== null && LANGS.includes(v as Lang);
}

export function LanguageProvider({ children, lang: initialLang }: { children: ReactNode, lang: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  const changeLang = useCallback((l: Lang) => {
    // Logic to redirect is handled by Navbar/Navigation component
    setLang(l);
  }, []);

  const t = useCallback(
    (path: string): string => {
      const override = LOCALE_OVERRIDES[lang]?.[path];
      if (override) return override;

      const keys = path.split(".");
      let result: any = TRANSLATIONS[lang];
      for (const k of keys) {
        if (result == null) return path;
        result = result[k];
      }
      if (typeof result === "string") return result;

      let fallback: any = en;
      for (const k of keys) {
        if (fallback == null) return path;
        fallback = fallback[k];
      }
      return typeof fallback === "string" ? fallback : path;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be inside LanguageProvider");
  return ctx;
}


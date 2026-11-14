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
    "tools.todo.tabOverview": "概览",
    "tools.todo.import": "导入",
    "tools.todo.export": "导出",
    "tools.todo.markAllComplete": "全部标记为完成",
    "tools.todo.sortCreated": "最新",
    "tools.todo.sortPriority": "优先级",
    "tools.todo.sortDue": "截止日期",
    "tools.todo.toastAdded": "已添加",
    "tools.todo.toastDeleted": "已删除",
    "tools.todo.toastCleared": "已清除已完成任务",
    "tools.todo.toastAllDone": "已将所有任务标记为完成",
    "tools.todo.toastExported": "数据已导出",
    "tools.todo.toastImported": "数据已导入",
    "tools.todo.toastImportError": "文件无效 — 无法导入",
    "tools.todo.overview.todayOverdue": "今天 & 已逾期",
    "tools.todo.overview.viewAll": "查看全部",
    "tools.todo.overview.noneToday": "今天没有到期任务，太棒了！",
    "tools.todo.overview.upcomingEvents": "即将到来",
    "tools.todo.overview.noUpcoming": "没有即将到来的事件。",
    "tools.todo.overview.overallProgress": "总体进度",
    "tools.ycpu.gameReq.title": "游戏系统需求检测",
    "tools.ycpu.gameReq.description": "在Steam上搜索一款游戏，并将其系统需求与检测到的设备配置进行比较。",
    "tools.ycpu.gameReq.placeholder": "输入游戏名称...",
    "tools.ycpu.gameReq.searchButton": "搜索",
    "tools.ycpu.gameReq.checking": "正在加载系统需求...",
    "tools.ycpu.gameReq.noResults": "未找到游戏。",
    "tools.ycpu.gameReq.minimum": "最低配置",
    "tools.ycpu.gameReq.recommended": "推荐配置",
    "tools.ycpu.gameReq.ramOk": "满足内存需求",
    "tools.ycpu.gameReq.ramLow": "内存可能不足",
    "tools.ycpu.gameReq.deviceSpecs": "您的检测配置",
    "tools.ycpu.gameReq.ramOnlyNote": "注意：仅自动比较内存——浏览器无法可靠地比对CPU/GPU型号。",
    "tools.ycpu.gameReq.error": "无法获取游戏数据。",
    "tools.ycpu.gameReq.errors.missing_query": "请输入游戏名称。",
    "tools.ycpu.gameReq.errors.invalid_url": "无效的Steam游戏链接。",
    "tools.ycpu.gameReq.errors.no_requirements_found": "该游戏页面未列出系统需求。",
    "tools.ycpu.gameReq.errors.fetch_failed": "无法获取游戏数据。",
    "seoChecker.tag": "// 工具",
    "seoChecker.title": "SEO & 安全",
    "seoChecker.titleHighlight": "检测工具",
    "seoChecker.description": "扫描网站，查找页面SEO问题和缺失的HTTP安全响应头。",
    "seoChecker.placeholder": "输入网站URL (https://...)",
    "seoChecker.checkButton": "检测",
    "seoChecker.checking": "检测中...",
    "seoChecker.seoScore": "SEO得分",
    "seoChecker.securityScore": "安全得分",
    "seoChecker.noIssues": "未发现问题。",
    "seoChecker.possiblyIncomplete": "该页面返回的内容非常少——可能需要登录，或真实内容是由JavaScript渲染的。以下结果可能无法反映已登录用户或支持JS的爬虫所看到的内容。",
    "seoChecker.error": "无法检测此URL。",
    "seoChecker.errors.invalid_url": "URL缺失或格式不正确。",
    "seoChecker.errors.fetch_failed": "无法检测此URL。",
    "seoChecker.issues.missing_title": "缺少标题（title）标签",
    "seoChecker.issues.missing_description": "缺少meta描述（description）标签",
    "seoChecker.issues.description_too_long": "描述过长（建议155字符以内）",
    "seoChecker.issues.missing_keywords": "缺少关键词（keywords）meta标签",
    "seoChecker.issues.missing_h1": "缺少H1标签",
    "seoChecker.issues.missing_robots": "缺少robots meta标签",
    "seoChecker.issues.images_without_alt": "有{count}张图片缺少alt属性",
    "seoChecker.issues.broken_links": "发现{count}个失效链接",
    "seoChecker.issues.missing_canonical": "缺少canonical标签",
    "seoChecker.issues.missing_og_title": "缺少Open Graph标题标签",
    "seoChecker.issues.missing_viewport": "缺少viewport meta标签",
    "seoChecker.issues.missing_hreflang": "缺少其他语言版本的hreflang标签",
    "seoChecker.issues.not_https": "页面未使用HTTPS",
    "seoChecker.issues.missing_schema": "缺少结构化数据（schema markup）",
    "seoChecker.issues.content_too_short": "内容过短（至少需要300字）",
    "seoChecker.issues.iframes_without_title": "有{count}个iframe缺少title属性",
    "seoChecker.issues.insufficient_internal_links": "需要添加更多内部链接以提升SEO",
    "seoChecker.issues.missing_csp": "缺少Content-Security-Policy（防范XSS等攻击）",
    "seoChecker.issues.missing_frame_options": "缺少X-Frame-Options（防止点击劫持）",
    "seoChecker.issues.missing_xss_protection": "缺少X-XSS-Protection（防范XSS攻击）",
    "seoChecker.issues.missing_hsts": "缺少Strict-Transport-Security（强制使用HTTPS）",
    "seoChecker.issues.missing_referrer_policy": "缺少Referrer-Policy（控制发送的来源信息）",
    "seoChecker.issues.missing_permissions_policy": "缺少Permissions-Policy（限制浏览器功能访问）",
    "seoChecker.issues.missing_corp": "缺少Cross-Origin-Resource-Policy（防止资源被意外共享）",
    "seoChecker.issues.missing_coop": "缺少Cross-Origin-Opener-Policy（有助于防范Spectre攻击）",
    "seoChecker.issues.missing_coep": "缺少Cross-Origin-Embedder-Policy（防范侧信道攻击）",
    "seoChecker.issues.missing_nosniff": "缺少X-Content-Type-Options（防止MIME嗅探攻击）",
    "seoChecker.issues.missing_cache_control": "缺少Cache-Control（保护缓存中的敏感数据）",
    "seoChecker.issues.missing_cors": "缺少CORS策略（控制跨域资源共享）",
    "seoChecker.issues.server_info_exposed": "Server响应头泄露了服务器信息（建议隐藏）",
    "seoChecker.issues.missing_cookie_flags": "Cookie缺少Secure、HttpOnly和SameSite标志（降低XSS和CSRF风险）",
  },
};

const STORAGE_KEY = "ny-portfolio-lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: string) => string;
  tList: (path: string) => string[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLang(v: string | null): v is Lang {
  return v !== null && LANGS.includes(v as Lang);
}

export function LanguageProvider({ children, lang: initialLang }: { children: ReactNode, lang: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  // Keep the <html lang="..."> attribute in sync — it lives on the root
  // layout's <html> tag, which this nested provider doesn't render itself.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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

  const tList = useCallback(
    (path: string): string[] => {
      const keys = path.split(".");

      let result: any = TRANSLATIONS[lang];
      for (const k of keys) {
        if (result == null) break;
        result = result[k];
      }
      if (Array.isArray(result)) return result;

      let fallback: any = en;
      for (const k of keys) {
        if (fallback == null) return [];
        fallback = fallback[k];
      }
      return Array.isArray(fallback) ? fallback : [];
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t, tList }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be inside LanguageProvider");
  return ctx;
}


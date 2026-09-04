import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'lib/i18n');

const services = {
  en: {
    tag: "// services",
    title: "Freelance",
    titleHighlight: "Services & Pricing",
    hourlyTitle: "Hourly Rate",
    hourlyPrice: "$10/hr",
    hourlyDesc: "Flexible engagement for small tasks, debugging, code reviews, or feature add-ons on your existing project. Transparent, timeboxed work with no long-term commitment — great for startups and teams that need targeted help without hiring full-time.",
    packagesTitle: "Project Packages",
    package1Title: "Landing Page",
    package1Price: "from $300",
    package1Time: "3–5 days",
    package1Features: [
      "Responsive React / Next.js landing page",
      "SEO basics + analytics (Google Analytics)",
      "Contact form integration (Email / Resend)",
      "Mobile-first, pixel-perfect design",
      "Performance optimization (Lighthouse 90+)",
      "One-page or multi-section layout",
      "Source code + deployment setup",
      "1 week free bug-fix support"
    ],
    package2Title: "Web App / MVP",
    package2Price: "from $1500",
    package2Time: "4–6 weeks",
    package2Features: [
      "Full-stack React + Node.js (Next.js)",
      "Authentication + role-based access (JWT / RBAC)",
      "Database design & integration (PostgreSQL / MongoDB)",
      "REST / GraphQL API design & documentation",
      "Admin dashboard & protected routes",
      "Deployment (Docker / AWS / Vercel)",
      "CI/CD setup + automated testing",
      "2 weeks free support + maintenance option"
    ],
    package3Title: "E-commerce / Platform",
    package3Price: "Custom quote",
    package3Time: "5–9 weeks",
    package3Features: [
      "Modular monolith architecture (scalable)",
      "Payments (Stripe / PayPal) + secure checkout",
      "Admin dashboard with order & inventory management",
      "Product catalog, cart & search",
      "Email notifications + order tracking",
      "Testing & CI/CD pipeline",
      "Performance & security hardening",
      "Ongoing maintenance & support plans"
    ],
    note: "Prefer email for project details and a tailored quote. Free 30-minute consultation for every new project. Rates based on 2026 Vietnam market — fixed-price packages available for international clients."
  },
  vi: {
    tag: "// dịch vụ",
    title: "Dịch vụ",
    titleHighlight: "Freelance & Bảng giá",
    hourlyTitle: "Giá thuê theo giờ",
    hourlyPrice: "$10/giờ",
    hourlyDesc: "Linh hoạt cho các tác vụ nhỏ, sửa lỗi, review code, hoặc thêm tính năng vào dự án hiện tại của bạn. Công việc minh bạch, theo thời gian cụ thể, không ràng buộc dài hạn — phù hợp cho startup và đội ngũ cần hỗ trợ đúng trọng tâm mà không cần tuyển full-time.",
    packagesTitle: "Các gói dự án",
    package1Title: "Landing Page",
    package1Price: "từ $300",
    package1Time: "3–5 ngày",
    package1Features: [
      "Trang landing React / Next.js responsive",
      "SEO cơ bản + analytics (Google Analytics)",
      "Tích hợp form liên hệ (Email / Resend)",
      "Thiết kế mobile-first, hoàn hảo từng pixel",
      "Tối ưu hiệu năng (Lighthouse 90+)",
      "Bố cục một trang hoặc nhiều section",
      "Mã nguồn + hướng dẫn triển khai",
      "Hỗ trợ sửa lỗi miễn phí 1 tuần"
    ],
    package2Title: "Web App / MVP",
    package2Price: "từ $1500",
    package2Time: "4–6 tuần",
    package2Features: [
      "Full-stack React + Node.js (Next.js)",
      "Xác thực + phân quyền (JWT / RBAC)",
      "Thiết kế & tích hợp database (PostgreSQL / MongoDB)",
      "Thiết kế REST / GraphQL API + tài liệu",
      "Admin dashboard & route bảo vệ",
      "Triển khai (Docker / AWS / Vercel)",
      "CI/CD + kiểm thử tự động",
      "Hỗ trợ miễn phí 2 tuần + tùy chọn bảo trì"
    ],
    package3Title: "E-commerce / Nền tảng",
    package3Price: "Báo giá riêng",
    package3Time: "5–9 tuần",
    package3Features: [
      "Kiến trúc modular monolith (mở rộng được)",
      "Thanh toán (Stripe / PayPal) + checkout an toàn",
      "Admin dashboard quản lý đơn hàng & kho",
      "Danh mục sản phẩm, giỏ hàng & tìm kiếm",
      "Email thông báo + theo dõi đơn hàng",
      "Testing & CI/CD pipeline",
      "Tối ưu hiệu năng & bảo mật",
      "Gói bảo trì & hỗ trợ lâu dài"
    ],
    note: "Bạn nên gửi email với chi tiết dự án để nhận báo giá phù hợp. Tư vấn 30 phút miễn phí cho mỗi dự án mới. Giá dựa trên thị trường Việt Nam 2026 — có gói giá cố định cho khách quốc tế."
  },
  ko: {
    tag: "// 서비스",
    title: "프리랜서",
    titleHighlight: "서비스 및 가격",
    hourlyTitle: "시간당 요금",
    hourlyPrice: "$10/시간",
    hourlyDesc: "소규모 작업, 디버깅, 코드 리뷰 또는 기존 프로젝트에 기능 추가를 위한 유연한 계약. 투명하고 시간 제한이 있는 작업으로 장기 계약 없이 — 스타트업과 팀에 적합합니다.",
    packagesTitle: "프로젝트 패키지",
    package1Title: "랜딩 페이지",
    package1Price: "부터 $300",
    package1Time: "3–5일",
    package1Features: [
      "반응형 React / Next.js 랜딩 페이지",
      "SEO 기초 + 분석(Google Analytics)",
      "문의 양식 통합(Email / Resend)",
      "모바일 우선 픽셀 완벽 디자인",
      "성능 최적화(Lighthouse 90+)",
      "단일 또는 다중 섹션 레이아웃",
      "소스 코드 + 배포 설정",
      "1주 무료 버그 수정 지원"
    ],
    package2Title: "웹 앱 / MVP",
    package2Price: "부터 $1500",
    package2Time: "4–6주",
    package2Features: [
      "풀스택 React + Node.js(Next.js)",
      "인증 + 역할 기반 액세스(JWT / RBAC)",
      "데이터베이스 설계 및 통합(PostgreSQL / MongoDB)",
      "REST / GraphQL API 설계 및 문서화",
      "관리자 대시보드 및 보호된 경로",
      "배포(Docker / AWS / Vercel)",
      "CI/CD + 자동화 테스트",
      "2주 무료 지원 + 유지보수 옵션"
    ],
    package3Title: "이커머스 / 플랫폼",
    package3Price: "개별 견적",
    package3Time: "5–9주",
    package3Features: [
      "모듈식 모노리스 아키텍처(확장 가능)",
      "결제(Stripe / PayPal) + 안전한 체크아웃",
      "주문 및 재고 관리 관리자 대시보드",
      "제품 카탈로그, 장바구니 및 검색",
      "이메일 알림 + 주문 추적",
      "테스트 및 CI/CD 파이프라인",
      "성능 및 보안 강화",
      "지속적인 유지보수 및 지원 계획"
    ],
    note: "프로젝트 세부 사항과 맞춤 견적은 이메일로 문의하세요. 모든 새 프로젝트에 30분 무료 상담. 2026년 베트남 시장 기준 가격 — 국제 고객을 위한 고정 가격 패키지 제공."
  },
  zh: {
    tag: "// 服务",
    title: "自由职业",
    titleHighlight: "服务与价格",
    hourlyTitle: "每小时费率",
    hourlyPrice: "$10/小时",
    hourlyDesc: "灵活承接小任务、调试、代码审查或为现有项目添加功能。透明、限时的工作，无需长期承诺——非常适合需要针对性帮助的初创公司和团队。",
    packagesTitle: "项目套餐",
    package1Title: "落地页",
    package1Price: "起 $300",
    package1Time: "3–5 天",
    package1Features: [
      "响应式 React / Next.js 落地页",
      "SEO 基础 + 分析（Google Analytics）",
      "联系表单集成（Email / Resend）",
      "移动优先、像素完美的设计",
      "性能优化（Lighthouse 90+）",
      "单页或多区块布局",
      "源代码 + 部署配置",
      "1 周免费错误修复支持"
    ],
    package2Title: "Web 应用 / MVP",
    package2Price: "起 $1500",
    package2Time: "4–6 周",
    package2Features: [
      "全栈 React + Node.js（Next.js）",
      "认证 + 基于角色的访问（JWT / RBAC）",
      "数据库设计与集成（PostgreSQL / MongoDB）",
      "REST / GraphQL API 设计与文档",
      "管理仪表板 + 受保护路由",
      "部署（Docker / AWS / Vercel）",
      "CI/CD + 自动化测试",
      "2 周免费支持 + 维护选项"
    ],
    package3Title: "电商 / 平台",
    package3Price: "定制报价",
    package3Time: "5–9 周",
    package3Features: [
      "模块化单体架构（可扩展）",
      "支付（Stripe / PayPal）+ 安全结账",
      "订单与库存管理管理仪表板",
      "产品目录、购物车与搜索",
      "邮件通知 + 订单跟踪",
      "测试与 CI/CD 流水线",
      "性能与安全加固",
      "持续维护与支持计划"
    ],
    note: "请通过邮件发送项目详情以获得定制报价。每个新项目免费 30 分钟咨询。价格基于 2026 年越南市场——为国际客户提供固定价格套餐。"
  },
  ja: {
    tag: "// サービス",
    title: "フリーランス",
    titleHighlight: "サービスと価格",
    hourlyTitle: "時間単価",
    hourlyPrice: "$10/時間",
    hourlyDesc: "小規模タスク、デバッグ、コードレビュー、既存プロジェクトへの機能追加など柔軟な対応。透明で時間制限のある作業で長期契約なし——スタートアップやチームに最適です。",
    packagesTitle: "プロジェクトパッケージ",
    package1Title: "ランディングページ",
    package1Price: "から $300",
    package1Time: "3–5日",
    package1Features: [
      "レスポンシブ React / Next.js ランディングページ",
      "SEO 基礎 + アナリティクス（Google Analytics）",
      "問い合わせフォーム統合（Email / Resend）",
      "モバイルファースト、ピクセルパーフェクトなデザイン",
      "パフォーマンス最適化（Lighthouse 90+）",
      "単一または複数セクションのレイアウト",
      "ソースコード + デプロイ設定",
      "1週間無料バグ修正サポート"
    ],
    package2Title: "Webアプリ / MVP",
    package2Price: "から $1500",
    package2Time: "4–6週間",
    package2Features: [
      "フルスタック React + Node.js（Next.js）",
      "認証 + ロールベースアクセス（JWT / RBAC）",
      "データベース設計と統合（PostgreSQL / MongoDB）",
      "REST / GraphQL API 設計とドキュメント",
      "管理ダッシュボード + 保護されたルート",
      "デプロイ（Docker / AWS / Vercel）",
      "CI/CD + 自動テスト",
      "2週間無料サポート + メンテナンスオプション"
    ],
    package3Title: "Eコマース / プラットフォーム",
    package3Price: "カスタム見積",
    package3Time: "5–9週間",
    package3Features: [
      "モジュラーモノリスアーキテクチャ（拡張可能）",
      "決済（Stripe / PayPal）+ 安全なチェックアウト",
      "注文・在庫管理ダッシュボード",
      "商品カタログ、カート、検索",
      "メール通知 + 注文追跡",
      "テストとCI/CDパイプライン",
      "パフォーマンスとセキュリティ強化",
      "継続的なメンテナンスとサポートプラン"
    ],
    note: "プロジェクト詳細とカスタム見積はメールでお問い合わせください。すべての新規プロジェクトに30分無料相談。2026年ベトナム市場基準の価格——国際顧客向け固定価格パッケージあり。"
  },
  de: {
    tag: "// Dienstleistungen",
    title: "Freelance",
    titleHighlight: "Dienste & Preise",
    hourlyTitle: "Stundensatz",
    hourlyPrice: "$10/Std.",
    hourlyDesc: "Flexible Beauftragung für kleine Aufgaben, Debugging, Code-Reviews oder Funktionserweiterungen an Ihrem bestehenden Projekt. Transparente, zeitlich begrenzte Arbeit ohne langfristige Bindung — ideal für Startups und Teams.",
    packagesTitle: "Projektpakete",
    package1Title: "Landing Page",
    package1Price: "ab $300",
    package1Time: "3–5 Tage",
    package1Features: [
      "Responsive React / Next.js Landing Page",
      "SEO-Basis + Analytics (Google Analytics)",
      "Kontaktformular-Integration (Email / Resend)",
      "Mobile-First, pixelgenaues Design",
      "Leistungsoptimierung (Lighthouse 90+)",
      "Ein- oder mehrseitiges Layout",
      "Quellcode + Deployment-Setup",
      "1 Woche kostenloser Bugfix-Support"
    ],
    package2Title: "Web-App / MVP",
    package2Price: "ab $1500",
    package2Time: "4–6 Wochen",
    package2Features: [
      "Full-Stack React + Node.js (Next.js)",
      "Authentifizierung + rollenbasierter Zugriff (JWT / RBAC)",
      "Datenbankdesign & Integration (PostgreSQL / MongoDB)",
      "REST / GraphQL API-Design & Dokumentation",
      "Admin-Dashboard & geschützte Routen",
      "Deployment (Docker / AWS / Vercel)",
      "CI/CD + automatisierte Tests",
      "2 Wochen kostenloser Support + Wartungsoption"
    ],
    package3Title: "E-Commerce / Plattform",
    package3Price: "Individuelles Angebot",
    package3Time: "5–9 Wochen",
    package3Features: [
      "Modulare Monolith-Architektur (skalierbar)",
      "Zahlungen (Stripe / PayPal) + sicherer Checkout",
      "Admin-Dashboard für Bestell- & Lagerverwaltung",
      "Produktkatalog, Warenkorb & Suche",
      "E-Mail-Benachrichtigungen + Bestellverfolgung",
      "Testing & CI/CD-Pipeline",
      "Leistungs- & Sicherheitshärtung",
      "Laufende Wartungs- & Supportpläne"
    ],
    note: "Bitte senden Sie Projektdetails per E-Mail für ein individuelles Angebot. Kostenlose 30-minütige Beratung für jedes neue Projekt. Preise basierend auf dem vietnamesischen Markt 2026 — Festpreis-Pakete für internationale Kunden."
  },
  fr: {
    tag: "// services",
    title: "Freelance",
    titleHighlight: "Services & Tarifs",
    hourlyTitle: "Tarif horaire",
    hourlyPrice: "$10/h",
    hourlyDesc: "Contrat flexible pour les petites tâches, le débogage, les revues de code ou l'ajout de fonctionnalités à votre projet existant. Travail transparent et limité dans le temps, sans engagement long terme — idéal pour les startups et les équipes.",
    packagesTitle: "Forfaits projets",
    package1Title: "Page d'atterrissage",
    package1Price: "à partir de $300",
    package1Time: "3–5 jours",
    package1Features: [
      "Page d'atterrissage responsive React / Next.js",
      "SEO de base + analytics (Google Analytics)",
      "Intégration de formulaire de contact (Email / Resend)",
      "Design mobile-first, pixel-perfect",
      "Optimisation des performances (Lighthouse 90+)",
      "Mise en page simple ou multi-sections",
      "Code source + configuration de déploiement",
      "1 semaine de support gratuit de correction"
    ],
    package2Title: "Application Web / MVP",
    package2Price: "à partir de $1500",
    package2Time: "4–6 semaines",
    package2Features: [
      "Full-stack React + Node.js (Next.js)",
      "Authentification + accès basé sur les rôles (JWT / RBAC)",
      "Conception et intégration de base de données (PostgreSQL / MongoDB)",
      "Conception API REST / GraphQL + documentation",
      "Tableau de bord admin + routes protégées",
      "Déploiement (Docker / AWS / Vercel)",
      "CI/CD + tests automatisés",
      "2 semaines de support gratuit + option maintenance"
    ],
    package3Title: "E-commerce / Plateforme",
    package3Price: "Devis personnalisé",
    package3Time: "5–9 semaines",
    package3Features: [
      "Architecture monolithe modulaire (évolutive)",
      "Paiements (Stripe / PayPal) + checkout sécurisé",
      "Tableau de bord admin gestion des commandes & stocks",
      "Catalogue produits, panier & recherche",
      "Notifications e-mail + suivi de commande",
      "Tests & pipeline CI/CD",
      "Renforcement performance & sécurité",
      "Plans de maintenance et de support continus"
    ],
    note: "Veuillez envoyer les détails du projet par e-mail pour un devis personnalisé. Consultation gratuite de 30 minutes pour chaque nouveau projet. Tarifs basés sur le marché vietnamien 2026 — forfaits à prix fixe pour les clients internationaux."
  }
};

for (const file of ['en.json','vi.json','ko.json','zh.json','ja.json','de.json','fr.json']) {
  const lang = file.replace('.json','');
  const filePath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  data.services = services[lang];
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${file}`);
}
console.log('Done.');

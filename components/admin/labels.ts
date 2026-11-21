/* Vietnamese names for the fields the admin page shows, and which fields get a special input. */
export const FIELD_LABELS: Record<string, string> = {
  name: "Tên", role: "Chức danh", location: "Nơi ở", email: "Email", phone: "Số điện thoại", github: "GitHub", linkedin: "LinkedIn", facebook: "Facebook", summary: "Tóm tắt",
  key: "Nhóm", title: "Tiêu đề", icon: "Biểu tượng", items: "Danh sách", id: "Mã", company: "Công ty", date: "Thời gian", outcome: "Kết quả nổi bật",
  g1: "Màu 1", g2: "Màu 2", techHighlight: "Công nghệ nổi bật", tags: "Thẻ lọc", demoUrl: "Link demo", githubUrl: "Link mã nguồn",
  issuer: "Nơi cấp", detail: "Mức độ", degree: "Bằng cấp", school: "Trường", period: "Thời gian học", highlights: "Thành tích", selfDirected: "Tự học",
  // texts
  greeting: "Lời chào", available: "Trạng thái nhận việc", description: "Mô tả", subDescription: "Mô tả phụ", viewWork: "Nút xem dự án", contactMe: "Nút liên hệ", roles: "Vai trò chạy chữ",
  tag: "Nhãn nhỏ", titleHighlight: "Tiêu đề (phần tô màu)", subtitle: "Phụ đề", whoTitle: "Tôi là ai — tiêu đề", whoDesc: "Tôi là ai — nội dung", whatTitle: "Tôi làm gì — tiêu đề", whatDesc: "Tôi làm gì — nội dung", driveTitle: "Động lực — tiêu đề", driveDesc: "Động lực — nội dung",
  years: "Năm kinh nghiệm", projects: "Dự án", clients: "Khách hàng", tech: "Công nghệ",
  desc: "Mô tả", tagline: "Câu giới thiệu", businessCore: "Giá trị kinh doanh", flow: "Luồng hoạt động", problem: "Vấn đề", solution: "Giải pháp", features: "Tính năng",
  question: "Câu hỏi", answer: "Trả lời", q: "Câu hỏi", a: "Trả lời",
};
export const label = (k: string) => FIELD_LABELS[k] ?? k.replace(/([a-z])([A-Z0-9])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

/** long text → textarea */
export const LONG = /desc|summary|description|answer|selfDirected|businessCore|problem|solution|whoDesc|whatDesc|driveDesc|^a$/i;
export const PROJECT_ICONS = ["hotel", "cart", "car", "server", "database", "monitor", "cpu", "code", "shield", "zap", "list", "alert", "check", "trending", "settings", "activity", "layout", "barChart"];
export const SKILL_ICONS = ["display", "server", "cloud", "brain"];
export const SKILL_KEYS = ["frontend", "backend", "infra", "concepts"];

export const DATA_SECTIONS: { key: string; title: string; hint: string }[] = [
  { key: "profile", title: "Hồ sơ", hint: "Tên, chức danh, liên hệ, mạng xã hội. Dùng cho mọi ngôn ngữ." },
  { key: "roleRotator", title: "Vai trò chạy chữ", hint: "Dùng khi ngôn ngữ chưa có “Vai trò chạy chữ” riêng (mục Trang đầu)." },
  { key: "skills", title: "Kỹ năng", hint: "Các nhóm kỹ năng và từng kỹ năng." },
  { key: "experience", title: "Kinh nghiệm", hint: "Công ty và thời gian. Chức danh, mô tả công việc sửa ở mục chữ “Kinh nghiệm — mô tả”." },
  { key: "projects", title: "Dự án", hint: "Tên, thời gian, màu, công nghệ, link. Mô tả dự án sửa ở mục chữ “Dự án — mô tả”." },
  { key: "certifications", title: "Chứng chỉ", hint: "Tên chứng chỉ hiển thị lấy từ mục chữ “Chứng chỉ & học vấn” (certN); tên ở đây dùng khi chưa có bản dịch." },
  { key: "languages", title: "Ngoại ngữ", hint: "Tên ngôn ngữ hiển thị lấy từ mục chữ (langNName / langNDetail); ở đây dùng khi chưa có bản dịch." },
  { key: "education", title: "Học vấn", hint: "Trường, thời gian. Bằng cấp và thành tích hiển thị lấy từ mục chữ “Chứng chỉ & học vấn”." },
];
export const TEXT_SECTION_INFO: { key: string; title: string }[] = [
  { key: "hero", title: "Trang đầu" },
  { key: "about", title: "Giới thiệu" },
  { key: "stats", title: "Số liệu" },
  { key: "services", title: "Dịch vụ" },
  { key: "experienceData", title: "Kinh nghiệm — mô tả" },
  { key: "projectsData", title: "Dự án — mô tả" },
  { key: "credentialsData", title: "Chứng chỉ & học vấn" },
  { key: "faq", title: "Câu hỏi thường gặp" },
  { key: "contact", title: "Liên hệ" },
  { key: "footer", title: "Chân trang" },
];
export const LANG_NAMES: Record<string, string> = { vi: "Tiếng Việt", en: "English", ko: "한국어", zh: "中文", ja: "日本語", de: "Deutsch", fr: "Français" };
export const LANG_ORDER = ["vi", "en", "ko", "zh", "ja", "de", "fr"];

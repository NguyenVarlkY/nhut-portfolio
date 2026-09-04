# UPGRADE 3 — Tính năng mới (post-sanitize)

## Trạng thái
- ✅ CV fix: rename `J and F SD.pdf` → `resume.pdf` (HTTP 200)
- ✅ Sanitize (SQLi / XSS / profanity) trong Contact + ChatBot
- ✅ Language dropdown 7 ngôn ngữ, persist localStorage
- ✅ Services & Pricing, Command Palette, ScrollProgress, Project modal, copy email, social links

## Tính năng mới đợt này
- [x] Stats strip — số liệu ấn tượng (năm kinh nghiệm, dự án, clients, tech)
- [x] FAQ section — accordion hỏi đáp cho freelancer
- [x] Toast notification — thông báo "Copied", "Message sent"
- [x] i18n — thêm keys `stats.*` và `faq.*` cho cả 7 ngôn ngữ
- [x] Contact form — gửi email THẬT qua API route `/api/contact` (Resend REST API) + fallback `mailto:` khi chưa cấu hình
- [x] Server-side sanitize (SQLi / XSS / profanity) + rate-limit trong `/api/contact`
- [x] `.env.example` — hướng dẫn cấu hình Resend API key
- [ ] Verify: `tsc --noEmit` + `next build` + test gửi email


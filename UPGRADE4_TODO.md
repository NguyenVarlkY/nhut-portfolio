 # UPGRADE 4 — Testimonials + Blog + Services Guide + Giscus Fix — ✅ DONE

## Mục tiêu
Nâng cấp portfolio theo yêu cầu: Testimonials (i18n), Blog nâng cấp (fix lỗi + content dài), Hướng dẫn chỉnh text Services, Fix lỗi Giscus.

## Checklist

- [x] Tạo `components/Testimonials.tsx` — section nhận xét (avatar, quote, name, role, rating)
- [x] Thêm i18n keys `testimonials.*` vào 7 file JSON (en/vi/ko/zh/ja/de/fr)
- [x] Chèn `<Testimonials />` vào `app/page.tsx`
- [x] Fix lỗi "Invalid hook call" trong `app/blog/[slug]/page.tsx` (chuyển `next-mdx-remote/rsc`)
- [x] Fix lỗi Giscus "not installed on this repository" trong `components/Giscus.tsx`
- [x] Viết 4 bài blog dài trong `content/`:
  - [x] `ai-assisted-coding.mdx`
  - [x] `refactoring-guide.mdx`
  - [x] `k8s-deployment-crash-course.mdx`
  - [x] `gitlens-mastery.mdx`
- [x] Tạo `GUIDE_SERVICES.md` — hướng dẫn chỉnh text Services qua i18n
- [x] Chạy `next build` xác nhận không lỗi

## Phát hiện & Sửa đổi bổ sung
- ✅ Đã thêm `metadataBase` vào `app/layout.tsx` để sửa cảnh báo SEO của Next.js.
- ✅ Đã tạo `.env.example` để quản lý cấu hình các API keys (Resend, OpenAI, Giscus).
- ✅ Đã đồng bộ Testimonials vào layout chính (Home page).

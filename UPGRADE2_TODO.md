# Portfolio Upgrade #2 — Features A→G

## Bug cần sửa
- [ ] Fix dropdown ngôn ngữ: `z-100` → `z-[100]`, `bg-base-alt/98` → `bg-base-alt/95`, dùng ref-based outside-click

## Tính năng
- [ ] **A. Contact form hoạt động** (validation + sending/success/error states)
- [ ] **B. Persist ngôn ngữ** (localStorage) — theme đã tự persist qua next-themes
- [ ] **C. Scroll progress bar** (thanh tiến độ đọc đầu trang)
- [ ] **D. Copy email button** (click copy + feedback ✓)
- [ ] **E. Project detail modal** (click card project xem chi tiết)
- [ ] **F. Social links** (LinkedIn, Facebook) vào Footer + Contact
- [ ] **G. Command palette (Ctrl+K)** — điều hướng, đổi theme, đổi ngôn ngữ

## Files
- `lib/i18n/LanguageContext.tsx` — persistence + export LANG_LABELS/LANG_CODES
- `components/Navbar.tsx` — fix bug dropdown
- `components/ScrollProgress.tsx` — mới
- `components/CommandPalette.tsx` — mới
- `app/layout.tsx` — mount ScrollProgress + CommandPalette
- `lib/data.ts` — thêm social links + project details
- `components/Contact.tsx` — form + copy email + social
- `components/Footer.tsx` — social links
- `components/Projects.tsx` — modal chi tiết

## Verify
- [ ] `tsc --noEmit` pass
- [ ] `next build` thành công


# NHUT Portfolio — Nguyen Bui Nhut Y

Personal developer portfolio built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

## ✨ Features

- **Hero** — animated role rotator with typewriter effect
- **About** — who I am, what I do, what drives me
- **Skills** — categorized tech stack (Frontend / Backend / Infra / Concepts)
- **Experience** — interactive timeline with outcomes
- **Projects** — featured project cards with tags
- **Credentials** — certifications, languages, education
- **Contact** — email / phone / GitHub CTAs
- **Responsive** — mobile menu, fluid grid, dark glassmorphism theme
- **Animations** — Framer Motion scroll-reveal + floating gradient background

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm run start
```

## 📁 Project Structure

```
nhut-portfolio/
├── app/
│   ├── layout.tsx       # Root layout + fonts + metadata
│   ├── page.tsx         # Home page (assembles sections)
│   └── globals.css      # Tailwind + custom styles
├── components/          # Section components (Navbar, Hero, About...)
├── lib/
│   └── data.ts          # All profile / skills / experience / projects data
├── public/
│   └── assets/
│       └── resume.pdf   # Replace with your actual resume
├── tailwind.config.ts   # Design tokens (colors, fonts, shadows, animations)
└── package.json
```

## 🎨 Customization

All content lives in **`lib/data.ts`** — edit your name, skills, experience, projects, and contact info there. Design tokens (colors, fonts, shadows) are in **`tailwind.config.ts`**.

## 📄 Resume

Place your actual resume at `public/assets/resume.pdf`. The navbar "Resume" button links to it.

## 🛠️ Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | lucide-react |

## 📦 Deploy

Recommended: **Vercel** — connect the repo, it auto-detects Next.js.

```bash
npm run build   # verify build passes locally first
```

## 📄 License

Private — personal portfolio.


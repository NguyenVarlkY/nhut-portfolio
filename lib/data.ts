export const profile = {
  name: "NGUYEN BUI NHUT Y",
  role: "Full-Stack Developer",
  location: "District 7, HCMC",
  email: "y2002bt@gmail.com",
  phone: "0825 400 965",
  github: "https://github.com/NguyenNhutY",
  linkedin: "https://www.linkedin.com/in/nguyen-nhut-y/",
  facebook: "https://www.facebook.com/nguyennhuty",
  summary:
    "Full-stack developer focused on building production-ready web products with React, Next.js, TypeScript, Node.js, and MongoDB. I enjoy turning business requirements into secure, scalable, and user-friendly features from API to UI.",
};

export const roleRotator = [
  "Full-Stack Developer",
  "React & Next.js Engineer",
  "Node.js API Builder",
  "Product-focused Web Developer",
];

export interface SkillGroup {
  /** i18n key under skills.groups.* */
  key: "frontend" | "backend" | "infra" | "concepts";
  title: string;
  icon: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    key: "frontend",
    title: "Front-end",
    icon: "display",
    items: [
      "React.js/Next.js",
      "TypeScript",
      "JavaScript (ES6+)",
      "HTML5",
      "CSS3",
      "SCSS",
      "Tailwind CSS",
      "React Query",
      "Redux-Saga",
    ],
  },
  {
    key: "backend",
    title: "Back-end",
    icon: "server",
    items: ["Node.js/Express.js", "NestJS", "REST APIs", "GraphQL", "NoSQL / SQL", "Java Spring Boot", "Python Flask", "Fastify"],
  },
  {
    key: "infra",
    title: "Infra & Tools",
    icon: "cloud",
    items: ["Git/GitLab", "Docker", "Postman", "Firebase"],
  },
  {
    key: "concepts",
    title: "Engineering Concepts",
    icon: "brain",
    items: [
      "Clean Architecture",
      "MVC",
      "MVVM",
      "Modular Design",
      "OOP",
      "Auth & Authorization",
      "Agile / Scrum",
    ],
  },
];

// Job titles and description bullets are localized — see `experienceData` in
// each lib/i18n/*.json file, indexed by `id`. This keeps only language-agnostic
// facts here (company, dates) so there is one source of truth per language.
export interface Job {
  id: number;
  company: string;
  date: string;
  outcome?: string;
}

export const experience: Job[] = [
  { id: 0, company: "DaiNam — HCMC", date: "March 2026 – June 2026" },
  { id: 1, company: "Draco — HCMC", date: "Aug 2025 – Nov 2025" },
  { id: 2, company: "E-PARTNER — HCMC", date: "Apr 2024 – May 2024" },
  { id: 3, company: "Freelance — HCMC", date: "Mar 2022 – Jun 2022" },
];

// Tagline/desc/businessCore/flow/problem/solution/features are localized —
// see `projectsData` in each lib/i18n/*.json file, indexed by `id`.
export interface Project {
  id: number;
  title: string;
  date: string;
  icon: string;
  g1: string;
  g2: string;
  techHighlight: string[];
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
}

export const projects: Project[] = [
  {
    id: 0,
    title: "Phan Thiet Hotel Web",
    date: "Aug 2025 – Dec 2025",
    icon: "hotel",
    g1: "#f59e0b",
    g2: "#ef4444",
    techHighlight: ["Next.js", "Node.js (Bun)", "MongoDB", "JWT", "Cloudinary", "Brevo", "ORM"],
    tags: ["Next.js", "TailwindCSS", "Node.js(Bun)", "MongoDB", "REST", "MVC", "JWT", "Clerk", "Brevo", "Cloudinary"],
    demoUrl: "https://nhuty.dev",
    githubUrl: "https://github.com/NguyenNhutY",
  },
  {
    id: 1,
    title: "Healthy Food EC Web",
    date: "May 2024 – Sep 2024",
    icon: "cart",
    g1: "#22c55e",
    g2: "#10b981",
    techHighlight: ["Preact", "React Query", "Node.js", "MongoDB", "Stripe", "Docker", "GraphQL"],
    tags: ["Preact", "TypeScript", "Node.js", "MongoDB", "GraphQL", "Stripe", "Docker", "JWT", "RBAC", "React Query", "Cloudinary"],
    demoUrl: "https://nhuty.dev",
    githubUrl: "https://github.com/NguyenNhutY",
  },
  {
    id: 2,
    title: "Theoretical Driving Test Platform",
    date: "Feb 2024 – Apr 2024",
    icon: "car",
    g1: "#3b82f6",
    g2: "#8b5cf6",
    techHighlight: ["ASP.NET Core", "React", "MVVM", "SQL Server", "JWT", "RBAC"],
    tags: ["React", "TypeScript", "ASP.NET Core", "MVVM", "REST", "JWT", "RBAC"],
    demoUrl: "https://nhuty.dev",
    githubUrl: "https://github.com/NguyenNhutY",
  },
  {
    id: 3,
    title: "Yspeech - Speech-to-Text Application",
    date: "Jun 2026 – Aug 2026",
    icon: "monitor",
    g1: "#8b5cf6",
    g2: "#ec4899",
    techHighlight: ["React", "Node.js", "WebSocket", "MongoDB", "TypeScript"],
    tags: ["React", "Node.js", "WebSocket", "TypeScript", "TailwindCSS", "MongoDB"],
  },
  {
    id: 4,
    title: "YCPU - 8-bit CPU Simulator",
    date: "Jan 2026 – Mar 2026",
    icon: "cpu",
    g1: "#8b5cf6",
    g2: "#6366f1",
    techHighlight: ["React", "TypeScript", "Custom Assembler", "16-bit State Machine", "Visualization"],
    tags: ["React", "TypeScript", "Assembly", "State Machine", "Next.js"],
    demoUrl: "https://nhuty.dev",
    githubUrl: "https://github.com/NguyenNhutY",
  },
];

export const certifications = [
  { title: "Cybersecurity", issuer: "Google", date: "Mar 2024" },
  { title: "Project Manager (6/7 courses)", issuer: "Google", date: "Sep 2023" },
  { title: "UX Design", issuer: "Google", date: "Jan 2023" },
];

export const languages = [
  { name: "English B1", detail: "Professional working proficiency" },
  { name: "Vietnamese", detail: "Native" },
];

export const education = {
  degree: "Information Technology Engineer",
  school: "Saigon Technology University",
  period: "Oct 2020 – Dec 2026",
  highlights: [
    "Excellent grade in Information System Analysis & Design (2023)",
    "Excellent grade in Software Engineering System Design (2022)",
    "Talent Student Scholarship + Dual Degree Scholarship (TDTU & LTU — 2020)",
  ],
  selfDirected:
    "Structured paths on Udemy, Microsoft Learn & FreeCodeCamp covering React.js, Node.js/Express, TypeScript, REST APIs, GraphQL, MongoDB & Socket.IO.",
};


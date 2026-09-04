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
  title: string;
  icon: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
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
    title: "Back-end",
    icon: "server",
    items: ["Node.js/Express.js", "NestJS", "REST APIs", "GraphQL", "NoSQL / SQL", "Java Spring Boot", "Python Flask", "Fastify"],
  },
  {
    title: "Infra & Tools",
    icon: "cloud",
    items: ["Git/GitLab", "Docker", "Postman", "Firebase"],
  },
  {
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

export interface Job {
  title: string;
  company: string;
  date: string;
  desc: string[];
  outcome?: string;
}

export const experience: Job[] = [
      {
    title: "Software Developer Fresher",
    company: "DaiNam — HCMC",
    date: "March 2026 – June 2026",
    desc: [
            "Developed CRM/ERP modules for Master Data Management, including bulk operations, hierarchical data structures, search, and approval workflows.",
            "Built secure user and role management features with authentication, input validation, profanity filtering, and access control using Next.js, Spring Boot, PostgreSQL, and React Query.",
            "Developed HR management, bilingual UI, dashboard analytics, and AI chatbot workflow modules to support business operations.",
            "Improved application and database performance through indexing, query optimization, and API integration.",
            "Collaborated with cross-functional teams to deliver enterprise software features across frontend and backend systems.",
    ],
  },
  {
    title: "Software Engineer Intern | Business Analysis Support",
    company: "Draco — HCMC",
    date: "Aug 2025 – Nov 2025",
    desc: [
      "Participate end-to-end feature development across frontend, backend validation, and database workflows for 3 ERP modules (accounting, UI, internal chat).",
      "Designed and implemented REST APIs with JWT-based authentication, ensuring secure role-based access control.",
      "Improved transaction consistency by validating edge cases and reducing data anomalies in internal workflows.",
      "Collaborated with frontend, backend, and AI teams to integrate Python-based agent APIs and document processing services.",
      "Applied cloud concepts (service integration, environment configuration) and Oracle database fundamentals (schema design, relational modeling).",
    ],
  },

  {
    title: "Front-End Intern",
    company: "E-PARTNER — HCMC",
    date: "Apr 2024 – May 2024",
    desc: [
            "Developed responsive React and Redux components supporting 5+ core user flows across multiple devices.",
            "Integrated REST APIs and supported frontend–backend deployment for customer-facing production releases."
    ],
  },

  {
    title: "Frontend Developer (Freelance)",
    company: "Freelance — HCMC",
    date: "Mar 2022 – Jun 2022",
    desc: [
            "Converted Figma designs into responsive React-based web applications for small business and event promotion projects.",
            "Worked directly with clients to gather requirements and deliver production-ready user interfaces."
    ],
  },
];

export interface Project {
  title: string;
  date: string;
  icon: string;
  g1: string;
  g2: string;
  tagline: string;
  desc: string;
  businessCore: string;
  flow: string[];
  problem: string;
  solution: string;
  features: string[];
  techHighlight: string[];
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
}

export const projects: Project[] = [
  {
    title: "Phan Thiet Hotel Web",
    date: "Aug 2025 – Dec 2025",
    icon: "hotel",
    g1: "#f59e0b",
    g2: "#ef4444",
    tagline: "Production-ready hotel booking & room management system",
    desc: "A complete hotel booking platform built for a Phan Thiet resort, covering the full guest journey from searching available rooms to receiving automated confirmation emails. The system ships with a secure admin dashboard that lets staff manage rooms, inventory, bookings, and media in real time. The backend is deployed with hardened environment configuration, integrates a CRM layer for customer relationship management, and uses an ORM to keep database access clean and maintainable. Cloudinary is used for scalable image and media management, while Brevo (Sendinblue) powers reliable transactional email notifications.",
    businessCore:
      "A hotel's core business is converting room inventory into confirmed bookings while maximizing occupancy and delivering a smooth guest experience. The system must keep availability accurate in real time, prevent double-booking, manage pricing and room types, and give staff a single source of truth for running the property.",
    flow: [
      "Guest browses the site and searches available rooms by date, guests, and room type",
      "System queries live inventory and returns only bookable rooms with accurate pricing",
      "Guest selects a room and enters guest details on the booking form",
      "Booking is created with server-side availability validation to prevent double-booking",
      "Payment / reservation is confirmed and an automated email is sent via Brevo",
      "Admin logs into the dashboard to manage bookings, rooms, and inventory in real time",
    ],
    problem:
      "The hotel previously managed bookings through phone calls, spreadsheets, and manual coordination. This led to frequent double-booking, stale availability data, slow guest communication, and no centralized record of reservations. Staff spent hours each day reconciling data, and the hotel lost revenue because rooms appeared unavailable when they were actually free.",
    solution:
      "I built a digital booking system that automates the entire flow. Real-time availability validation prevents conflicts, automated email confirmations remove manual communication, and the admin dashboard gives staff full visibility and control over rooms, bookings, and media. Secure environment configuration and an ORM layer keep the backend production-safe and maintainable.",
    features: [
      "Real-time room availability search across dates, guests, and room types",
      "Server-side availability validation to prevent double-booking",
      "Automated transactional email confirmations via Brevo",
      "Cloudinary-powered image and media management",
      "Admin dashboard for managing rooms, bookings, and inventory",
      "CRM layer for tracking customers and relationships",
      "Hardened environment configuration for secure production deployment",
    ],
    techHighlight: ["Next.js", "Node.js (Bun)", "MongoDB", "JWT", "Cloudinary", "Brevo", "ORM"],
    tags: ["Next.js", "TailwindCSS", "Node.js(Bun)", "MongoDB", "REST", "MVC", "JWT", "Clerk", "Brevo", "Cloudinary"],
    demoUrl: "https://nhuty.dev",
    githubUrl: "https://github.com/NguyenNhutY",
  },
  {
    title: "Healthy Food EC Web",
    date: "May 2024 – Sep 2024",
    icon: "cart",
    g1: "#22c55e",
    g2: "#10b981",
    tagline: "Production-ready e-commerce platform for healthy food",
    desc: "A modular-monolith e-commerce platform for a healthy food brand, built with a container–presentation React frontend and React Query for efficient data fetching. It supports a full purchasing journey — browsing products, cart, checkout, and Stripe payments — secured by JWT authentication with role-based access control (RBAC). The backend is organized as a modular monolith to keep business domains clean and testable, and the whole application is containerized with Docker for reproducible deployment. A GraphQL layer powers flexible queries, and Cloudinary handles product imagery.",
    businessCore:
      "An e-commerce business must get customers from browsing to a completed, paid order as efficiently as possible. The core is product catalog management, cart and checkout flow, secure payment processing, order tracking, and role-separated access (customers vs. admins) — all while keeping inventory and promotions consistent.",
    flow: [
      "Customer browses the product catalog and filters by category",
      "Customer adds items to the cart with quantities",
      "Customer checks out and enters shipping details",
      "Payment is processed securely through Stripe",
      "Order is created and synchronized with inventory",
      "Admin manages products, orders, and inventory via an RBAC-protected dashboard",
    ],
    problem:
      "The brand relied on manual order handling and lacked a unified online storefront. There was no consistent product catalog, no way to process payments securely, and no separation between customer and admin roles. Scaling sales was impossible because the entire ordering process was manual and error-prone.",
    solution:
      "I delivered a modular-monolith e-commerce platform that automates the full purchase journey. The container–presentation pattern keeps the UI clean and maintainable, React Query optimizes data fetching, JWT + RBAC secures customer and admin roles, and Stripe handles payments. Docker containerization makes deployment consistent and reproducible.",
    features: [
      "Product catalog with search, filtering, and category browsing",
      "Shopping cart and checkout flow",
      "Secure Stripe payment integration",
      "JWT authentication with role-based access control (RBAC)",
      "GraphQL-powered flexible data queries",
      "Modular monolith backend for clean separation of business domains",
      "Docker containerization for reproducible deployment",
    ],
    techHighlight: ["Preact", "React Query", "Node.js", "MongoDB", "Stripe", "Docker", "GraphQL"],
    tags: ["Preact", "TypeScript", "Node.js", "MongoDB", "GraphQL", "Stripe", "Docker", "JWT", "RBAC", "React Query", "Cloudinary"],
    demoUrl: "https://nhuty.dev",
    githubUrl: "https://github.com/NguyenNhutY",
  },
  {
    title: "Theoretical Driving Test Platform",
    date: "Feb 2024 – Apr 2024",
    icon: "car",
    g1: "#3b82f6",
    g2: "#8b5cf6",
    tagline: "Driving license theory test prep & administration",
    desc: "A web platform for preparing and administering driving license theory tests across multiple license categories. It hosts a 650+ question bank and generates randomized tests for a realistic exam experience. The backend is an ASP.NET Core Web API following the MVVM architecture, exposing admin CRUD endpoints for managing the question bank. The responsive React frontend lets learners study, take practice tests, and get instant feedback. JWT authentication with role-based access control separates learner and admin experiences.",
    businessCore:
      "A driving school's core business is getting learners to pass their theory exams. This requires a large, accurate question bank, realistic practice tests that mimic the real exam, progress tracking for learners, and admin tooling to keep questions and categories up to date.",
    flow: [
      "Learner registers and selects a license category (e.g., B1, B2, A)",
      "Learner studies the question bank by topic",
      "System generates a randomized practice test from the question bank",
      "Learner completes the test and receives instant feedback with correct answers",
      "Progress and results are tracked for the learner",
      "Admin logs in to add, edit, and manage questions across categories",
    ],
    problem:
      "Learners were studying with outdated paper materials that offered no interactivity, no randomization, and no way to measure progress. Instructors had no centralized tool to manage questions, and the static materials made it hard for learners to simulate the real exam experience, leading to lower pass rates.",
    solution:
      "I built a digital platform with a 650+ question bank, randomized test generation, instant feedback, and progress tracking. The MVVM architecture keeps the ASP.NET Core API clean, and JWT + RBAC cleanly separates the learner and admin experiences. Admins can manage the question bank through CRUD endpoints.",
    features: [
      "650+ question bank organized by category",
      "Randomized practice test generation for a realistic exam feel",
      "Instant feedback with correct answers after each test",
      "Progress tracking for learners",
      "Admin CRUD APIs for managing the question bank",
      "MVVM architecture with a responsive React frontend",
      "JWT authentication with role-based access control",
    ],
    techHighlight: ["ASP.NET Core", "React", "MVVM", "SQL Server", "JWT", "RBAC"],
    tags: ["React", "TypeScript", "ASP.NET Core", "MVVM", "REST", "JWT", "RBAC"],
    demoUrl: "https://nhuty.dev",
    githubUrl: "https://github.com/NguyenNhutY",
  },
  {
    title: "Yspeech - Speech-to-Text Application",
    date: "Jun 2026 – Aug 2026",
    icon: "monitor",
    g1: "#8b5cf6",
    g2: "#ec4899",
    tagline: "Real-time speech-to-text transcription tool",
    desc: "A speech-to-text web application that transcribes speech in real time with multi-language support and audio file upload. The React frontend captures microphone input and streams it to a Node.js backend over WebSocket for low-latency transcription. Processed results are returned to the UI instantly and can be saved to MongoDB. This tool is useful for meeting notes, transcription, accessibility, and content creation.",
    businessCore:
      "A speech-to-text product's core value is turning spoken audio into accurate, usable text with minimal latency. The system must handle live microphone input, support multiple languages, allow uploading pre-recorded audio, and manage the resulting transcripts for later use.",
    flow: [
      "User opens the app and selects a language and input mode (live mic or file upload)",
      "Live mic: audio is captured and streamed to the backend over WebSocket",
      "Backend processes audio and returns transcribed text incrementally",
      "UI renders the transcript in real time with low latency",
      "User can review, edit, and save the transcript",
      "Transcripts are stored in MongoDB for future retrieval",
    ],
    problem:
      "Manual transcription is slow, error-prone, and expensive, and many tools lack real-time feedback or multi-language support. Users needed a fast, accessible way to convert meetings, lectures, and interviews into text without typing everything by hand.",
    solution:
      "I built a real-time speech-to-text application with WebSocket streaming for low-latency transcription. Multi-language support and audio file upload make it flexible for many use cases, and transcripts are persistently stored in MongoDB so users can review and reuse them.",
    features: [
      "Real-time transcription via WebSocket streaming",
      "Multi-language support for international users",
      "Audio file upload for pre-recorded content",
      "Incremental transcript rendering with low latency",
      "Transcript review and editing",
      "Persistent transcript storage in MongoDB",
    ],
techHighlight: ["React", "Node.js", "WebSocket", "MongoDB", "TypeScript"],
    tags: ["React", "Node.js", "WebSocket", "TypeScript", "TailwindCSS", "MongoDB"],
  },
  {
    title: "YCPU - 8-bit CPU Simulator",
    date: "Jan 2026 – Mar 2026",
    icon: "cpu",
    g1: "#8b5cf6",
    g2: "#6366f1",
    tagline: "Educational 8-bit CPU architecture simulator",
    desc: "An interactive, in-browser 8-bit CPU simulator for learning computer architecture. It includes a custom instruction set, a small assembler that compiles assembly to 16-bit machine words, and a virtual CPU that executes instructions step-by-step. Users can watch registers, memory, and CPU flags update in real time, making low-level concepts like instruction fetch/decode/execute, program counters, and flags intuitive and hands-on.",
    businessCore:
      "A CPU simulator's core value is making computer architecture tangible. It must let users write and assemble programs, execute them on a virtual CPU, and visualize every internal state change — registers, program counter, memory, and flags — so learners can connect abstract concepts to observable behavior.",
    flow: [
      "User writes assembly in the built-in editor (e.g., LOAD, ADD, INC, CMP, JNZ)",
      "The assembler compiles the source into 16-bit machine instructions",
      "User steps through execution or runs the program automatically",
      "The virtual CPU updates registers, memory, and flags on each instruction",
      "User observes the sum/program result in memory and the final CPU state",
      "User can reset and re-run to explore different programs",
    ],
    problem:
      "Computer architecture is abstract and hard to grasp from textbooks and lectures alone. Students struggle to connect instruction sets, registers, and flags to real execution behavior, and they lack a safe, interactive sandbox to experiment with low-level programming.",
    solution:
      "I built a fully client-side 8-bit CPU simulator with a custom instruction set, assembler, and live register/memory/flag visualization. It provides an interactive, safe sandbox where learners can write assembly, step through execution, and see exactly how the CPU behaves — all in the browser with no setup.",
    features: [
      "Custom 8-bit instruction set with 16 opcodes",
      "Built-in assembler that compiles assembly to machine words",
      "Step-by-step execution and auto-run modes",
      "Live register (A, B, C, D) and program counter display",
      "Memory visualization with 256 bytes",
      "Zero, carry flag tracking",
      "Looping and conditional jumps (JMP, JZ, JNZ)",
    ],
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


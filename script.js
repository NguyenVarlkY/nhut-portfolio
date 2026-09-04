/* ==========================================================================
   NGUYEN BUI NHUT Y — Portfolio
   Data-driven rendering + interactions (no frameworks, pure vanilla JS).
   ========================================================================== */

// ---------------------------------------------------------------------------
// 1. DATA
// ---------------------------------------------------------------------------

const ROLE_ROTATOR = [
  'Software Engineer (Fresher)',
  'Full-stack Developer',
  'React & TypeScript Enthusiast',
  'Node.js & API Builder',
];

const SKILLS = [
  {
    title: 'Front-end',
    icon: 'fa-solid fa-display',
    items: ['React 18', 'Next.js', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'SCSS', 'Tailwind CSS', 'React Query', 'Redux-Saga', 'Yup', 'Quill', 'Preact'],
  },
  {
    title: 'Back-end',
    icon: 'fa-solid fa-server',
    items: ['Node.js', 'Express.js', 'NestJS', 'REST APIs', 'GraphQL', 'NoSQL / SQL', 'Prisma', 'JWT', 'RBAC'],
  },
  {
    title: 'Infra & Tools',
    icon: 'fa-solid fa-cloud',
    items: ['Git', 'Docker', 'Postman', 'AWS (EC2, S3)', 'Firebase', 'Bun'],
  },
  {
    title: 'Engineering Concepts',
    icon: 'fa-solid fa-brain',
    items: ['Clean Architecture', 'MVC', 'MVVM', 'Modular Design', 'OOP', 'Auth & Authorization', 'Agile / Scrum'],
  },
];

const EXPERIENCE = [
  {
    title: 'Software Developer Intern',
    company: 'Draco — HCMC',
    date: 'Aug 2025 – Nov 2025',
    desc: [
      'Owned end-to-end feature development across frontend, backend validation, and database workflows for 3 ERP modules (accounting, UI, internal chat).',
      'Designed and implemented REST APIs with JWT-based authentication, ensuring secure role-based access control.',
      'Improved transaction consistency by validating edge cases and reducing data anomalies in internal workflows.',
      'Collaborated with frontend, backend, and AI teams to integrate Python-based agent APIs and document processing services.',
      'Applied cloud concepts (service integration, environment configuration) and Oracle database fundamentals (schema design, relational modeling).',
    ],
  },
  {
    title: 'Software Developer Intern',
    company: 'SKIPLI — HCMC',
    date: 'Jul 2025 – Jul 2025',
    desc: [
      'Built an admin dashboard using React and Node.js to manage users, content, and system operations.',
      'Implemented JWT authentication and role-based authorization for admin and editor roles.',
      'Integrated Firestore real-time synchronization for admin data updates.',
    ],
    outcome: '2 user roles implemented & secured • 3+ admin modules delivered • Real-time data sync enabled',
  },
  {
    title: 'Front-End Intern',
    company: 'E-PARTNER — HCMC',
    date: 'Apr 2024 – May 2024',
    desc: [
      'Developed responsive React and Redux components supporting 5+ core user flows across multiple devices.',
      'Integrated REST APIs and supported frontend–backend deployment for customer-facing production releases.',
    ],
  },
  {
    title: 'Frontend Intern',
    company: 'FPT IS — HCMC',
    date: 'Mar 2023 – May 2023',
    desc: [
      'Developed frontend React.js and supported backend feature implementation with REST API.',
      'Worked with relational databases and participated in Agile/Scrum sprints.',
    ],
    outcome: '5+ REST API endpoints delivered • 3+ frontend features implemented • 10+ bug tickets fixed and merged',
  },
  {
    title: 'Frontend Developer (Freelance)',
    company: 'Freelance — HCMC',
    date: 'Mar 2022 – Jun 2022',
    desc: [
      'Converted Figma designs into responsive web interfaces using HTML, CSS, and React — landing pages for event promotion, personal business, and interior design.',
      'Implemented responsive layouts and reusable UI components, translating business requirements into user-focused solutions.',
      'Collaborated directly with clients to iterate on UI requirements and deliver production-ready pages.',
      'Designed data models and schemas and proposed technical solutions using Prisma ORM.',
    ],
  },
];

const PROJECTS = [
  {
    title: 'Phan Thiet Hotel Web',
    date: 'Aug 2025 – Dec 2025',
    icon: 'fa-solid fa-hotel',
    g1: '#f59e0b',
    g2: '#ef4444',
    desc: 'Production-ready hotel booking system with an admin dashboard, availability validation, automated email confirmations (Brevo) and Cloudinary media management. Deployed backend services with secure environment config.',
    tags: ['React', 'TailwindCSS', 'Node.js', 'MongoDB', 'REST', 'MVC', 'JWT', 'Clerk', 'Brevo', 'Cloudinary'],
    links: [{ label: 'GitHub', url: 'https://github.com/NguyenNhutY' }],
  },
  {
    title: 'Healthy Food EC Web',
    date: 'May 2024 – Sep 2024',
    icon: 'fa-solid fa-cart-shopping',
    g1: '#22c55e',
    g2: '#10b981',
    desc: 'Production-ready e-commerce platform using a modular monolith architecture. Container–presentation frontend with React Query, JWT auth + RBAC, Stripe payments, and Docker containerization. 100+ test orders processed with zero duplicates; sub-500ms API response times.',
    tags: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'GraphQL', 'Stripe', 'Docker', 'JWT', 'RBAC', 'React Query'],
    links: [{ label: 'GitHub', url: 'https://github.com/NguyenNhutY' }],
  },
  {
    title: 'Theoretical Driving Test Platform',
    date: 'Feb 2024 – Apr 2024',
    icon: 'fa-solid fa-car-side',
    g1: '#3b82f6',
    g2: '#8b5cf6',
    desc: 'Web platform supporting multiple license categories with a 650+ question bank and randomized test generation. ASP.NET Core Web API with MVVM architecture, admin CRUD APIs, responsive React frontend with dark mode. Deployed on AWS EC2 with S3 for media.',
    tags: ['ASP.NET Core', 'React', 'MVVM', 'SQL Server', 'AWS EC2', 'S3', 'Tailwind CSS'],
    links: [{ label: 'GitHub', url: 'https://github.com/NguyenNhutY' }],
  },
];

// ---------------------------------------------------------------------------
// 2. RENDER HELPERS
// ---------------------------------------------------------------------------

const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, html) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html != null) node.innerHTML = html;
  return node;
};

function renderSkills() {
  const grid = $('#skillsGrid');
  SKILLS.forEach((group, gi) => {
    const card = el('div', 'skill-card glass reveal');
    card.innerHTML = `
      <h3><i class="${group.icon}"></i> ${group.title}</h3>
      <div class="skill-chips">
        ${group.items.map((s) => `<span class="chip">${s}</span>`).join('')}
      </div>
    `;
    card.style.transitionDelay = `${gi * 60}ms`;
    grid.appendChild(card);
  });
}

function renderExperience() {
  const timeline = $('#timeline');
  EXPERIENCE.forEach((job, ji) => {
    const item = el('div', 'timeline-item glass reveal');
    item.innerHTML = `
      <div class="tl-head">
        <div>
          <h3 class="tl-title">${job.title}</h3>
          <div class="tl-role">${job.company}</div>
        </div>
        <span class="tl-date">${job.date}</span>
      </div>
      <ul class="tl-desc">
        ${job.desc.map((d) => `<li>• ${d}</li>`).join('')}
      </ul>
      ${job.outcome ? `<div class="tl-outcome"><strong>Outcome:</strong> ${job.outcome}</div>` : ''}
    `;
    item.style.transitionDelay = `${ji * 80}ms`;
    timeline.appendChild(item);
  });
}

function renderProjects() {
  const grid = $('#projectsGrid');
  PROJECTS.forEach((proj, pi) => {
    const card = el('div', 'project-card glass reveal');
    card.style.setProperty('--g1', proj.g1);
    card.style.setProperty('--g2', proj.g2);
    card.innerHTML = `
      <div class="project-banner"><i class="${proj.icon}"></i></div>
      <div class="project-body">
        <h3 class="project-title">${proj.title}</h3>
        <div class="project-date">${proj.date}</div>
        <p class="project-desc">${proj.desc}</p>
        <div class="project-tags">
          ${proj.tags.map((t) => `<span class="chip">${t}</span>`).join('')}
        </div>
        <div class="project-links">
          ${proj.links.map((l) => `<a href="${l.url}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> ${l.label}</a>`).join('')}
        </div>
      </div>
    `;
    card.style.transitionDelay = `${pi * 80}ms`;
    grid.appendChild(card);
  });
}

// ---------------------------------------------------------------------------
// 3. INTERACTIONS
// ---------------------------------------------------------------------------

// Typewriter effect for the hero role.
function startTypewriter() {
  const target = $('#typewriter');
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const current = ROLE_ROTATOR[roleIdx];
    const displayed = deleting
      ? current.slice(0, charIdx--)
      : current.slice(0, ++charIdx);

    target.textContent = displayed;

    let speed = deleting ? 28 : 60;
    if (!deleting && charIdx === current.length) {
      speed = 1800;
      deleting = true;
    } else if (deleting && charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % ROLE_ROTATOR.length;
      speed = 420;
    }
    setTimeout(tick, speed);
  }
  tick();
}

// Navbar active-link highlight on scroll + scrolled state.
function initScrollEffects() {
  const navbar = $('#navbar');
  const links = document.querySelectorAll('.nav-link');
  const sections = [...document.querySelectorAll('section[id], header[id]')];

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);

    const pos = window.scrollY + 120;
    let currentId = 'home';
    sections.forEach((sec) => {
      if (pos >= sec.offsetTop) currentId = sec.id;
    });
    links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${currentId}`));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Mobile hamburger menu.
function initMobileMenu() {
  const burger = $('#hamburger');
  const menu = $('#navLinks');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      menu.classList.remove('open');
    })
  );
}

// Scroll-reveal animation using IntersectionObserver.
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
}

// ---------------------------------------------------------------------------
// 4. INIT
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();
  renderSkills();
  renderExperience();
  renderProjects();
  startTypewriter();
  initScrollEffects();
  initMobileMenu();
  initReveal();
});


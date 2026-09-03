export const personalInfo = {
  name: "Tigran Petrosyants",
  title: "Full-Stack Web Developer | Angular, React & Node.js",
  location: "Yerevan, Armenia",
  email: "tigran.petrosyants@gmail.com",
  linkedin: "https://linkedin.com/in/tigran-petrosyants",
  github: "https://github.com/TigranPetosyants",
} as const;

export const summary = "Full-Stack Web Developer with 4 years of experience building and modernizing enterprise applications using Angular, TypeScript, Node.js, REST APIs, PostgreSQL, MongoDB, and Redis. Hands-on experience with Dockerized deployments, Linux production servers, HTTPS, and CI/CD. Build AI-assisted development workflows and automation infrastructure with controlled context, tool access, evaluation, and QA to improve delivery reliability and developer productivity.";

export const skills = {
  "Front-End": ["Angular 13–20", "React", "Next.js", "TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3/SCSS", "Tailwind CSS", "Astro", "Three.js", "GSAP", "Angular Material", "RxJS", "Figma", "Figma-to-Code Workflows", "Lit (familiar)"],
  "Back-End": ["Node.js", "Bun", "Express.js", "LoopBack", "MongoDB", "Firebase", "PostgreSQL (familiar)", "Redis (familiar)", "RESTful APIs", "GraphQL", "gRPC"],
  "AI Development & Automation": ["Cursor", "Claude Code", "OpenAI Codex", "OpenAI Agents SDK", "MCP (Model Context Protocol)", "Agent-to-Agent (A2A) interoperability", "Figma-to-Code Workflows", "Prompt/context orchestration", "Tool-permission control", "Evaluation and QA automation"],
  "Testing": ["Cypress (E2E)", "Puppeteer", "Unit Testing", "Component Testing"],
  "DevOps & Cloud": ["Git", "GitHub/GitLab", "Bitbucket", "GitLab CI/CD", "GitHub Actions", "Docker", "AWS (familiar)", "Linux", "HTTPS", "DNS", "Backups", "npm/yarn"],
  "Security & Integration": ["Keycloak", "Passport", "HttpOnly cookies", "CSRF", "Socket.io", "SignalR", "Swagger/OpenAPI", "Rate limiting"],
  "Methodologies": ["Agile/Scrum", "Code Reviews", "Technical Documentation", "Knowledge Transfer"],
} as const;

export const experience = [
  {
    role: "Web Developer",
    company: "FreeDOM Development CJSC",
    location: "Yerevan, Armenia (Remote)",
    period: "Oct 2022 — Present",
    bullets: [
      "Develop and maintain enterprise web applications using Angular, TypeScript, Node.js, and REST APIs",
      "Build backend services and third-party integrations using PostgreSQL, MongoDB, and Redis, including JWT/OAuth2 authentication, asynchronous processing, and message queues",
      "Design authentication, data synchronization, webhook, and error-handling flows across distributed services",
      "Containerize applications with Docker and use GitLab CI/CD for automated testing, builds, deployments, and production releases",
      "Improve application performance by eliminating redundant API calls, optimizing database queries, and introducing caching strategies",
      "Participate in architecture discussions, peer code reviews, technical documentation, and shared component/module development",
      "Collaborate with designers, QA, product stakeholders, and frontend/backend engineers from planning through production support",
    ],
  },
  {
    role: "Angular & Node.js Developer (Contract)",
    company: "STDEV",
    location: "Yerevan, Armenia (Remote)",
    period: "Aug 2025 — Aug 2026",
    bullets: [
      "Contributed to enterprise web applications in communications, workflow, and operations domains using Angular 20, TypeScript, Angular Material, RxJS, NgRx, Keycloak, SignalR, AG Grid, and data visualization libraries",
      "Led an enterprise Angular upgrade from version 17 to 20, migrating legacy RxJS-based modules to standalone components and signal-based state management",
      "Resolved breaking changes and deprecated APIs while adopting modern Angular control flow and architectural patterns",
      "Improved bundle size and load performance through lazy loading, OnPush change detection, and tree-shakeable standalone imports",
      "Built and maintained Node.js backend services with NestJS, Prisma, PostgreSQL, Redis, BullMQ, JWT/Passport authentication, Swagger/OpenAPI, throttling, and structured logging",
      "Integrated AI-assisted development capabilities using OpenAI agent tooling and contributed to automated QA, build-audit, and UI-guard workflows",
      "Collaborated with backend engineers, designers, and QA to deliver features without production downtime; conducted code reviews and documented migration patterns",
    ],
  },
  {
    role: "Web Development Intern",
    company: "FreeDOM Development CJSC",
    location: "Yerevan, Armenia (Remote)",
    period: "Oct 2022 — Dec 2022",
    bullets: [
      "Built responsive web applications using Angular, Tailwind CSS, HTML5, and CSS3, ensuring cross-browser compatibility and accessibility compliance",
      "Developed REST APIs with Node.js, Express.js, and MongoDB, following RESTful design principles and best practices",
      "Wrote E2E automated tests using Cypress, improving test coverage and reducing regression bugs",
      "Optimized application performance, accessibility (WCAG), and SEO through audit-driven improvements",
    ],
  },
  {
    role: "Customer Support Specialist",
    company: "Digitain",
    location: "Yerevan, Armenia",
    period: "Mar 2021 — Dec 2022",
    bullets: [
      "Provided technical support for enterprise-grade B2B gaming platform, troubleshooting complex issues and coordinating with development teams for resolution",
      "Developed strong communication and problem-solving skills in a fast-paced, client-facing technical environment serving international clients",
    ],
  },
] as const;

export const achievements = [
  "Completed an Angular 17-to-20 modernization without production downtime, migrating legacy RxJS modules to standalone components and signal-based state management",
  "Built reusable Angular components and shared technical documentation used across enterprise development work",
  "Mentored 3+ interns through onboarding and code-review cycles, supporting faster ramp-up and stronger code quality",
  "Built and operate production-oriented platforms with automated delivery, quality checks, and operational troubleshooting",
] as const;

export const education = [
  {
    degree: "Bachelor of Management",
    institution: "Eurasia International University, Yerevan",
    period: "Sep 2017 — Jun 2020",
  },
  {
    degree: "ERASMUS+ Exchange Scholarship",
    institution: "Santiago de Compostela University, Spain",
    period: "Dec 2019 — Jun 2020",
  },
] as const;

export const certifications = [
  { name: "Certificate of React JS", issuer: "Armenian Code Academy", period: "Nov 2021 — Feb 2022" },
  { name: "Certificate of JavaScript", issuer: "Microsoft Innovation Center", period: "Jul 2021 — Sep 2021" },
] as const;

export const languages = [
  { language: "Armenian", level: "Native" },
  { language: "English", level: "Professional" },
  { language: "Russian", level: "Professional" },
  { language: "Spanish", level: "Elementary" },
] as const;

export const stats = [
  { value: "4", label: "Years Experience" },
  { value: "30+", label: "Technologies" },
  { value: "3", label: "Companies" },
] as const;

export const projects = [
  {
    title: "ServiceNer.am",
    description: "A production-ready full-stack service marketplace connecting clients with verified professionals across Armenia. Built with a Next.js/React frontend, Express/TypeScript backend, MongoDB/Mongoose persistence, shared TypeScript contracts, multilingual Armenian/English/Russian content, booking workflows, provider/client dashboards, image uploads, and real-time Socket.io notifications. Includes protected authentication with HttpOnly JWT cookies, CSRF protection, validation, rate limiting, and role-aware access control. Docker Compose, Linux deployment, HTTPS, DNS, backups, Cypress E2E checks, smoke verification, and production health workflows support reliable operation.",
    tech: ["Next.js", "React", "Express.js", "Node.js", "TypeScript", "MongoDB", "Mongoose", "Socket.io", "Docker Compose", "Cypress", "Tailwind CSS"],
    link: "https://servicener.am",
    image: "/projects/servicener.png",
  },
  {
    title: "Sneakers Store",
    description: "An e-commerce single-page application for browsing and purchasing sneakers. Includes product catalog with filtering, shopping cart functionality, responsive design, and a clean modern UI.",
    tech: ["Angular", "TypeScript", "Tailwind CSS", "RxJS"],
    link: "https://angular-sneakers.vercel.app/home",
    image: "/projects/sneakers-store.png",
  },
  {
    title: "Technical Blog",
    description: "A tech blog platform with a dark-themed design system, featuring article listings, syntax-highlighted code blocks, and category-based navigation focused on Angular and web development news.",
    tech: ["Angular", "TypeScript", "Firebase", "SCSS", "Angular Material"],
    link: "https://tech-blog-angular.vercel.app/pages/angular-news",
    image: "/projects/fireblog.png",
  },
  {
    title: "Jobs Armenia IT",
    description: "An AI-assisted job aggregation and Telegram automation platform. A Bun/TypeScript worker aggregates jobs from 40+ configured sources, persists data in PostgreSQL or SQLite, deduplicates and classifies opportunities, routes them into structured Telegram topics, and generates daily or weekly AI digests. Includes eligibility filtering, AI-assisted publication quality review, source-health monitoring, concurrency control, and repository-aware automation workflows using Cursor, Claude Code, OpenAI Codex, MCP, and agent tooling.",
    tech: ["Bun", "TypeScript", "PostgreSQL", "SQLite", "Telegram Bot API", "AI Agents", "MCP", "Web Scraping"],
    link: "https://t.me/jobs_armenia_it",
    image: "/projects/armenia-it-jobs-bot.png",
  },
] as const;

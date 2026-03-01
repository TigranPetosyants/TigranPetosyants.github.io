export const personalInfo = {
  name: "Tigran Petrosyants",
  title: "Full-Stack Web Developer",
  location: "Yerevan, Armenia",
  email: "tigran.petrosyants@gmail.com",
  linkedin: "https://linkedin.com/in/tigran-petrosyants",
  github: "https://github.com/TigranPetosyants",
} as const;

export const summary = "Full-Stack Web Developer with 3+ years of experience building and modernizing enterprise-grade web applications using Angular (versions 13 through 20) and Node.js. Proven expertise in leading major framework upgrades, developing content management features, and integrating complex API ecosystems including REST, GraphQL, and gRPC. Experienced in building scalable front-end architectures, collaborating across cross-functional teams, and driving front-end innovation. Familiar with AI tooling concepts including MCP (Model Context Protocol) and Agent-to-Agent interoperability. Strong communicator with a track record of working independently on high-impact modernization and platform initiatives.";

export const skills = {
  "Front-End": ["Angular 13–20", "React", "Next.js", "TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3/SCSS", "Tailwind CSS", "Astro", "Three.js", "GSAP", "Angular Material", "RxJS", "Figma", "Figma-to-Code Workflows", "Lit (familiar)"],
  "Back-End": ["Node.js", "Bun", "Express.js", "LoopBack", "MongoDB", "PostgreSQL (familiar)", "Redis (familiar)", "RESTful APIs", "GraphQL", "gRPC"],
  "AI & Tooling": ["MCP (Model Context Protocol)", "Agent-to-Agent (A2A)"],
  "Testing": ["Cypress (E2E)", "Puppeteer", "Unit Testing", "Component Testing"],
  "DevOps & Cloud": ["Git", "GitHub/GitLab", "Bitbucket", "CI/CD Pipelines", "Docker", "AWS (familiar)", "Linux", "npm/yarn"],
  "Methodologies": ["Agile/Scrum", "Code Reviews", "Technical Documentation", "Knowledge Transfer"],
} as const;

export const experience = [
  {
    role: "Web Developer",
    company: "FreeDOM Development CJSC",
    location: "Yerevan, Armenia (Remote)",
    period: "Dec 2022 — Present",
    bullets: [
      "Developing dynamic enterprise web applications with Angular 13–17 and Angular Material, implementing complex forms, data tables, content management features, and interactive UI components",
      "Building and maintaining RESTful APIs using Node.js, LoopBack, and MongoDB, ensuring seamless front-end/back-end integration across distributed systems",
      "Integrating third-party APIs and services including authentication flows, data synchronization, and webhook-based event handling",
      "Conducting code reviews for team members and interns, enforcing coding standards and mentoring junior developers through onboarding",
      "Optimizing application performance through code refactoring, reducing API call redundancy, improving MongoDB query performance, and implementing caching strategies",
      "Creating and maintaining technical documentation for modules, facilitating knowledge transfer across the development team",
      "Collaborating with cross-functional teams including designers, QA, and backend developers to deliver enterprise features on schedule",
    ],
  },
  {
    role: "Front-End Developer (Contract)",
    company: "STDEV",
    location: "Yerevan, Armenia (Remote)",
    period: "Aug 2025 — Jan 2026",
    bullets: [
      "Led major Angular upgrade from version 17 to 20, migrating legacy RxJS-based module architecture to modern signal-based standalone component architecture across an enterprise-scale application",
      "Refactored deprecated patterns, resolved breaking changes, and adopted Angular's latest features including signal-based state management and modern control flow syntax",
      "Optimized application performance by implementing lazy loading, OnPush change detection, and tree-shakeable standalone imports, reducing bundle size and improving load times",
      "Collaborated with cross-functional teams including backend engineers, designers, and QA to ensure seamless integration during the upgrade process",
      "Conducted code reviews and provided constructive feedback to maintain codebase consistency, maintainability, and performance standards",
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
  "Successfully executed Angular 17 to 20 upgrade, migrating from RxJS-based modules to signal-based standalone architecture without production downtime",
  "Reduced application bundle size through migration to standalone components and tree-shakeable imports, improving page load performance",
  "Mentored 3+ interns through onboarding and code review cycles, accelerating their ramp-up time and code quality",
  "Maintained comprehensive upgrade and module documentation that served as a reference guide for the entire development team",
  "Built reusable Angular component library used across multiple enterprise projects, reducing development time for new features",
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
  { value: "3+", label: "Years Experience" },
  { value: "15+", label: "Technologies" },
  { value: "3", label: "Companies" },
] as const;

export const projects = [
  {
    title: "Portfolio Website",
    description: "Personal portfolio built with Astro, Tailwind CSS, Three.js, and GSAP — featuring a floating geometry constellation hero, scroll-scrubbed animations, and a dark futuristic design system.",
    tech: ["Astro", "TypeScript", "Three.js", "GSAP", "Tailwind CSS"],
    placeholder: false,
  },
  {
    title: "REST API Boilerplate",
    description: "Production-ready Node.js REST API starter with Express, MongoDB, JWT authentication, role-based access control, and structured error handling.",
    tech: ["Node.js", "Express.js", "MongoDB", "TypeScript", "JWT"],
    placeholder: false,
  },
  {
    title: "Angular Component Library",
    description: "Reusable UI component library built with Angular and Angular Material, featuring custom form controls, data tables, and theming support.",
    tech: ["Angular", "TypeScript", "Angular Material", "SCSS", "RxJS"],
    placeholder: false,
  },
] as const;

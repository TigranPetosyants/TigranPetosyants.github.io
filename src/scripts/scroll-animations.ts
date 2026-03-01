import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { setCameraZTarget, setLightColor } from '@scripts/three-scene';
import { setPlanetOpacity, setPlanetScale } from '@scripts/hero-planet';
import { setAsteroidsActive, repositionAsteroids } from '@scripts/project-asteroids';

gsap.registerPlugin(ScrollTrigger);

const CAMERA_Z_START = 5;
const CAMERA_Z_END = -72;

const LIGHT_COLOR_STOPS: Array<{ progress: number; color: number }> = [
  { progress: 0,    color: 0x06b6d4 },
  { progress: 0.15, color: 0x0d9488 },
  { progress: 0.30, color: 0x06b6d4 },
  { progress: 0.45, color: 0x7c3aed },
  { progress: 0.60, color: 0x0ea5e9 },
  { progress: 0.75, color: 0x06b6d4 },
  { progress: 1.0,  color: 0x22d3ee },
];

function interpolateLightColor(progress: number): number {
  let lower = LIGHT_COLOR_STOPS[0];
  let upper = LIGHT_COLOR_STOPS[LIGHT_COLOR_STOPS.length - 1];

  for (let i = 0; i < LIGHT_COLOR_STOPS.length - 1; i++) {
    if (progress >= LIGHT_COLOR_STOPS[i].progress && progress <= LIGHT_COLOR_STOPS[i + 1].progress) {
      lower = LIGHT_COLOR_STOPS[i];
      upper = LIGHT_COLOR_STOPS[i + 1];
      break;
    }
  }

  const range = upper.progress - lower.progress;
  const t = range === 0 ? 0 : (progress - lower.progress) / range;

  const lr = (lower.color >> 16) & 0xff;
  const lg = (lower.color >> 8) & 0xff;
  const lb = lower.color & 0xff;

  const ur = (upper.color >> 16) & 0xff;
  const ug = (upper.color >> 8) & 0xff;
  const ub = upper.color & 0xff;

  const r = Math.round(lr + (ur - lr) * t);
  const g = Math.round(lg + (ug - lg) * t);
  const b = Math.round(lb + (ub - lb) * t);

  return (r << 16) | (g << 8) | b;
}

export function initScrollAnimations(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.querySelectorAll('[data-animate]').forEach(el => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });
    setCameraZTarget(CAMERA_Z_START);
    return;
  }

  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  animateSceneScroll();
  animateHero();
  animateNavbar();
  animatePlanetScroll();
  animateAbout();
  animateSkills();
  animateExperience();
  animateProjects();
  animateEducation();
  animateContact();
  animateParallax();
}

function animateSceneScroll() {
  const main = document.querySelector('main');
  if (!main) return;

  ScrollTrigger.create({
    trigger: main,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.5,
    onUpdate: (self) => {
      const z = CAMERA_Z_START + (CAMERA_Z_END - CAMERA_Z_START) * self.progress;
      setCameraZTarget(z);
      setLightColor(interpolateLightColor(self.progress));
    },
  });
}

function animatePlanetScroll() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: 0.5,
    onUpdate: (self) => {
      setPlanetOpacity(1 - self.progress);
      setPlanetScale(1 - self.progress * 0.3);
    },
  });
}

function animateHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const heroContent = hero.querySelector('.relative.z-10') as HTMLElement;
  if (heroContent) {
    heroContent.style.perspective = '1200px';
    heroContent.style.transformStyle = 'preserve-3d';
  }

  document.addEventListener('loader-dismissed', () => {
    const tl = gsap.timeline();

    tl.to('[data-animate="hero-greeting"]', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    })
      .to('[data-animate="hero-name"]', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
      }, '-=0.4')
      .to('[data-animate="hero-title"]', {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
      }, '-=0.7')
      .to('[data-animate="hero-cta"]', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.5')
      .to('[data-animate="hero-scroll"]', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      }, '-=0.3');
  }, { once: true });

  if (!heroContent) return;

  const chars = heroContent.querySelectorAll('.hero-char');
  const words = heroContent.querySelectorAll('.hero-word');
  const ctaButtons = heroContent.querySelectorAll('[data-animate="hero-cta"] a');
  const titleLines = heroContent.querySelectorAll('[data-animate="hero-title"] .h-px');
  const scrollIndicator = hero.querySelector('[data-animate="hero-scroll"]');

  const scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '80% top',
      scrub: 0.6,
    },
  });

  scrollTl.to(chars, {
    z: () => -800 - Math.random() * 1200,
    x: () => (Math.random() - 0.5) * 600,
    y: () => (Math.random() - 0.5) * 400,
    rotationX: () => (Math.random() - 0.5) * 180,
    rotationY: () => (Math.random() - 0.5) * 180,
    opacity: 0,
    stagger: { each: 0.02, from: 'center' },
    ease: 'power2.in',
  }, 0);

  scrollTl.to(words, {
    z: () => -600 - Math.random() * 800,
    x: () => (Math.random() - 0.5) * 400,
    y: () => (Math.random() - 0.5) * 300,
    rotationX: () => (Math.random() - 0.5) * 90,
    rotationY: () => (Math.random() - 0.5) * 90,
    opacity: 0,
    stagger: { each: 0.03, from: 'edges' },
    ease: 'power2.in',
  }, 0);

  scrollTl.to(ctaButtons, {
    z: -1000,
    y: () => 100 + Math.random() * 200,
    rotationX: -45,
    opacity: 0,
    stagger: 0.05,
    ease: 'power2.in',
  }, 0);

  scrollTl.to(titleLines, {
    scaleX: 0,
    opacity: 0,
    ease: 'power2.in',
  }, 0);

  if (scrollIndicator) {
    scrollTl.to(scrollIndicator, {
      opacity: 0,
      y: 20,
      ease: 'power2.in',
    }, 0);
  }
}

function animateNavbar() {
  const navbar = document.getElementById('navbar');
  const sidebarNav = document.getElementById('sidebar-nav');
  const hero = document.getElementById('hero');
  if (!navbar || !sidebarNav || !hero) return;

  const sidebarLinks = sidebarNav.querySelectorAll('.sidebar-nav-link');

  gsap.set(sidebarNav, { opacity: 0, x: 30 });
  gsap.set(sidebarLinks, { opacity: 0, x: 10 });

  ScrollTrigger.create({
    trigger: hero,
    start: 'bottom 80px',
    onEnter: () => {
      window.dispatchEvent(new CustomEvent('navbar-mode-change', { detail: { vertical: true } }));

      gsap.to(navbar, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => {
          navbar.style.pointerEvents = 'none';
        },
      });

      sidebarNav.style.pointerEvents = 'auto';
      gsap.to(sidebarNav, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.to(sidebarLinks, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
        delay: 0.15,
      });
    },
    onLeaveBack: () => {
      window.dispatchEvent(new CustomEvent('navbar-mode-change', { detail: { vertical: false } }));

      navbar.style.pointerEvents = '';
      gsap.to(navbar, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.inOut',
      });

      sidebarNav.style.pointerEvents = 'none';
      gsap.to(sidebarNav, {
        opacity: 0,
        x: 30,
        duration: 0.4,
        ease: 'power2.in',
      });
      gsap.to(sidebarLinks, {
        opacity: 0,
        x: 10,
        duration: 0.3,
        ease: 'power2.in',
      });
    },
  });

  const onResize = () => {
    if (window.innerWidth < 768) {
      gsap.set(navbar, { opacity: 1, y: 0 });
      navbar.style.pointerEvents = '';
      gsap.set(sidebarNav, { opacity: 0, x: 30 });
      sidebarNav.style.pointerEvents = 'none';
      gsap.set(sidebarLinks, { opacity: 0, x: 10 });
      window.dispatchEvent(new CustomEvent('navbar-mode-change', { detail: { vertical: false } }));
    }
  };

  window.addEventListener('resize', onResize, { passive: true });
}

function animateAbout() {
  const section = document.getElementById('about');
  if (!section) return;

  gsap.set('[data-animate="section-title-about"]', { opacity: 0, x: -32 });
  gsap.set('[data-animate="about-text"]', { opacity: 0, y: 32 });
  gsap.set('[data-animate="stat-card"]', { opacity: 0, y: 24, scale: 0.9 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  });

  tl.to('[data-animate="section-title-about"]', {
    opacity: 1,
    x: 0,
    ease: 'power3.out',
    duration: 0.8,
  })
    .to('[data-animate="about-text"]', {
      opacity: 1,
      y: 0,
      ease: 'power2.out',
      duration: 0.9,
    }, '-=0.4')
    .to('[data-animate="stat-card"]', {
      opacity: 1,
      y: 0,
      scale: 1,
      ease: 'back.out(1.7)',
      stagger: 0.15,
      duration: 0.7,
      onStart: animateCounters,
    }, '-=0.4');
}

function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    const el = counter as HTMLElement;
    const raw = el.getAttribute('data-count') || '';
    const numericPart = parseFloat(raw.replace(/[^0-9.]/g, ''));
    const suffix = raw.replace(/[0-9.]/g, '');

    if (isNaN(numericPart)) return;

    const obj = { value: 0 };
    gsap.to(obj, {
      value: numericPart,
      duration: 1.5,
      ease: 'power2.out',
      delay: 0.2,
      onUpdate: () => {
        el.textContent = Math.round(obj.value) + suffix;
      },
    });
  });
}

function animateSkills() {
  const section = document.getElementById('skills');
  if (!section) return;

  gsap.set('[data-animate="section-title-skills"]', { opacity: 0, x: -32 });
  gsap.set('[data-animate="skill-card"]', { opacity: 0, y: 32, rotateX: 15 });
  gsap.set('[data-animate="skill-chip"]', { opacity: 0, scale: 0.75 });

  const skillsGrid = section.querySelector('[data-animate="skill-card"]')?.parentElement;
  if (skillsGrid) {
    (skillsGrid as HTMLElement).style.perspective = '1000px';
    (skillsGrid as HTMLElement).style.transformStyle = 'preserve-3d';
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  });

  tl.to('[data-animate="section-title-skills"]', {
    opacity: 1,
    x: 0,
    duration: 0.6,
    ease: 'power3.out',
  })
    .to('[data-animate="skill-card"]', {
      opacity: 1,
      y: 0,
      rotateX: 0,
      stagger: 0.08,
      duration: 0.5,
      ease: 'power3.out',
    }, '-=0.3');

  const skillCards = section.querySelectorAll('[data-animate="skill-card"]');
  skillCards.forEach((card, cardIndex) => {
    const chips = card.querySelectorAll('[data-animate="skill-chip"]');
    gsap.to(chips, {
      opacity: 1,
      scale: 1,
      stagger: 0.015,
      duration: 0.25,
      ease: 'back.out(1.5)',
      delay: 0.4 + cardIndex * 0.08,
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });
  });
}

function animateExperience() {
  const section = document.getElementById('experience');
  if (!section) return;

  gsap.set('[data-animate="section-title-experience"]', { opacity: 0, x: -32 });
  gsap.set('[data-animate="timeline-item"]', { opacity: 0 });

  gsap.to('[data-animate="section-title-experience"]', {
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
    opacity: 1,
    x: 0,
    ease: 'power3.out',
    duration: 0.8,
  });

  const timelineLine = document.querySelector('[data-animate="timeline-line"]') as HTMLElement;
  if (timelineLine) {
    gsap.fromTo(timelineLine,
      { scaleY: 0 },
      {
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          end: 'bottom 25%',
          scrub: 1,
        },
        scaleY: 1,
        ease: 'none',
        transformOrigin: 'top center',
      }
    );
  }

  const items = document.querySelectorAll('[data-animate="timeline-item"]');
  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    gsap.fromTo(item,
      { opacity: 0, x: isEven ? -50 : 50 },
      {
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        x: 0,
        ease: 'power3.out',
        duration: 0.8,
      }
    );
  });
}

function animateProjects() {
  const section = document.getElementById('projects');
  if (!section) return;

  gsap.set('[data-animate="section-title-projects"]', { opacity: 0, x: -32 });

  gsap.to('[data-animate="section-title-projects"]', {
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    opacity: 1,
    x: 0,
    ease: 'power3.out',
    duration: 0.8,
  });

  const spacer = document.getElementById('projects-scroll-spacer');
  if (spacer) {
    ScrollTrigger.create({
      trigger: spacer,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => setAsteroidsActive(true),
      onLeave: () => setAsteroidsActive(false),
      onEnterBack: () => setAsteroidsActive(true),
      onLeaveBack: () => setAsteroidsActive(false),
      onRefresh: (self) => {
        const maxScroll = ScrollTrigger.maxScroll(window);
        if (maxScroll <= 0) return;
        const startZ = CAMERA_Z_START + (CAMERA_Z_END - CAMERA_Z_START) * (self.start / maxScroll);
        const endZ = CAMERA_Z_START + (CAMERA_Z_END - CAMERA_Z_START) * (self.end / maxScroll);
        repositionAsteroids(startZ, endZ);
      },
    });
  }
}

function animateEducation() {
  const section = document.getElementById('education');
  if (!section) return;

  gsap.set('[data-animate="section-title-education"]', { opacity: 0, x: -32 });
  gsap.set('[data-animate="edu-card"]', { opacity: 0, y: 32 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  });

  tl.to('[data-animate="section-title-education"]', {
    opacity: 1,
    x: 0,
    duration: 0.8,
    ease: 'power3.out',
  })
    .to('[data-animate="edu-card"]', {
      opacity: 1,
      y: 0,
      stagger: 0.15,
      duration: 0.7,
      ease: 'power3.out',
    }, '-=0.4');
}

function animateContact() {
  const section = document.getElementById('contact');
  if (!section) return;

  gsap.set('[data-animate="section-title-contact"]', { opacity: 0, x: -32 });
  gsap.set('[data-animate="contact-item"]', { opacity: 0, y: 24 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  });

  tl.to('[data-animate="section-title-contact"]', {
    opacity: 1,
    x: 0,
    duration: 0.8,
    ease: 'power3.out',
  })
    .to('[data-animate="contact-item"]', {
      opacity: 1,
      y: 0,
      stagger: 0.15,
      duration: 0.7,
      ease: 'power2.out',
    }, '-=0.4');
}

function animateParallax() {
  const sections = document.querySelectorAll('#about, #skills, #experience, #education, #contact');
  sections.forEach(section => {
    const inner = section.querySelector('.max-w-6xl, .max-w-4xl');
    if (!inner) return;
    gsap.fromTo(inner,
      { y: 30 },
      {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  });
}

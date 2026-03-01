import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.querySelectorAll('[data-animate]').forEach(el => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });
    return;
  }

  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  animateHero();
  animateAbout();
  animateSkills();
  animateExperience();
  animateProjects();
  animateEducation();
  animateContact();
  animateParallax();
}

function animateHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const tl = gsap.timeline({ delay: 0.3 });

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

  const heroContent = hero.querySelector('.relative.z-10') as HTMLElement;
  if (heroContent) {
    gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=50%',
        pin: true,
        scrub: 0.6,
      },
    })
      .to(heroContent, {
        opacity: 0,
        scale: 0.9,
        y: -40,
        ease: 'none',
      }, 0)
      .to('#hero-canvas', {
        opacity: 0,
        ease: 'none',
      }, 0);
  }
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

  const track = section.querySelector('[data-animate="projects-track"]') as HTMLElement;
  const wrapper = section.querySelector('.projects-pin-wrapper') as HTMLElement;
  if (!track || !wrapper) return;

  const cards = track.querySelectorAll('[data-animate="project-card"]');
  const getScrollWidth = () => track.scrollWidth - window.innerWidth;

  gsap.set(cards[0], { opacity: 1, scale: 1 });
  for (let i = 1; i < cards.length; i++) {
    gsap.set(cards[i], { opacity: 0, scale: 0.9 });
  }

  const pinTl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: 'top top',
      end: () => `+=${getScrollWidth()}`,
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  pinTl.to(track, {
    x: () => -getScrollWidth(),
    ease: 'none',
  });

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

  for (let i = 1; i < cards.length; i++) {
    const revealAt = (i - 0.3) / cards.length;
    pinTl.fromTo(cards[i],
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, ease: 'power2.out', duration: 0.15 },
      revealAt
    );
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

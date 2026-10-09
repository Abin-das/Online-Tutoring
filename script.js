document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const progress = document.querySelector(".scroll-progress");
  const toTop = document.querySelector(".to-top");
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  // Header shadow, scroll progress bar, back-to-top button
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("is-scrolled", y > 10);
    toTop.classList.toggle("is-visible", y > 600);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  // Mobile menu
  const closeMenu = () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  };
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  // Reveal on scroll, with automatic stagger inside grids
  document.querySelectorAll(".course-grid, .value-grid").forEach((grid) => {
    [...grid.children].forEach((el, i) => el.style.setProperty("--d", `${i * 0.08}s`));
  });

  if (!("IntersectionObserver" in window)) {
    document.documentElement.classList.remove("js");
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add("is-visible");
          revealObserver.unobserve(el);
          // Hand control back to the element's own hover transitions once revealed
          const done = (e) => {
            if (e.target !== el) return;
            el.removeEventListener("transitionend", done);
            el.classList.remove("reveal", "reveal--left", "reveal--right");
            el.style.removeProperty("--d");
          };
          el.addEventListener("transitionend", done);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  // Highlight the active nav link for the section in view
  const links = [...nav.querySelectorAll(".nav__link")];
  const sections = links
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = "#" + entry.target.id;
        links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => navObserver.observe(s));

  // Subtle 3D tilt on course cards (desktop pointers only)
  if (window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) {
    document.querySelectorAll(".course").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }
});

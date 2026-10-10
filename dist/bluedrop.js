import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const siteNav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const megaMenuClose = document.querySelector(".mega-menu-close");
  const megaMenuTriggers = document.querySelectorAll(".nav-link.has-mega-menu");
  const megaMenus = document.querySelectorAll(".mega-menu");
  const revealItems = document.querySelectorAll(".reveal");
  const contactForm = document.querySelector(".form-card");

  const setActiveMegaMenu = (menuName = "") => {
    megaMenuTriggers.forEach((trigger) => {
      trigger.classList.toggle("is-active", trigger.dataset.menu === menuName);
    });

    megaMenus.forEach((menu) => {
      menu.classList.toggle("is-open", menu.dataset.panel === menuName);
    });
  };

  const setNavOpen = (isOpen) => {
    siteNav?.classList.toggle("is-open", isOpen);
    navToggle?.setAttribute("aria-expanded", String(isOpen));
  };

  setNavOpen(false);

  megaMenuTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      setActiveMegaMenu(trigger.dataset.menu);
      setNavOpen(true);
    });
  });

  navToggle?.addEventListener("click", () => {
    if (!siteNav?.classList.contains("is-open")) {
      setNavOpen(true);
      setActiveMegaMenu("soluciones");
    }
  });

  megaMenuClose?.addEventListener("click", () => {
    setNavOpen(false);
    setActiveMegaMenu("");
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -12% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  gsap.from(".hero-copy > *", {
    y: 28,
    opacity: 0,
    duration: 0.9,
    stagger: 0.08,
    ease: "power3.out",
  });

  gsap.from(".hero-media > *", {
    y: 40,
    opacity: 0,
    duration: 1,
    stagger: 0.12,
    delay: 0.15,
    ease: "power3.out",
  });

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(contactForm);
    const message = [
      "Hola, quiero solicitar un diagnostico de Blue Drop.",
      `Nombre: ${data.get("nombre") || ""}`,
      `Empresa: ${data.get("empresa") || ""}`,
      `Ciudad: ${data.get("ciudad") || ""}`,
      `Problema: ${data.get("problema") || ""}`,
      `Telefono: ${data.get("telefono") || ""}`,
    ].join("\n");

    window.open(`https://wa.me/529811686386?text=${encodeURIComponent(message)}`, "_blank");
  });

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });
});

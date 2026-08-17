import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();
  lenis.scrollTo(0, { immediate: true, force: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const nav = document.querySelector("nav");
  const heroSection = document.querySelector(".hero");
  const heroVideo = document.querySelector(".hero-video");
  const heroIframe = document.querySelector(".hero-video iframe");
  const header = document.querySelector(".header");
  const heroCard = document.querySelector(".hero-card");
  const videoSectionShell = document.querySelector(".video-section .shell");
  const siteNav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const megaMenuClose = document.querySelector(".mega-menu-close");
  const megaMenuOverlay = document.querySelector(".mega-menu-overlay");
  const megaMenuTriggers = document.querySelectorAll(".nav-link.has-mega-menu");
  const megaMenus = document.querySelectorAll(".mega-menu");
  const revealElements = document.querySelectorAll(".reveal, .reveal-section");
  const featureSections = document.querySelectorAll(".feature-section");
  const faqItems = document.querySelectorAll(".faq-item");
  const contactForm = document.querySelector(".contact-form");
  const lazyIframes = document.querySelectorAll("iframe[data-src]");
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const heroLoopEnd = 5;
  const heroPlaybackRate = 0.5;
  let heroPlayer = null;
  let heroLoopInterval = null;
  let heroLoopInProgress = false;
  let heroCriticalReady = false;
  let heroIframeLoadCount = 0;
  window.__blueDropHeroLoopCount = 0;
  heroVideo?.setAttribute("data-player-ready", "false");
  heroVideo?.setAttribute("data-loop-count", "0");
  heroVideo?.setAttribute("data-requested-quality", "hd1080");

  const syncHeroVideoScale = () => {
    if (!heroIframe) return;
    const scale = Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
    heroIframe.style.setProperty("--hero-video-scale", String(scale));
  };

  syncHeroVideoScale();

  const markHeroCriticalReady = () => {
    if (heroCriticalReady) return;
    heroCriticalReady = true;
    window.__cycCriticalReady = true;
    window.dispatchEvent(new CustomEvent("cyc:critical-ready"));
  };

  heroIframe?.addEventListener("load", () => {
    heroIframeLoadCount += 1;
    heroVideo?.setAttribute("data-iframe-load-count", String(heroIframeLoadCount));
    markHeroCriticalReady();
  });
  window.setTimeout(markHeroCriticalReady, 1800);

  const restartHeroLoop = () => {
    if (!heroPlayer || heroLoopInProgress) return;

    heroLoopInProgress = true;
    heroVideo?.classList.add("is-loop-transition");

    window.setTimeout(() => {
      heroPlayer.seekTo(0, true);
      heroPlayer.setPlaybackRate(heroPlaybackRate);
      heroPlayer.playVideo();
      window.__blueDropHeroLoopCount += 1;
      heroVideo?.setAttribute("data-loop-count", String(window.__blueDropHeroLoopCount));

      window.setTimeout(() => {
        heroVideo?.classList.remove("is-loop-transition");
        heroLoopInProgress = false;
      }, 180);
    }, 420);
  };

  const createHeroPlayer = () => {
    if (!heroIframe || heroPlayer || !window.YT?.Player) return;

    heroPlayer = new window.YT.Player("bluedrop-hero-player", {
      events: {
        onReady: (event) => {
          heroPlayer = event.target;
          window.__blueDropHeroPlayer = heroPlayer;
          heroPlayer.mute();
          heroPlayer.setPlaybackQuality?.("hd1080");
          heroPlayer.setPlaybackRate(heroPlaybackRate);
          heroPlayer.seekTo(0, true);
          heroPlayer.playVideo();
          heroVideo?.setAttribute("data-player-ready", "true");
          markHeroCriticalReady();

          heroLoopInterval = window.setInterval(() => {
            const currentTime = heroPlayer.getCurrentTime();
            heroVideo?.setAttribute("data-current-time", currentTime.toFixed(2));
            heroVideo?.setAttribute("data-quality", heroPlayer.getPlaybackQuality?.() || "auto");
            heroVideo?.setAttribute("data-playback-rate", String(heroPlayer.getPlaybackRate()));

            if (currentTime >= heroLoopEnd - 0.05) {
              restartHeroLoop();
            }
          }, 50);
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            heroPlayer.setPlaybackQuality?.("hd1080");
            heroPlayer.setPlaybackRate(heroPlaybackRate);
          }

          if (event.data === window.YT.PlayerState.ENDED) {
            restartHeroLoop();
          }
        },
      },
    });
  };

  const previousYouTubeReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    previousYouTubeReady?.();
    createHeroPlayer();
  };

  if (window.YT?.Player) {
    createHeroPlayer();
  } else if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
    const apiScript = document.createElement("script");
    apiScript.src = "https://www.youtube.com/iframe_api";
    apiScript.async = true;
    document.head.append(apiScript);
  }

  window.addEventListener(
    "pagehide",
    () => {
      if (heroLoopInterval) window.clearInterval(heroLoopInterval);
    },
    { once: true }
  );

  gsap.set(nav, {
    opacity: 1,
    pointerEvents: "auto",
  });

  if (!motionQuery.matches && heroSection && heroVideo) {
    const heroParallax = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: 0.65,
        onUpdate: (self) => {
          heroVideo.setAttribute("data-parallax-progress", self.progress.toFixed(3));
        },
      },
    });

    heroParallax.to(heroVideo, { y: 72, duration: 1, ease: "none" }, 0);
    heroParallax.to(heroVideo, { opacity: 0, duration: 0.28, ease: "none" }, 0.12);

    if (header) {
      heroParallax.to(header, { y: -80, opacity: 0.12, duration: 0.72, ease: "none" }, 0);
    }

    if (heroCard) {
      heroParallax.fromTo(
        heroCard,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.38, ease: "none" },
        0.16
      );
      heroParallax.to(heroCard, { opacity: 0, duration: 0.2, ease: "none" }, 0.68);
    }

    if (videoSectionShell) {
      heroParallax.fromTo(
        videoSectionShell,
        { y: 56, scale: 0.985 },
        { y: 0, scale: 1, duration: 0.62, ease: "none" },
        0.3
      );
    }
  } else if (heroCard) {
    gsap.set(heroCard, { opacity: 0 });
  }

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
  setActiveMegaMenu("");

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

  megaMenuOverlay?.addEventListener("click", (event) => {
    if (event.target.closest(".mega-menu-shell")) return;
    setNavOpen(false);
    setActiveMegaMenu("");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setNavOpen(false);
    setActiveMegaMenu("");
  });

  const featureInstances = Array.from(featureSections).map((section) => {
    const steps = Array.from(section.querySelectorAll(".feature-step"));
    let trigger = null;

    const setActiveStep = (progress) => {
      const stepIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length));
      steps.forEach((step, index) => {
        step.classList.toggle("is-active", index === stepIndex);
      });
    };

    trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 72%",
      end: "bottom 38%",
      scrub: 0.35,
      onUpdate: (self) => {
        setActiveStep(clamp(self.progress, 0, 0.9999));
      },
    });

    return { refresh: () => trigger?.refresh() };
  });

  const loadIframe = (iframe) => {
    if (!iframe.dataset.src || iframe.src) return;
    iframe.src = iframe.dataset.src;
  };

  if (lazyIframes.length) {
    const iframeObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadIframe(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "900px 0px", threshold: 0.01 }
    );

    lazyIframes.forEach((iframe) => iframeObserver.observe(iframe));
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });

  const setFaqState = (item, isOpen) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;

    item.classList.toggle("is-open", isOpen);
    question.setAttribute("aria-expanded", String(isOpen));
    answer.hidden = !isOpen;
  };

  faqItems.forEach((item, index) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;

    const answerId = answer.id || `faq-answer-${index + 1}`;
    answer.id = answerId;
    question.setAttribute("aria-controls", answerId);

    setFaqState(item, item.classList.contains("is-open"));

    question.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");

      faqItems.forEach((faqItem) => {
        setFaqState(faqItem, false);
      });

      if (willOpen) {
        setFaqState(item, true);
      }
    });
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

    window.open(`https://wa.me/529993577687?text=${encodeURIComponent(message)}`, "_blank");
  });

  window.addEventListener("resize", () => {
    syncHeroVideoScale();
    featureInstances.forEach((instance) => instance.refresh());
    ScrollTrigger.refresh();
  });

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });
});

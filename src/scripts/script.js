import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();
  lenis.scrollTo(0, { immediate: true, force: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const nav = document.querySelector("nav");
  const scrollCue = document.querySelector("[data-scroll-cue]");
  const heroSection = document.querySelector(".hero");
  const heroVideo = document.querySelector(".hero-video");
  const heroIframe = document.querySelector(".hero-video iframe");
  const heroContent = document.querySelector(".hero-content");
  const sectorSelectorInner = document.querySelector(".sector-selector-inner");
  const siteNav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const megaMenuClose = document.querySelector(".mega-menu-close");
  const sectorOptions = document.querySelectorAll(".sector-option");
  const dynamicSections = document.querySelector("#dynamic-sections");
  const revealElements = document.querySelectorAll(".reveal, .reveal-section");
  const featureSections = document.querySelectorAll(".feature-section");
  const articleCarousel = document.querySelector(".article-carousel");
  const faqItems = document.querySelectorAll(".faq-item");
  const faqQuestions = document.querySelectorAll(".faq-question");
  const precisionVideo = document.querySelector(".precision-video");
  const placeholderLinks = document.querySelectorAll('a[href="#"]');
  const megaMenuTriggers = document.querySelectorAll(".nav-link.has-mega-menu");
  const megaMenus = document.querySelectorAll(".mega-menu");
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const sectionOrderMap = {
    restaurante: ["2", "1", "3", "4"],
    agropecuario: ["3", "1", "2", "4"],
    hoteleria: ["1", "2", "3", "4"],
    otro: ["4", "2", "3", "1"],
  };

  const defaultSectionOrder = ["1", "2", "3", "4"];

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let scrollCueHidden = false;
  let scrollCueTimeline = null;

  const hideScrollCue = () => {
    if (!scrollCue || scrollCueHidden) return;

    scrollCueHidden = true;
    scrollCueTimeline?.kill();

    gsap.to(scrollCue, {
      autoAlpha: 0,
      y: 8,
      duration: 0.28,
      ease: "power2.out",
      overwrite: true,
    });
  };

  if (scrollCue) {
    gsap.set(scrollCue, { autoAlpha: 1, y: 0 });

    if (!motionQuery.matches) {
      scrollCueTimeline = gsap
        .timeline({ repeat: -1, repeatDelay: 0.25 })
        .fromTo(
          scrollCue.querySelector(".scroll-cue-wheel"),
          { y: 0, autoAlpha: 1 },
          { y: 9, autoAlpha: 0.22, duration: 0.82, ease: "power1.inOut" },
          0
        )
        .fromTo(
          scrollCue.querySelector(".scroll-cue-chevron"),
          { y: -2, autoAlpha: 0.45 },
          { y: 5, autoAlpha: 1, duration: 0.82, ease: "power1.inOut" },
          0
        )
        .to(scrollCue, { y: 4, duration: 0.82, ease: "sine.inOut" }, 0)
        .to(scrollCue, { y: 0, duration: 0.62, ease: "sine.inOut" });
    }

    window.addEventListener("wheel", hideScrollCue, { passive: true, once: true });
    window.addEventListener("touchmove", hideScrollCue, { passive: true, once: true });
    const handleScrollCueKeydown = (event) => {
      if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(event.key)) {
        return;
      }

      hideScrollCue();
      window.removeEventListener("keydown", handleScrollCueKeydown);
    };

    window.addEventListener("keydown", handleScrollCueKeydown);
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 2) hideScrollCue();
      },
      { passive: true }
    );
  }

  let heroCriticalReady = false;
  let heroIframeLoadCount = 0;

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

  const heroLoopEnd = 5;
  const heroPlaybackRate = 0.5;
  let heroPlayer = null;
  let heroLoopInterval = null;
  let heroLoopInProgress = false;
  window.__cycHeroLoopCount = 0;
  heroVideo?.setAttribute("data-player-ready", "false");
  heroVideo?.setAttribute("data-loop-count", "0");

  const restartHeroLoop = () => {
    if (!heroPlayer || heroLoopInProgress) return;

    heroLoopInProgress = true;
    heroVideo?.classList.add("is-loop-transition");

    window.setTimeout(() => {
      heroPlayer.seekTo(0, true);
      heroPlayer.setPlaybackRate(heroPlaybackRate);
      heroPlayer.playVideo();
      window.__cycHeroLoopCount += 1;
      heroVideo?.setAttribute("data-loop-count", String(window.__cycHeroLoopCount));

      window.setTimeout(() => {
        heroVideo?.classList.remove("is-loop-transition");
        heroLoopInProgress = false;
      }, 180);
    }, 420);
  };

  const createHeroPlayer = () => {
    if (!heroIframe || heroPlayer || !window.YT?.Player) return;

    heroPlayer = new window.YT.Player("hero-background-player", {
      events: {
        onReady: (event) => {
          heroPlayer = event.target;
          window.__cycHeroPlayer = heroPlayer;
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
    const parallaxTimeline = gsap.timeline({
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

    parallaxTimeline.to(heroVideo, { y: 72, ease: "none" }, 0);
    parallaxTimeline.to(heroVideo, { opacity: 0, duration: 0.28, ease: "none" }, 0.12);

    if (heroContent) {
      parallaxTimeline.to(heroContent, { y: -64, opacity: 0.32, ease: "none" }, 0);
    }

    if (sectorSelectorInner) {
      parallaxTimeline.fromTo(
        sectorSelectorInner,
        { y: 48, scale: 0.985 },
        { y: 0, scale: 1, ease: "none" },
        0.28
      );
    }
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

  const featureInstances = Array.from(featureSections).map((section) => {
    const video = section.querySelector(".feature-video");
    const steps = Array.from(section.querySelectorAll(".feature-step"));
    const videoSrc = section.dataset.videoSrc;
    const videoStart = Number(section.dataset.videoStart || 0);
    let initialized = false;
    let startApplied = false;
    let trigger = null;

    const setActiveStep = (progress) => {
      const stepIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length));
      steps.forEach((step, index) => {
        step.classList.toggle("is-active", index === stepIndex);
      });
    };

    const init = () => {
      if (initialized) return;
      initialized = true;

      if (videoSrc && !video.currentSrc) {
        video.src = videoSrc;
        video.load();
      }

      const applyVideoStart = () => {
        if (!video || startApplied || !Number.isFinite(videoStart) || videoStart <= 0) return;
        if (video.readyState < 1 || !Number.isFinite(video.duration) || video.duration <= 0) return;
        video.currentTime = Math.min(videoStart, Math.max(video.duration - 0.1, 0));
        startApplied = true;
      };

      applyVideoStart();
      video?.addEventListener("loadedmetadata", applyVideoStart, { once: true });
      setActiveStep(0);

      const videoBounds = video?.getBoundingClientRect();
      if (videoBounds && videoBounds.top < window.innerHeight && videoBounds.bottom > 0) {
        video.play().catch(() => {});
      }

      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 72%",
        end: "bottom 38%",
        scrub: 0.35,
        onUpdate: (self) => {
          const progress = clamp(self.progress, 0, 0.9999);
          setActiveStep(progress);
        },
      });
    };

    return {
      section,
      video,
      init,
      play: () => {
        if (!video?.src && !video?.currentSrc) return;
        video.play().catch(() => {});
      },
      pause: () => {
        video?.pause();
      },
      refresh: () => trigger?.refresh(),
    };
  });

  const featureObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const instance = featureInstances.find((item) => item.section === entry.target);
        if (!instance) return;
        instance.init();
        featureObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "900px 0px" }
  );

  featureInstances.forEach((instance) => {
    featureObserver.observe(instance.section);
  });

  const featureVideoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const instance = featureInstances.find((item) => item.video === entry.target);
        if (!instance) return;

        if (entry.isIntersecting) {
          instance.init();
          instance.play();
        } else {
          instance.pause();
        }
      });
    },
    { threshold: 0.35, rootMargin: "220px 0px" }
  );

  featureInstances.forEach((instance) => {
    if (instance.video) {
      featureVideoObserver.observe(instance.video);
    }
  });

  if (precisionVideo) {
    let precisionVideoLoaded = false;

    const loadPrecisionVideo = () => {
      if (precisionVideoLoaded) return;
      const src = precisionVideo.dataset.src;
      if (!src) return;

      precisionVideo.src = src;
      precisionVideo.load();
      precisionVideoLoaded = true;
    };

    const precisionVideoObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadPrecisionVideo();
          precisionVideo.play().catch(() => {});
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35, rootMargin: "150px 0px" }
    );

    precisionVideoObserver.observe(precisionVideo);
  }

  const reorderSections = (sector) => {
    if (!dynamicSections) return;

    const sectionOrder = sectionOrderMap[sector] || defaultSectionOrder;

    const sectionsById = Array.from(
      dynamicSections.querySelectorAll("[data-section-id]")
    ).reduce((acc, section) => {
      acc[section.dataset.sectionId] = section;
      return acc;
    }, {});

    sectionOrder.forEach((sectionId) => {
      const section = sectionsById[sectionId];
      if (section) {
        section.classList.remove("is-visible");
        const sectionContainer =
          section.parentElement?.classList.contains("pin-spacer") &&
          section.parentElement.parentElement === dynamicSections
            ? section.parentElement
            : section;

        dynamicSections.appendChild(sectionContainer);
      }
    });

    requestAnimationFrame(() => {
      sectionOrder.forEach((sectionId, index) => {
        const section = sectionsById[sectionId];
        if (!section) return;

        section.style.transitionDelay = `${index * 90}ms`;
        requestAnimationFrame(() => {
          section.classList.add("is-visible");
        });
      });

      ScrollTrigger.refresh();
    });
  };

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
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

  sectorOptions.forEach((option) => {
    option.addEventListener("click", () => {
      sectorOptions.forEach((button) => {
        button.classList.toggle("is-active", button === option);
      });

      reorderSections(option.dataset.sector);
    });
  });

  sectorOptions.forEach((button) => {
    button.classList.remove("is-active");
  });

  reorderSections();

  if (articleCarousel) {
    const track = articleCarousel.querySelector(".article-carousel-track");
    const cards = Array.from(articleCarousel.querySelectorAll(".article-card"));
    const prevButton = articleCarousel.querySelector(".article-carousel-button.prev");
    const nextButton = articleCarousel.querySelector(".article-carousel-button.next");
    const currentLabel = articleCarousel.querySelector(".article-carousel-current");
    const totalLabel = articleCarousel.querySelector(".article-carousel-total");
    let currentIndex = 0;

    const cardsPerView = () => {
      if (window.innerWidth <= 720) return 1;
      if (window.innerWidth <= 1100) return 2;
      return 4;
    };

    const totalPages = () => Math.max(1, cards.length - cardsPerView() + 1);

    const formatSlideNumber = (value) => value.toString().padStart(2, "0");

    const updateCarousel = () => {
      const visibleCards = cardsPerView();
      const maxIndex = Math.max(0, cards.length - visibleCards);
      currentIndex = clamp(currentIndex, 0, maxIndex);

      const firstCard = cards[0];
      if (!track || !firstCard) return;

      const cardStyles = window.getComputedStyle(track);
      const gap = parseFloat(cardStyles.columnGap || cardStyles.gap || "0");
      const offset = currentIndex * (firstCard.offsetWidth + gap);

      track.style.transform = `translateX(-${offset}px)`;

      if (currentLabel) {
        currentLabel.textContent = formatSlideNumber(currentIndex + 1);
      }

      if (totalLabel) {
        totalLabel.textContent = formatSlideNumber(totalPages());
      }

      if (prevButton) prevButton.disabled = currentIndex === 0;
      if (nextButton) nextButton.disabled = currentIndex >= maxIndex;
    };

    prevButton?.addEventListener("click", () => {
      currentIndex -= 1;
      updateCarousel();
    });

    nextButton?.addEventListener("click", () => {
      currentIndex += 1;
      updateCarousel();
    });

    updateCarousel();
    window.addEventListener("resize", updateCarousel);
  }

  if (faqQuestions.length) {
    faqQuestions.forEach((question) => {
      if (question.dataset.faqBound === "true") return;
      question.dataset.faqBound = "true";

      question.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const item = question.closest(".faq-item");
        if (!item) return;

        const answer = item.querySelector(".faq-answer");
        const willOpen = !item.classList.contains("is-open");

        faqItems.forEach((otherItem) => {
          const otherQuestion = otherItem.querySelector(".faq-question");
          const otherAnswer = otherItem.querySelector(".faq-answer");

          otherItem.classList.remove("is-open");
          otherQuestion?.setAttribute("aria-expanded", "false");
          if (otherAnswer) {
            otherAnswer.hidden = true;
          }
        });

        if (willOpen) {
          item.classList.add("is-open");
          question.setAttribute("aria-expanded", "true");
          if (answer) {
            answer.hidden = false;
          }

          requestAnimationFrame(() => {
            item.scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
            ScrollTrigger.refresh();
          });
        } else {
          ScrollTrigger.refresh();
        }
      });
    });
  }

  placeholderLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
    });
  });

  window.addEventListener("resize", () => {
    ScrollTrigger.refresh();
  });

  window.addEventListener("load", () => {
    lenis.scrollTo(0, { immediate: true, force: true });
    ScrollTrigger.refresh();
  });
});

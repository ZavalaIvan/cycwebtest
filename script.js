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
  const header = document.querySelector(".header");
  const heroImg = document.querySelector(".hero-img");
  const heroCanvas = document.querySelector(".hero canvas");
  const heroContext = heroCanvas.getContext("2d");
  const siteNav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const megaMenuClose = document.querySelector(".mega-menu-close");
  const sectorOptions = document.querySelectorAll(".sector-option");
  const dynamicSections = document.querySelector("#dynamic-sections");
  const revealElements = document.querySelectorAll(".reveal, .reveal-section");
  const featureSections = document.querySelectorAll(".feature-section");
  const articleCarousel = document.querySelector(".article-carousel");
  const megaMenuTriggers = document.querySelectorAll(".nav-link.has-mega-menu");
  const megaMenus = document.querySelectorAll(".mega-menu");
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const sectionOrderMap = {
    restaurante: ["1", "2", "3", "4"],
    agropecuario: ["2", "4", "1", "3"],
    hoteleria: ["3", "1", "4", "2"],
    otro: ["4", "2", "3", "1"],
  };

  const heroFrameStart = 29;
  const heroFrameEnd = 207;
  const heroFrameCount = heroFrameEnd - heroFrameStart + 1;
  const heroImages = new Array(heroFrameCount);
  const heroState = { frame: 0 };
  let heroTriggerReady = false;

  const drawCoverImage = (context, image, width, height) => {
    context.clearRect(0, 0, width, height);

    if (!image || !image.complete || image.naturalWidth <= 0) return;

    const imageAspect = image.naturalWidth / image.naturalHeight;
    const canvasAspect = width / height;

    let drawWidth;
    let drawHeight;
    let drawX;
    let drawY;

    if (imageAspect > canvasAspect) {
      drawHeight = height;
      drawWidth = drawHeight * imageAspect;
      drawX = (width - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = width;
      drawHeight = drawWidth / imageAspect;
      drawX = 0;
      drawY = (height - drawHeight) / 2;
    }

    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  };

  const resizeCanvas = (canvas, context) => {
    const pixelRatio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || canvas.offsetWidth || window.innerWidth;
    const height = canvas.clientHeight || canvas.offsetHeight || window.innerHeight;

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  resizeCanvas(heroCanvas, heroContext);

  const currentHeroFrame = (index) =>
    `/frames/frame_${(heroFrameStart + index).toString().padStart(4, "0")}.jpg`;

  const renderHero = () => {
    drawCoverImage(
      heroContext,
      heroImages[heroState.frame],
      heroCanvas.clientWidth || window.innerWidth,
      heroCanvas.clientHeight || window.innerHeight
    );
  };

  const loadHeroFrame = (index) => {
    const image = new Image();
    image.onload = () => {
      if (index === heroState.frame || index === 0) {
        renderHero();
      }
    };
    image.src = currentHeroFrame(index);
    heroImages[index] = image;
  };

  gsap.set(heroImg, {
    transform: "translateY(48px) scale(0.96)",
    opacity: 0,
    pointerEvents: "none",
  });

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

  const setupHeroScrollTrigger = () => {
    if (heroTriggerReady) return;
    heroTriggerReady = true;

    ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: `+=${window.innerHeight * 7}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const animationProgress = Math.min(progress / 0.9, 1);
        const targetFrame = Math.round(animationProgress * (heroFrameCount - 1));
        heroState.frame = targetFrame;
        renderHero();

        const navVisible = progress >= 0.84 || siteNav?.classList.contains("is-open");
        gsap.set(nav, {
          opacity: navVisible ? 1 : 0,
          pointerEvents: navVisible ? "auto" : "none",
        });

        if (progress <= 0.25) {
          const zProgress = progress / 0.25;
          const translateZ = zProgress * -500;
          let opacity = 1;

          if (progress >= 0.2) {
            const fadeProgress = Math.min((progress - 0.2) / 0.05, 1);
            opacity = 1 - fadeProgress;
          }

          gsap.set(header, {
            transform: `translate(-50%, -50%) translateZ(${translateZ}px)`,
            opacity,
          });
        } else {
          gsap.set(header, { opacity: 0 });
        }

        const videoProgress = clamp((progress - 0.58) / 0.26, 0, 1);
        const videoTranslateY = 48 - videoProgress * 48;
        const videoScale = 0.96 + videoProgress * 0.04;

        gsap.set(heroImg, {
          transform: `translateY(${videoTranslateY}px) scale(${videoScale})`,
          opacity: videoProgress,
          pointerEvents: videoProgress > 0.98 ? "auto" : "none",
        });
      },
    });
  };

  loadHeroFrame(0);
  for (let i = 1; i < heroFrameCount; i++) {
    loadHeroFrame(i);
  }
  renderHero();
  setupHeroScrollTrigger();

  const featureInstances = Array.from(featureSections).map((section) => {
    const video = section.querySelector(".feature-video");
    const steps = Array.from(section.querySelectorAll(".feature-step"));
    const videoSrc = section.dataset.videoSrc;
    let initialized = false;
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
      setActiveStep(0);

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
    { rootMargin: "300px 0px" }
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
          instance.play();
        } else {
          instance.pause();
        }
      });
    },
    { threshold: 0.6 }
  );

  featureInstances.forEach((instance) => {
    if (instance.video) {
      featureVideoObserver.observe(instance.video);
    }
  });

  const reorderSections = (sector) => {
    if (!dynamicSections || !sectionOrderMap[sector]) return;

    const sectionsById = Array.from(
      dynamicSections.querySelectorAll("[data-section-id]")
    ).reduce((acc, section) => {
      acc[section.dataset.sectionId] = section;
      return acc;
    }, {});

    sectionOrderMap[sector].forEach((sectionId) => {
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
      sectionOrderMap[sector].forEach((sectionId, index) => {
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

  reorderSections("restaurante");

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
      return 3;
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

  window.addEventListener("resize", () => {
    resizeCanvas(heroCanvas, heroContext);
    renderHero();
    ScrollTrigger.refresh();
  });

  window.addEventListener("load", () => {
    lenis.scrollTo(0, { immediate: true, force: true });
    ScrollTrigger.refresh();
  });
});

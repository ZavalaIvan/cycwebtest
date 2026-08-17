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
  const heroCanvas = document.querySelector(".hero canvas");
  const heroSection = document.querySelector(".hero");
  const heroVideo = document.querySelector(".hero-video");
  const heroIframe = document.querySelector("#greendrone-hero-player");
  const heroTitleContent = document.querySelector(".hero-title-content");
  const precisionHero = document.querySelector(".precision-hero");
  const lazyVideos = document.querySelectorAll("video[data-src]");
  const protectedTags = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON"]);

  document.querySelectorAll("img").forEach((image) => {
    image.setAttribute("draggable", "false");
  });

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  document.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  document.addEventListener("copy", (event) => {
    if (protectedTags.has(event.target.tagName)) return;
    event.preventDefault();
  });

  document.addEventListener("cut", (event) => {
    if (protectedTags.has(event.target.tagName)) return;
    event.preventDefault();
  });

  const heroContext = heroCanvas?.getContext("2d");
  const heroFrameDirectory = "/greendronevid";
  const heroFramePrefix = "greendronevid";
  const heroFrameExtension = "jpg";
  const heroFrameStart = 0;
  const heroFrameEnd = 143;
  const heroFrameCount = heroFrameEnd - heroFrameStart + 1;
  const heroImages = new Array(heroFrameCount);
  const heroFrameStatus = new Array(heroFrameCount).fill("idle");
  const heroFrameQueue = [];
  const heroState = { frame: 0 };
  let heroActiveLoads = 0;
  let heroCriticalReady = false;
  let lastRenderedHeroFrame = -1;
  let heroPlayer = null;

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const heroMaxConcurrentLoads = connection?.saveData
    ? 1
    : /2g/.test(connection?.effectiveType || "")
      ? 2
      : 4;
  const heroPreloadAhead = connection?.saveData ? 2 : 12;
  const heroPreloadBehind = connection?.saveData ? 1 : 4;
  const heroInitialBuffer = connection?.saveData ? 1 : 4;
  const heroAnchorSpacing = connection?.saveData ? 48 : 20;
  const heroFastScrollThreshold = connection?.saveData ? 14 : 20;
  const heroFastScrollBoost = connection?.saveData ? 8 : 20;

  const markHeroCriticalReady = () => {
    if (heroCriticalReady) return;
    heroCriticalReady = true;
    window.__cycCriticalReady = true;
    window.dispatchEvent(new CustomEvent("cyc:critical-ready"));
  };

  const syncHeroVideoScale = () => {
    if (!heroIframe) return;
    const scale = Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
    heroIframe.style.setProperty("--hero-video-scale", String(scale));
  };

  syncHeroVideoScale();
  heroVideo?.setAttribute("data-player-ready", "false");
  heroVideo?.setAttribute("data-requested-quality", "hd1080");
  heroVideo?.setAttribute("data-start-time", "84");

  heroIframe?.addEventListener("load", markHeroCriticalReady, { once: true });
  window.setTimeout(markHeroCriticalReady, 1800);

  const createHeroPlayer = () => {
    if (!heroIframe || heroPlayer || !window.YT?.Player) return;

    heroPlayer = new window.YT.Player("greendrone-hero-player", {
      events: {
        onReady: (event) => {
          heroPlayer = event.target;
          heroPlayer.mute();
          heroPlayer.setPlaybackQuality?.("hd1080");
          heroPlayer.seekTo(84, true);
          heroPlayer.playVideo();
          heroVideo?.setAttribute("data-player-ready", "true");
          markHeroCriticalReady();
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            heroPlayer.setPlaybackQuality?.("hd1080");
          }

          if (event.data === window.YT.PlayerState.ENDED) {
            heroPlayer.seekTo(84, true);
            heroPlayer.playVideo();
          }
        },
        onPlaybackQualityChange: (event) => {
          heroVideo?.setAttribute("data-quality", event.data || "auto");
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

  const drawCoverImage = (context, image, width, height) => {
    if (!context || !image || !image.complete || image.naturalWidth <= 0) return false;

    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return true;
  };

  const resizeCanvas = (canvas, context) => {
    if (!canvas || !context) return;
    const pixelRatio = window.devicePixelRatio || 1;
    const width = 1920;
    const height = 1080;

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
  };

  const currentHeroFrame = (index) =>
    `${heroFrameDirectory}/${heroFramePrefix}${(heroFrameStart + index)
      .toString()
      .padStart(3, "0")}.${heroFrameExtension}`;

  const renderHero = () => {
    if (!heroCanvas || !heroContext) return false;
    let frameToRender = heroState.frame;

    if (heroFrameStatus[frameToRender] !== "loaded") {
      for (let offset = 1; offset < heroFrameCount; offset++) {
        const backwardIndex = frameToRender - offset;
        const forwardIndex = frameToRender + offset;

        if (backwardIndex >= 0 && heroFrameStatus[backwardIndex] === "loaded") {
          frameToRender = backwardIndex;
          break;
        }

        if (forwardIndex < heroFrameCount && heroFrameStatus[forwardIndex] === "loaded") {
          frameToRender = forwardIndex;
          break;
        }
      }
    }

    if (heroFrameStatus[frameToRender] !== "loaded" && lastRenderedHeroFrame >= 0) {
      frameToRender = lastRenderedHeroFrame;
    }

    if (heroFrameStatus[frameToRender] !== "loaded") return false;

    const didRender = drawCoverImage(heroContext, heroImages[frameToRender], 1920, 1080);

    if (didRender) {
      lastRenderedHeroFrame = frameToRender;
    }

    return didRender;
  };

  const processHeroQueue = () => {
    while (heroActiveLoads < heroMaxConcurrentLoads && heroFrameQueue.length > 0) {
      const index = heroFrameQueue.shift();

      if (heroFrameStatus[index] !== "queued") continue;

      heroActiveLoads += 1;
      heroFrameStatus[index] = "loading";

      const image = new Image();
      image.decoding = "async";
      image.fetchPriority = index === heroState.frame || index === 0 ? "high" : "low";
      image.onload = () => {
        heroFrameStatus[index] = "loaded";
        heroActiveLoads -= 1;

        if (index === heroState.frame || index === 0 || lastRenderedHeroFrame < 0) {
          renderHero();
        }

        if (
          !heroCriticalReady &&
          heroFrameStatus[0] === "loaded" &&
          heroFrameStatus.slice(0, heroInitialBuffer + 1).filter((status) => status === "loaded")
            .length >= heroInitialBuffer
        ) {
          markHeroCriticalReady();
        }

        processHeroQueue();
      };
      image.onerror = () => {
        heroFrameStatus[index] = "idle";
        heroActiveLoads -= 1;
        processHeroQueue();
      };
      image.src = currentHeroFrame(index);
      heroImages[index] = image;
    }
  };

  const queueHeroFrame = (index, priority = false) => {
    if (index < 0 || index >= heroFrameCount) return;
    if (priority && heroFrameStatus[index] === "queued") {
      const queuedIndex = heroFrameQueue.indexOf(index);
      if (queuedIndex > -1) {
        heroFrameQueue.splice(queuedIndex, 1);
        heroFrameQueue.unshift(index);
      }
      processHeroQueue();
      return;
    }

    if (heroFrameStatus[index] !== "idle") return;

    heroFrameStatus[index] = "queued";

    if (priority) {
      heroFrameQueue.unshift(index);
    } else {
      heroFrameQueue.push(index);
    }

    processHeroQueue();
  };

  const primeHeroFrames = (centerIndex) => {
    queueHeroFrame(centerIndex, true);

    for (let offset = 1; offset <= heroPreloadAhead; offset++) {
      queueHeroFrame(centerIndex + offset);
    }

    for (let offset = 1; offset <= heroPreloadBehind; offset++) {
      queueHeroFrame(centerIndex - offset);
    }
  };

  const primeHeroAnchors = () => {
    for (let index = 0; index < heroFrameCount; index += heroAnchorSpacing) {
      queueHeroFrame(index);
    }

    queueHeroFrame(heroFrameCount - 1);
  };

  const boostHeroFramesForFastScroll = (fromIndex, toIndex) => {
    const direction = toIndex >= fromIndex ? 1 : -1;
    const distance = Math.abs(toIndex - fromIndex);
    const step = Math.max(1, Math.floor(distance / 6));

    queueHeroFrame(toIndex, true);

    for (let offset = 1; offset <= heroFastScrollBoost; offset++) {
      queueHeroFrame(toIndex + offset * direction);
      queueHeroFrame(toIndex - offset * direction);
    }

    for (
      let index = fromIndex;
      direction > 0 ? index <= toIndex : index >= toIndex;
      index += step * direction
    ) {
      queueHeroFrame(index);
    }
  };

  const warmInitialHeroFrames = () => {
    queueHeroFrame(0, true);

    for (let index = 1; index <= heroInitialBuffer; index++) {
      queueHeroFrame(index, true);
    }

    primeHeroFrames(0);

    window.setTimeout(() => {
      if (heroFrameStatus[0] === "loaded") {
        markHeroCriticalReady();
      }
    }, 2200);

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(primeHeroAnchors);
      return;
    }

    window.setTimeout(primeHeroAnchors, 500);
  };

  const setHeroFrame = (index) => {
    const previousFrame = heroState.frame;
    heroState.frame = index;
    primeHeroFrames(index);

    if (Math.abs(index - previousFrame) >= heroFastScrollThreshold) {
      boostHeroFramesForFastScroll(previousFrame, index);
    }

    renderHero();
  };

  if (heroCanvas && heroContext) {
    resizeCanvas(heroCanvas, heroContext);
    warmInitialHeroFrames();
    renderHero();
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

  document.querySelector(".mega-menu-overlay")?.addEventListener("click", (event) => {
    if (event.target.closest(".mega-menu-shell")) return;
    setNavOpen(false);
    setActiveMegaMenu("");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setNavOpen(false);
    setActiveMegaMenu("");
  });

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && heroSection && heroVideo) {
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
    heroParallax.to(heroVideo, { opacity: 0, duration: 0.3, ease: "none" }, 0.12);

    if (heroTitleContent) {
      heroParallax.to(heroTitleContent, { y: -64, opacity: 0.08, duration: 0.72, ease: "none" }, 0);
    }

    if (precisionHero) {
      heroParallax.fromTo(
        precisionHero,
        { y: 64 },
        { y: 0, duration: 0.66, ease: "none" },
        0.26
      );
    }
  }

  const loadVideo = (video) => {
    if (!video.dataset.src || video.currentSrc || video.src) return;
    video.src = video.dataset.src;
    video.load();
  };

  if (lazyVideos.length) {
    const lazyVideoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            loadVideo(video);
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.35, rootMargin: "420px 0px" }
    );

    lazyVideos.forEach((video) => lazyVideoObserver.observe(video));
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
      "Hola, quiero solicitar un diagnostico de Green Drone.",
      `Nombre: ${data.get("nombre") || ""}`,
      `Empresa: ${data.get("empresa") || ""}`,
      `Ciudad: ${data.get("ciudad") || ""}`,
      `Necesidad: ${data.get("problema") || ""}`,
      `Telefono: ${data.get("telefono") || ""}`,
    ].join("\n");

    window.open(`https://wa.me/529811686386?text=${encodeURIComponent(message)}`, "_blank");
  });

  window.addEventListener("resize", () => {
    syncHeroVideoScale();
    resizeCanvas(heroCanvas, heroContext);
    renderHero();
    ScrollTrigger.refresh();
  });

  window.addEventListener("load", () => {
    renderHero();
    ScrollTrigger.refresh();
  });
});

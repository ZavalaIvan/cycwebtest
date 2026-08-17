document.addEventListener("DOMContentLoaded", () => {
  const siteNav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const megaMenuClose = document.querySelector(".mega-menu-close");
  const megaMenuOverlay = document.querySelector(".mega-menu-overlay");
  const revealItems = document.querySelectorAll(".reveal");

  const serviceOptions = document.querySelectorAll(".service-option");
  const serviceSelect = document.querySelector("#service-select");
  const serviceLabelTargets = document.querySelectorAll("[data-service-label]");
  const whatsappLink = document.querySelector("[data-whatsapp-link]");
  const whatsappDisplay = document.querySelector("[data-whatsapp-display]");
  const phoneLink = document.querySelector("[data-phone-link]");
  const phoneDisplay = document.querySelector("[data-phone-display]");
  const emailLink = document.querySelector("[data-email-link]");
  const emailDisplay = document.querySelector("[data-email-display]");
  const floatingWhatsapp = document.querySelector("#floating-whatsapp");
  const messageField = document.querySelector("#project-message");
  const contactForm = document.querySelector("#contact-form");

  const services = {
    "blue-drop": {
      whatsapp: "+52 999 357 7687",
      phone: "+52 999 357 7687",
      email: "bluedrop@cycdelsureste.com",
      label: "Blue Drop",
      context: "Te pondremos en contacto con un especialista de Blue Drop.",
      placeholder:
        "Describe brevemente el problema: lago, tubería, trampa de grasa, mal olor, agua contaminada o sistema afectado...",
    },
    "green-drone": {
      whatsapp: "+52 981 168 6386",
      phone: "+52 981 168 6386",
      email: "greendrone@cycdelsureste.com",
      label: "Green Drone",
      context: "Te pondremos en contacto con un especialista de Green Drone.",
      placeholder:
        "Describe brevemente el cultivo, superficie, ubicación, tipo de aplicación o necesidad de monitoreo...",
    },
    integral: {
      whatsapp: "+52 999 357 7687",
      phone: "+52 999 912 7589",
      email: "administracion@cycdelsureste.com",
      label: "Solución integral",
      context: "Te ayudaremos a canalizar tu proyecto con el equipo adecuado.",
      placeholder:
        "Describe brevemente el proyecto, ubicación, objetivo y qué tipo de solución necesitas...",
    },
  };

  const normalizePhone = (value) => value.replace(/[^\d]/g, "");

  const buildWhatsAppUrl = (phone, label) =>
    `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(
      `Hola, quiero información sobre ${label}.`
    )}`;

  const setNavOpen = (isOpen) => {
    siteNav?.classList.toggle("is-open", isOpen);
    navToggle?.setAttribute("aria-expanded", String(isOpen));
  };

  setNavOpen(false);

  navToggle?.addEventListener("click", () => {
    setNavOpen(!siteNav?.classList.contains("is-open"));
  });

  megaMenuClose?.addEventListener("click", () => {
    setNavOpen(false);
  });

  megaMenuOverlay?.addEventListener("click", (event) => {
    if (event.target.closest(".mega-menu-shell")) return;
    setNavOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavOpen(false);
    }
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
      threshold: 0.16,
      rootMargin: "0px 0px -30px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const applyService = (serviceKey) => {
    const service = services[serviceKey];
    if (!service) return;

    serviceOptions.forEach((option) => {
      const isSelected = option.dataset.service === serviceKey;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-checked", String(isSelected));
    });

    serviceSelect.value = serviceKey;
    serviceLabelTargets.forEach((target) => {
      target.textContent = service.label;
    });

    if (whatsappLink) {
      whatsappLink.href = buildWhatsAppUrl(service.whatsapp, service.label);
    }

    if (whatsappDisplay) {
      whatsappDisplay.textContent = service.whatsapp;
    }

    if (phoneLink) {
      phoneLink.href = `tel:${normalizePhone(service.phone)}`;
      phoneLink.textContent = service.phone;
    }

    if (phoneDisplay) {
      phoneDisplay.textContent = service.phone;
    }

    if (emailLink) {
      emailLink.href = `mailto:${service.email}`;
      emailLink.textContent = service.email;
    }

    if (emailDisplay) {
      emailDisplay.textContent = "Atencion comercial y tecnica";
    }

    if (floatingWhatsapp) {
      floatingWhatsapp.href = buildWhatsAppUrl(service.whatsapp, service.label);
      floatingWhatsapp.setAttribute("aria-label", `Escribir por WhatsApp a ${service.label}`);
    }

    if (messageField) {
      messageField.placeholder = service.placeholder;
    }

    const dynamicContext = document.querySelector(".dynamic-context");
    if (dynamicContext) {
      dynamicContext.innerHTML = `${service.context.replace(
        service.label,
        `<span data-service-label>${service.label}</span>`
      )}`;
    }
  };

  serviceOptions.forEach((option) => {
    option.addEventListener("click", () => {
      applyService(option.dataset.service);
    });
  });

  serviceSelect?.addEventListener("change", () => {
    applyService(serviceSelect.value);
  });

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const serviceKey = serviceSelect?.value || "blue-drop";
    const service = services[serviceKey];
    const message = [
      `Hola, quiero información sobre ${service.label}.`,
      `Nombre completo: ${formData.get("nombre") || ""}`,
      `Teléfono / WhatsApp: ${formData.get("telefono") || ""}`,
      `Tipo de servicio: ${service.label}`,
      `Ciudad o zona: ${formData.get("ciudad") || ""}`,
      `Proyecto: ${formData.get("mensaje") || ""}`,
    ].join("\n");

    window.open(
      `https://wa.me/${normalizePhone(service.whatsapp)}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  });

  applyService("blue-drop");
});

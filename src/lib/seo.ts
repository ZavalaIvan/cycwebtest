export const SITE = {
  url: "https://cycdelsureste.com",
  name: "CyC del Sureste",
  legalName: "Consultores y Comercializadores del Sureste",
  description:
    "Soluciones especializadas en tratamiento de agua, mantenimiento tecnico, agricultura de precision y tecnologia ambiental en el sureste de Mexico.",
  defaultImage: "/lago-tratado-con-blue-drop.jpg",
  logo: "/cyc-logo.png",
  email: "administracion@cycdelsureste.com",
  phone: "+529999127589",
  address: {
    locality: "Merida",
    region: "Yucatan",
    country: "MX"
  }
};

export const absoluteUrl = (path = "/") => new URL(path, SITE.url).href;

export const organizationSchema = {
  "@type": "Organization",
  "@id": absoluteUrl("/#organization"),
  name: SITE.name,
  legalName: SITE.legalName,
  url: SITE.url,
  logo: absoluteUrl(SITE.logo),
  email: SITE.email,
  telephone: SITE.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE.address.locality,
    addressRegion: SITE.address.region,
    addressCountry: SITE.address.country
  },
  areaServed: [
    "Yucatan",
    "Campeche",
    "Quintana Roo",
    "Tabasco",
    "Chiapas",
    "Sureste de Mexico"
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+529993577687",
      contactType: "ventas Blue Drop",
      areaServed: "MX",
      availableLanguage: "es-MX"
    },
    {
      "@type": "ContactPoint",
      telephone: "+529811686386",
      contactType: "ventas Green Drone",
      areaServed: "MX",
      availableLanguage: "es-MX"
    }
  ]
};

export const websiteSchema = {
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  url: SITE.url,
  name: SITE.name,
  description: SITE.description,
  publisher: {
    "@id": absoluteUrl("/#organization")
  },
  inLanguage: "es-MX"
};

type WebPageSchemaOptions = {
  name: string;
  description: string;
  path: string;
  pageType?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
};

export const buildWebPageSchema = ({
  name,
  description,
  path,
  pageType = "WebPage"
}: WebPageSchemaOptions) => ({
  "@type": pageType,
  "@id": `${absoluteUrl(path)}#webpage`,
  url: absoluteUrl(path),
  name,
  description,
  isPartOf: {
    "@id": absoluteUrl("/#website")
  },
  about: {
    "@id": absoluteUrl("/#organization")
  },
  inLanguage: "es-MX"
});

type ServiceSchemaOptions = {
  name: string;
  description: string;
  path: string;
  serviceType: string;
};

export const buildServiceSchema = ({
  name,
  description,
  path,
  serviceType
}: ServiceSchemaOptions) => ({
  "@type": "Service",
  "@id": `${absoluteUrl(path)}#service`,
  name,
  description,
  serviceType,
  url: absoluteUrl(path),
  provider: {
    "@id": absoluteUrl("/#organization")
  },
  areaServed: [
    {
      "@type": "AdministrativeArea",
      name: "Sureste de Mexico"
    }
  ],
  inLanguage: "es-MX"
});

export const buildBreadcrumbSchema = (
  items: Array<{ name: string; path: string }>
) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path)
  }))
});

export const blogImageBySlug: Record<string, string> = {
  "que-ocasiona-el-mal-olor-en-lagos-y-estanques": "/img/lagos-sucios-mal-olor.webp",
  "como-recuperar-un-lago-con-mal-olor": "/lago-limpio-azul.webp",
  "causas-comunes-de-malos-olores-en-restaurantes-y-como-solucionarlos":
    "/img/mantenimiento-cañerias-obstruidas.webp",
  "blog-trampas-de-grasa": "/img/mal-olo-en-trampas-de-grasa.webp",
  "por-que-huele-mal-mi-restaurante-drenaje": "/img/mantenimiento-cañerias-obstruidas.webp"
};

export const sitemapPages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/bluedrop2.html", changefreq: "monthly", priority: "0.9" },
  { path: "/greendrone.html", changefreq: "monthly", priority: "0.9" },
  { path: "/contacto.html", changefreq: "monthly", priority: "0.8" },
  { path: "/blog/", changefreq: "weekly", priority: "0.8" }
];

# Separación entre migración y optimización

## Entra en migración

- Montar Astro como nueva base del proyecto.
- Migrar `index`, `bluedrop2`, `greendrone` y `contacto` a `src/pages`.
- Mantener los archivos legacy del blog publicados mientras siguen sin migrarse a colecciones.
- Reubicar scripts y estilos necesarios dentro del pipeline de Astro.
- Conservar HTML, clases, rutas y comportamiento actual tanto como sea posible.

## No entra todavía en optimización

- Reducir o reemplazar la técnica del hero por scroll.
- Rehacer diseño, jerarquía visual o copy.
- Comprimir masivamente assets o cambiar formatos.
- Reescribir lógica compleja de animación.
- Convertir el blog a Markdown/MDX o colecciones de contenido.
- Integrar todavía la tienda espejo con Mercado Libre.

## Regla de trabajo

Primero se replica en Astro. Después se mejora. Si algo visual cambia, debe ser por decisión explícita de optimización y no por la migración base.

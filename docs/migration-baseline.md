# Baseline de migración

## Objetivo

Congelar la referencia visual y funcional actual antes de optimizar o reorganizar el sitio.

## Alcance congelado

- Home actual basada en [index.html](/C:/Users/HP/Downloads/videoscroll/cg-adaline-scroll-animation/index.html)
- Landing Blue Drop basada en [bluedrop2.html](/C:/Users/HP/Downloads/videoscroll/cg-adaline-scroll-animation/bluedrop2.html)
- Landing Green Drone basada en [greendrone.html](/C:/Users/HP/Downloads/videoscroll/cg-adaline-scroll-animation/greendrone.html)
- Página de contacto basada en [contacto.html](/C:/Users/HP/Downloads/videoscroll/cg-adaline-scroll-animation/contacto.html)
- Blog actual como páginas sueltas:
- [blog-trampas-de-grasa.html](/C:/Users/HP/Downloads/videoscroll/cg-adaline-scroll-animation/blog-trampas-de-grasa.html)
- [causas-comunes-de-malos-olores-en-restaurantes-y-como-solucionarlos.html](/C:/Users/HP/Downloads/videoscroll/cg-adaline-scroll-animation/causas-comunes-de-malos-olores-en-restaurantes-y-como-solucionarlos.html)
- [como-recuperar-un-lago-con-mal-olor.html](/C:/Users/HP/Downloads/videoscroll/cg-adaline-scroll-animation/como-recuperar-un-lago-con-mal-olor.html)
- [por-que-huele-mal-mi-restaurante-drenaje.html](/C:/Users/HP/Downloads/videoscroll/cg-adaline-scroll-animation/por-que-huele-mal-mi-restaurante-drenaje.html)
- [que-ocasiona-el-mal-olor-en-lagos-y-estanques.html](/C:/Users/HP/Downloads/videoscroll/cg-adaline-scroll-animation/que-ocasiona-el-mal-olor-en-lagos-y-estanques.html)

## Referencia funcional obligatoria

- El hero de la home debe seguir sintiéndose como un video que avanza con el scroll.
- Los heroes de Blue Drop y Green Drone deben conservar su narrativa visual basada en secuencias de fotogramas.
- El loader, navegación y mega menú deben mantener el comportamiento actual antes de cualquier refactor.
- Las URLs actuales deben seguir funcionando durante la migración.

## Estado actual relevante

- El proyecto actual es multipágina y estático.
- Las páginas principales reutilizan bloques visuales similares pero con HTML repetido.
- El blog no está modelado como colección; hoy son páginas HTML independientes.
- El peso dominante del proyecto viene de medios y secuencias de imágenes en `public/`.

## Criterio para comparar la migración

- Misma estructura visual general.
- Misma narrativa y ritmo del scroll principal.
- Mismos enlaces críticos entre páginas.
- Mismo contenido visible en las páginas ya migradas.

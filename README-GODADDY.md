# Subida a GoDaddy

Este repositorio conserva el proyecto fuente en Astro para editarlo en GitHub con seguridad.
La publicacion en GoDaddy debe hacerse con el contenido generado en `dist`, no con `node_modules` ni con `dist.zip`.

## Opcion recomendada

Para este proyecto, lo mas seguro es subir la carpeta `dist` ya generada, porque GoDaddy solo tendra que servir archivos estaticos y no dependera de ejecutar Vite en produccion.

## Opcion recomendada con Git Version Control

Usa una rama limpia de despliegue llamada `godaddy-dist`. Esa rama debe contener:

- `.cpanel.yml`
- la carpeta `dist/` completa

No conviene usar `main` para GoDaddy, porque `main` contiene el proyecto fuente y assets de desarrollo; para publicar solo hace falta el build estatico.

En cPanel / GoDaddy:

1. Abre `Git Version Control`.
2. Clona este repositorio desde GitHub.
3. En `Manage`, selecciona la rama `godaddy-dist` como `Checked-Out Branch`.
4. En `Pull or Deploy`, usa `Update from Remote`.
5. Usa `Deploy HEAD Commit`.

El archivo `.cpanel.yml` copia el contenido de `dist/` hacia `$HOME/public_html/`. Si tu dominio usa otra carpeta publica, cambia `DEPLOYPATH` en `.cpanel.yml` antes de desplegar.

Para actualizar esta rama despues de regenerar `dist`, ejecuta:

```powershell
.\scripts\publish-godaddy-dist.ps1
```

Ese script reconstruye la rama `godaddy-dist` desde cero para que GitHub/GoDaddy solo reciban `.cpanel.yml` y `dist/`. Si algun dia necesitas hacer una primera subida pesada desde cero, puedes usar `-PushEachBatch` para partir el push en lotes menores.

## Antes de subir

1. Instala dependencias si hace falta:
   `npm install`
2. Genera el build:
   `npm run build`
3. Verifica que dentro de `dist` existan:
   - `index.html`
   - `contacto.html`
   - `bluedrop2.html`
   - `greendrone.html`
   - carpeta `blog`
   - urls legacy del blog como:
     - `blog-trampas-de-grasa.html`
     - `como-recuperar-un-lago-con-mal-olor.html`
   - carpeta `_astro`
   - imagenes y videos

## Subida por cPanel o Administrador de archivos

1. Entra a GoDaddy.
2. Abre `cPanel` del hosting.
3. Entra a `File Manager` o `Administrador de archivos`.
4. Abre la carpeta publica del dominio:
   normalmente es `public_html`.
5. Haz respaldo de lo anterior si ya habia un sitio publicado.
6. Borra el contenido anterior del sitio solo si ya confirmaste el respaldo.
7. Sube todo el contenido interno de `dist` a `public_html`.
   No subas la carpeta `dist` completa como subcarpeta; abre `dist` y sube lo que esta dentro.
8. Espera a que terminen de subir todos los videos, imagenes, HTML, CSS y JS.
9. Abre tu dominio y prueba:
   - pagina principal
   - contacto
   - Blue Drop
   - Green Drone
   - `/blog/`
   - articulos del blog
   - urls legacy del blog

## Subida por FTP

1. Abre un cliente como FileZilla.
2. Usa el host, usuario, puerto y password FTP de GoDaddy.
3. Conectate al servidor.
4. En el panel remoto entra a `public_html`.
5. En el panel local abre `dist`.
6. Sube todo el contenido de `dist` a `public_html`.

## Si quieres subir el proyecto fuente completo

Solo conviene si de verdad vas a compilar dentro del hosting.

1. Sube el proyecto a una carpeta como `/home/tu_usuario/cyc-site`.
2. En terminal SSH del hosting entra a esa carpeta.
3. Ejecuta:
   `npm install`
4. Ejecuta:
   `npm run build`
5. Copia el contenido de `dist` a `public_html`.

Aunque tu hosting soporte Node, para este proyecto sigue siendo mejor publicar el contenido de `dist`.

## Nota importante

Este repo usa Astro en modo estatico y exporta HTML listo para hosting tradicional.
Ya quedo configurado para que `npm run build` exporte:
- paginas principales
- blog nuevo en `/blog/`
- urls legacy del blog en `.html`
- carpeta `_astro` con los assets compilados

Para publicar correctamente, sube todo el contenido interno de `dist` a `public_html`.

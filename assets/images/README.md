Carpeta de imágenes para el proyecto `Latido Rural`

Estructura
- slider/    -> Imágenes grandes para el slider principal (3-6 imágenes)
- services/  -> Imágenes pequeñas para cada servicio (ej: corporativa, gastronómica)
- gallery/   -> Galería principal con subcategorías; añade directamente las 30 fotos aquí
- about/     -> Imágenes para la sección "Sobre nosotros" (por ejemplo, fotos del territorio)
- team/      -> Fotos del equipo o retratos grupales

Nombres recomendados
- Usa nombres simples y ordenados: `slider-01.jpg`, `service-01.jpg`, `gallery-portrait-01.jpg`, `team-01.jpg`
- Evita espacios y caracteres raros; usa guiones `-` o guion_bajo `_`.

Formatos y calidad
- Formato: `jpg` (JPEG) o `webp` (preferible cuando sea posible). Para logos o imágenes con transparencia usa `png`.
- Espacio de color: sRGB.
- Calidad/compresión: busca un buen balance entre calidad y peso. Ideal < 500 KB por imagen si es posible, hasta 1–2 MB para fotos muy grandes.

Tamaños recomendados (por tipo)
- Slider: 1600–2400 px de ancho, relación 16:9 o 3:1. Ejemplo: `1600x900` o `1920x800`.
- Servicios (miniaturas): 800x600 (o 400x300) — mantener 4:3.
- Galería: imágenes con lado largo ~1200–2000 px; se pueden usar versiones más pequeñas para miniaturas.
- About / Team: 800x600 o 1200x800 según encuadre.

Retina / HiDPI
- Si quieres mejor nitidez en pantallas retina, sube imágenes al doble de resolución y usa `srcset` en el HTML más adelante (opcional).

Accesibilidad
- Para cada imagen añade un texto `alt` descriptivo (ej: "Retrato de campesino en Antioquia").

Cómo subirlas aquí
- Copia tus archivos a las carpetas mencionadas.
- Mantén la numeración si quieres que el orden sea consistente.
- Después de subirlas, puedo actualizar `script.js` para que use esas imágenes locales en lugar de los placeholders.

Notas técnicas
- Actualmente el sitio usa placeholders SVG. Cuando quieras que utilice imágenes locales, dime y actualizo el script para que:
  1) Busque archivos en `assets/images/slider` para el slider (por orden alfabético);
  2) Reemplace miniaturas de `services` por imágenes locales si existen;
  3) Lea `assets/images/gallery` y genere la galería automáticamente.

Si quieres, te preparo también un pequeño script Node/Python para generar versiones optimizadas (webp y thumbnails) automáticamente.

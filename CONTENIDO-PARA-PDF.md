# CONTENIDO PARA EL PDF — Gestor de Inventario "InventarioShop"

---

## 1. CASO PROBLEMA

### Situación
Doña María Rosario es dueña de una tienda de variedades en el mercado central de su ciudad. Durante años ha manejado su inventario en cuadernos y hojas de cálculo impresas, lo que le ha generado múltiples problemas:

- **Pérdida de registros**: las hojas se extravían o se dañan con el tiempo.
- **Dificultad para actualizar precios**: cada cambio implica borrar y reescribir manualmente.
- **No sabe cuánto stock tiene**: frecuentemente vende productos que ya no tiene disponibles, causando molestias a sus clientes.
- **No puede calcular el valor total de su inventario**: depende de calculadora y sumas manuales que siempre terminan con errores.
- **Sus hijos la ayudan a vender los fines de semana** pero no conocen los precios ni el stock actual, generando confusiones.

### Necesidad identificada
Doña María necesita un sistema digital que le permita:

1. Registrar cada producto con nombre, precio, cantidad en stock y categoría.
2. Visualizar todos sus productos en tarjetas con imagen, para identificarlos rápidamente.
3. Filtrar productos por categoría (Electrónica, Ropa, Hogar, Deportes, Alimentos).
4. Buscar productos por nombre en tiempo real.
5. Agregar o quitar productos del carrito de un cliente mientras se mantiene el control del stock disponible.
6. Editar los datos de un producto cuando cambia el precio o llega nueva mercancía.
7. Eliminar productos que ya no comercializa.
8. Que los datos persistan aunque cierre la ventana del navegador.
9. Ver estadísticas resumidas: cuántos productos tiene y cuánto vale todo su inventario.

### Solución propuesta
Desarrollar una **aplicación web** usando únicamente tecnologías del lado del cliente (HTML, CSS y JavaScript con manipulación del DOM) que funcione como un sistema de gestión de inventario interactivo. La app se ejecuta en cualquier navegador, no requiere instalación, y guarda los datos localmente mediante `localStorage`, permitiendo que Doña María y sus hijos la usen desde una tablet o computadora sin conexión a internet permanente.

---

## 2. ESTRUCTURA DE LA APLICACIÓN

La aplicación consta de tres archivos que trabajan en conjunto:

- `index.html` — Estructura semántica de la interfaz.
- `styles.css` — Hojas de estilo con diseño responsive y animaciones.
- `app.js` — Lógica de negocio y manipulación del DOM.

---

## 3. CÓDIGO Y EXPLICACIÓN PASO A PASO

---

### 3.1 HTML (`index.html`)

El HTML define la estructura de la interfaz. Se utilizan etiquetas semánticas como `<header>`, `<main>`, `<aside>`, `<section>`, y `<article>` para organizar el contenido de forma accesible.

#### Cabecera (`<header>`)
Contiene el logo, la barra de búsqueda y el botón del carrito. La barra de búsqueda usa un `<input type="text">` cuyo valor se lee desde JavaScript para filtrar productos en tiempo real.

#### Contenedor principal (`<main>`)
Dividido en dos áreas mediante CSS Grid:

- **Sidebar izquierdo**: botón "Nuevo Producto", filtros de categoría (generados dinámicamente por JS) y estadísticas resumen.
- **Área de productos**: encabezado con contador de resultados y un `<div id="productsGrid">` vacío que JavaScript llena dinámicamente con las tarjetas de producto.

#### Modal de producto (`<div id="productModal">`)
Ventana emergente oculta por defecto (se muestra manipulando clases CSS desde JS). Contiene un `<form id="productForm">` con campos para nombre, precio, stock, categoría e imagen. Incluye un campo oculto `<input type="hidden" id="productId">` para saber si se está creando o editando un producto existente.

#### Sidebar del carrito (`<div id="cartSidebar">`)
Panel que se desliza desde la derecha. Contiene la lista de items del carrito y el total. Se controla desde JS agregando o quitando clases CSS.

#### Toast de notificaciones (`<div id="toastContainer">`)
Contenedor vacío donde JavaScript inserta mensajes temporales ("Producto agregado", "Sin stock", etc.) que aparecen con animación CSS y desaparecen automáticamente.

---

### 3.2 CSS (`styles.css`)

El CSS utiliza **variables CSS** (`:root`) para centralizar colores, sombras y tamaños, facilitando el mantenimiento.

#### Layout principal
```css
.main-container {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 24px;
}
```
El layout usa **CSS Grid** para dividir la pantalla en sidebar (260px fijo) y área de contenido (resto disponible). En pantallas pequeñas (`@media (max-width: 900px)`) se convierte en una sola columna.

#### Grid de productos
```css
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
}
```
Las tarjetas de producto se distribuyen automáticamente en columnas que se ajustan al ancho de la pantalla gracias a `auto-fill` y `minmax()`.

#### Tarjetas de producto
Cada tarjeta usa `flex-direction: column`, tiene una imagen en la parte superior, información en el centro y botones de acción en la parte inferior. Al pasar el mouse (`:hover`), se levanta ligeramente (`translateY(-4px)`) y aumenta la sombra.

#### Estados de stock
Se aplican clases dinámicas desde JS:
- `.in-stock` → verde (stock > 5)
- `.low-stock` → amarillo (stock 1–5)
- `.out-stock` → rojo (stock = 0)

#### Modal y carrito
Ambos usan `position: fixed` y `z-index` para superponerse al contenido. El modal usa `opacity` y `transform: scale()` para una animación suave de aparición. El carrito usa `transform: translateX(100%)` para estar oculto fuera de la pantalla y `translateX(0)` para deslizarse hacia dentro.

#### Responsive
Con `@media (max-width: 600px)` la cuadrícula de productos pasa a una sola columna, la cabecera se apila verticalmente y el formulario del modal pasa sus campos a una sola columna.

---

### 3.3 JavaScript (`app.js`)

Este archivo es el núcleo de la aplicación. Demuestra la manipulación del DOM en cada función.

#### Paso 1: Datos de ejemplo
Se define un array `sampleProducts` con 8 productos de muestra para que la aplicación no arranque vacía.

#### Paso 2: Estado de la aplicación
```javascript
let products = loadFromStorage('products') || [...sampleProducts];
let cart     = loadFromStorage('cart')     || [];
let currentFilter = 'all';
let searchTerm    = '';
```
Las variables guardan el estado actual. Se cargan desde `localStorage` si existen; si no, se usan los datos de ejemplo.

#### Paso 3: Referencias al DOM
En lugar de buscar elementos repetidamente en el árbol DOM, se obtienen una sola vez al inicio:
```javascript
const productsGrid = document.getElementById('productsGrid');
const searchInput  = document.getElementById('searchInput');
// ... etc
```
Esto mejora el rendimiento.

#### Paso 4: Persistencia con localStorage
```javascript
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
function loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}
```
Convierte objetos JavaScript a strings JSON para guardarlos, y los reconvierte al leerlos.

#### Paso 5: Renderizar productos (`renderProducts`)
Esta función demuestra múltiples técnicas del DOM:

1. **Filtra** el array `products` según la categoría seleccionada y el término de búsqueda.
2. **Actualiza textos** de resultados modificando `.textContent` de elementos existentes.
3. **Muestra u oculta** el estado vacío cambiando `.style.display`.
4. **Limpia el contenedor** con `productsGrid.innerHTML = ''` antes de volver a dibujar.
5. **Crea elementos dinámicamente** con `document.createElement('article')` para cada producto.
6. **Asigna contenido HTML** con `.innerHTML`, usando template strings de JavaScript para insertar los datos del producto.
7. **Agrega al DOM** con `productsGrid.appendChild(card)`.
8. **Actualiza estadísticas** llamando a `updateStats()`.
9. **Vincula eventos** a los botones de cada tarjeta recién creada.

#### Paso 6: Filtros de categoría (`renderCategoryFilters`)
Genera botones de filtro dinámicamente contando cuántos productos hay en cada categoría. Al hacer click en un filtro, se actualiza `currentFilter` y se re-renderizan tanto los filtros (para marcar el activo) como los productos.

#### Paso 7: CRUD de productos
- **`openModal(mode, product)`**: Muestra el modal manipulando `classList.add('show')`. Si es modo edición, llena los campos del formulario con los datos del producto usando `.value`.
- **`saveProduct(e)`**: Lee todos los campos del formulario con `.value`, valida, y si hay un `id` en el campo oculto actualiza el producto existente; si no, crea uno nuevo con un `id` autoincremental. Luego guarda en `localStorage` y re-renderiza.
- **`deleteProduct(id)`**: Filtra el array excluyendo el producto con ese `id`, guarda en `localStorage` y re-renderiza.

#### Paso 8: Carrito de compras
- **`addToCart(productId)`**: Encuentra el producto, valida stock, descuenta 1 unidad del `stock`, agrega al array `cart` (o incrementa cantidad si ya existe), guarda todo en `localStorage`, actualiza el contador y re-renderiza el grid para reflejar el stock actualizado.
- **`removeFromCart(productId)`**: Obtiene la cantidad del item antes de eliminarlo, restaura ese stock al producto en el inventario, elimina del carrito, guarda todo y re-renderiza tanto carrito como productos.

#### Paso 9: Notificaciones toast
```javascript
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
```
Crea un elemento dinámicamente, lo inserta en el DOM, y lo elimina automáticamente después de 3 segundos usando `setTimeout`.

#### Paso 10: Inicialización
```javascript
document.addEventListener('DOMContentLoaded', () => {
    renderCategoryFilters();
    renderProducts();
    updateCartCounter();
});
```
Espera a que el DOM esté completamente cargado antes de ejecutar el código que depende de elementos HTML existentes.

---

## 4. CAPTURAS DE PANTALLA REQUERIDAS

Abre `index.html` en tu navegador (doble click o usa Live Server en VS Code) y toma estas capturas:

1. **Vista general de la aplicación**: muestra el grid de 8 productos, la sidebar con filtros y estadísticas.
2. **Agregando un producto**: click en "+ Nuevo Producto", llena el formulario y guarda. Captura el modal lleno y el toast de éxito.
3. **Producto agregado**: captura la nueva tarjeta en el grid y el contador de productos actualizado.
4. **Editando un producto**: click en "✏️ Editar" de cualquier tarjeta, cambia el precio y guarda. Captura antes y después.
5. **Eliminando un producto**: click en "🗑️ Eliminar", captura la confirmación y el grid sin ese producto.
6. **Filtrando por categoría**: click en "Electrónica" en el sidebar, captura solo los productos de esa categoría.
7. **Buscando en tiempo real**: escribe "laptop" en la barra de búsqueda, captura los resultados filtrados.
8. **Agregando al carrito**: click en "🛒 Agregar" y captura el carrito abierto con el item adentro.
9. **Stock actualizado**: captura una tarjeta antes y después de agregar al carrito, mostrando que el stock bajó.
10. **Carrito vacío después de quitar**: quita un producto del carrito y captura el mensaje "Tu carrito está vacío".

---

## 5. LINK DE DESPLIEGUE

**(Pega aquí la URL que te dé Netlify, Cloudflare Pages, Vercel, GitHub Pages, etc.)**

Ejemplo:
> https://inventarioshop-abc123.netlify.app

---

## NOTAS PARA ARMAR EL PDF

1. Copia el "Caso problema" como introducción.
2. Pega las explicaciones de código junto a las capturas correspondientes.
3. Asegúrate de que las capturas sean legibles (tamaño mínimo 800x600 recomendado).
4. Enumera las páginas.
5. Agrega una portada con tu nombre, materia, fecha y título del proyecto.

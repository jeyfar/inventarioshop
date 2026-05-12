/* =========================================================
   GESTOR DE INVENTARIO - APLICACIÓN COMPLETA CON DOM
   Este archivo demuestra la manipulación del Document Object
   Model (DOM) paso a paso: crear, leer, actualizar y
   eliminar elementos HTML dinámicamente desde JavaScript.
   ========================================================= */


// =========================================================
// 1. DATOS DE EJEMPLO (productos iniciales)
// =========================================================
// Array con productos de muestra para que la app no
// arranque vacía. Cada producto es un objeto con propiedades.
const sampleProducts = [
    {
        id: 1,
        name: "Laptop Dell XPS 13",
        price: 1299.99,
        stock: 8,
        category: "electronica",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop"
    },
    {
        id: 2,
        name: "Camiseta Deportiva Nike",
        price: 35.50,
        stock: 45,
        category: "ropa",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop"
    },
    {
        id: 3,
        name: "Cafetera Espresso",
        price: 189.00,
        stock: 3,
        category: "hogar",
        image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=300&fit=crop"
    },
    {
        id: 4,
        name: "Balón de Fútbol Adidas",
        price: 29.99,
        stock: 0,
        category: "deportes",
        image: "https://images.unsplash.com/photo-1614632537197-38fd0d7e6a97?w=400&h=300&fit=crop"
    },
    {
        id: 5,
        name: "Auriculares Bluetooth Sony",
        price: 149.00,
        stock: 22,
        category: "electronica",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
    },
    {
        id: 6,
        name: "Zapatillas Running Puma",
        price: 79.95,
        stock: 12,
        category: "ropa",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop"
    },
    {
        id: 7,
        name: "Silla Ergonómica Oficina",
        price: 245.00,
        stock: 6,
        category: "hogar",
        image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&h=300&fit=crop"
    },
    {
        id: 8,
        name: "Mancuernas 10kg (par)",
        price: 55.00,
        stock: 18,
        category: "deportes",
        image: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=400&h=300&fit=crop"
    }
];


// =========================================================
// 2. ESTADO DE LA APLICACIÓN
// =========================================================
// Variables que guardan el estado actual de la app.
// Se cargan desde localStorage si existen, sino se usan
// los datos de ejemplo.
let products = loadFromStorage('products') || [...sampleProducts];
let cart     = loadFromStorage('cart')     || [];
let currentFilter = 'all';
let searchTerm    = '';


// =========================================================
// 3. REFERENCIAS A ELEMENTOS DEL DOM
// =========================================================
// Usamos document.getElementById() para obtener referencias
// a los elementos HTML que vamos a manipular.
// Esto evita buscarlos repetidamente en el árbol DOM.
const productsGrid    = document.getElementById('productsGrid');
const categoryFilter  = document.getElementById('categoryFilter');
const searchInput     = document.getElementById('searchInput');
const resultsTitle    = document.getElementById('resultsTitle');
const resultsCount    = document.getElementById('resultsCount');
const totalProductsEl = document.getElementById('totalProducts');
const totalValueEl    = document.getElementById('totalValue');
const emptyState      = document.getElementById('emptyState');

/* Referencias al Modal de producto */
const productModal = document.getElementById('productModal');
const modalTitle   = document.getElementById('modalTitle');
const productForm  = document.getElementById('productForm');
const productId    = document.getElementById('productId');
const productName  = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productStock = document.getElementById('productStock');
const productCategory = document.getElementById('productCategory');
const productImage  = document.getElementById('productImage');
const btnAddProduct = document.getElementById('btnAddProduct');
const btnCancel     = document.getElementById('btnCancel');
const modalClose    = document.getElementById('modalClose');

/* Referencias al Carrito */
const cartBtn       = document.getElementById('cartBtn');
const cartCount     = document.getElementById('cartCount');
const cartSidebar   = document.getElementById('cartSidebar');
const cartOverlay   = document.getElementById('cartOverlay');
const cartClose     = document.getElementById('cartClose');
const cartItems     = document.getElementById('cartItems');
const cartTotal     = document.getElementById('cartTotal');
const btnCheckout   = document.getElementById('btnCheckout');

/* Referencias al Toast */
const toastContainer = document.getElementById('toastContainer');


// =========================================================
// 4. FUNCIONES DE localStorage (PERSISTENCIA)
// =========================================================
// Permiten guardar y recuperar datos del navegador
// para que no se pierdan al recargar la página.

function saveToStorage(key, data) {
    // Convertimos el array/objeto a string JSON y lo guardamos
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage(key) {
    // Recuperamos el string y lo convertimos de vuelta a objeto
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}


// =========================================================
// 5. UTILIDADES
// =========================================================

function formatCurrency(value) {
    // Formatea un número como moneda USD
    return '$' + Number(value).toFixed(2);
}

function getStockClass(stock) {
    // Retorna clase CSS según el nivel de stock
    if (stock === 0) return 'out-stock';
    if (stock <= 5) return 'low-stock';
    return 'in-stock';
}

function getStockLabel(stock) {
    // Retorna texto descriptivo del stock
    if (stock === 0) return 'Sin stock';
    if (stock <= 5) return 'Poco stock: ' + stock;
    return 'Disponible: ' + stock;
}


// =========================================================
// 6. RENDERIZADO DE PRODUCTOS (MANIPULACIÓN DEL DOM)
// =========================================================
// Esta función recorre los productos filtrados y crea
// dinámicamente elementos HTML para cada uno.

function renderProducts() {
    // 1) FILTRAR productos según categoría y búsqueda
    let filtered = products.filter(p => {
        const matchCategory = currentFilter === 'all' || p.category === currentFilter;
        const matchSearch   = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategory && matchSearch;
    });

    // 2) ACTUALIZAR textos de resultados
    resultsTitle.textContent = currentFilter === 'all'
        ? 'Todos los productos'
        : 'Categoría: ' + capitalize(currentFilter);
    resultsCount.textContent = filtered.length + ' resultado' + (filtered.length !== 1 ? 's' : '');

    // 3) MOSTRAR u OCULTAR el mensaje de estado vacío
    if (filtered.length === 0) {
        productsGrid.style.display = 'none';
        emptyState.style.display   = 'block';
    } else {
        productsGrid.style.display = 'grid';
        emptyState.style.display   = 'none';
    }

    // 4) LIMPIAR el contenedor antes de volver a dibujar
    // innerHTML = '' elimina todos los hijos del elemento
    productsGrid.innerHTML = '';

    // 5) CREAR cada tarjeta de producto dinámicamente
    filtered.forEach(product => {
        // createElement('article') genera un nuevo nodo <article>
        const card = document.createElement('article');
        card.className = 'product-card';

        // Clase de categoría para el color del badge
        const catClass = 'category-' + product.category;

        // Imagen: si no tiene URL, usamos un placeholder
        const imgUrl = product.image || 'https://placehold.co/400x300?text=Sin+Imagen';

        // Template de la tarjeta usando innerHTML
        // Nota: en producción se debería sanitizar inputs del usuario
        card.innerHTML = `
            <img src="${imgUrl}" alt="${escapeHtml(product.name)}" class="product-image"
                 onerror="this.src='https://placehold.co/400x300?text=Sin+Imagen'">
            <div class="product-info">
                <span class="product-category ${catClass}">${capitalize(product.category)}</span>
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <div class="product-meta">
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    <span class="product-stock ${getStockClass(product.stock)}">
                        ${getStockLabel(product.stock)}
                    </span>
                </div>
                <div class="product-actions">
                    <button class="btn btn-secondary btn-edit" data-id="${product.id}">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger btn-delete" data-id="${product.id}">
                        🗑️ Eliminar
                    </button>
                    <button class="btn btn-success btn-add-cart" data-id="${product.id}">
                        🛒 Agregar
                    </button>
                </div>
            </div>
        `;

        // 6) AGREGAR la tarjeta al grid con appendChild()
        // Esto inserta el nodo como último hijo del contenedor
        productsGrid.appendChild(card);
    });

    // 7) ACTUALIZAR estadísticas del sidebar
    updateStats();

    // 8) VINCULAR event listeners a los botones recién creados
    // (Delegación de eventos o listeners directos)
    attachCardListeners();
}


// =========================================================
// 7. RENDERIZADO DE FILTROS DE CATEGORÍA
// =========================================================
// Genera botones de filtro dinámicamente contando cuántos
// productos hay en cada categoría.

function renderCategoryFilters() {
    // Definimos las categorías disponibles
    const categories = [
        { key: 'all',        label: 'Todas las categorías' },
        { key: 'electronica', label: 'Electrónica' },
        { key: 'ropa',        label: 'Ropa' },
        { key: 'hogar',       label: 'Hogar' },
        { key: 'deportes',    label: 'Deportes' },
        { key: 'alimentos',   label: 'Alimentos' }
    ];

    categoryFilter.innerHTML = '';

    categories.forEach(cat => {
        // Contar productos de esta categoría
        const count = cat.key === 'all'
            ? products.length
            : products.filter(p => p.category === cat.key).length;

        // Crear botón de filtro
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (currentFilter === cat.key ? ' active' : '');
        btn.innerHTML = `
            <span>${cat.label}</span>
            <span class="filter-count">${count}</span>
        `;

        // Evento click: cambiar filtro y re-renderizar
        btn.addEventListener('click', () => {
            currentFilter = cat.key;
            renderCategoryFilters(); // Actualizar estilos activos
            renderProducts();         // Volver a dibujar productos
        });

        categoryFilter.appendChild(btn);
    });
}


// =========================================================
// 8. ESTADÍSTICAS
// =========================================================
function updateStats() {
    // Conteo total de productos
    totalProductsEl.textContent = products.length;

    // Suma del valor total del inventario
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    totalValueEl.textContent = formatCurrency(totalValue);
}


// =========================================================
// 9. CRUD DE PRODUCTOS
// =========================================================

function openModal(mode = 'add', product = null) {
    // mode: 'add' para nuevo producto, 'edit' para editar

    if (mode === 'edit' && product) {
        modalTitle.textContent = 'Editar Producto';
        productId.value        = product.id;
        productName.value      = product.name;
        productPrice.value     = product.price;
        productStock.value     = product.stock;
        productCategory.value  = product.category;
        productImage.value     = product.image || '';
    } else {
        modalTitle.textContent = 'Agregar Producto';
        productForm.reset();   // Limpia todos los campos
        productId.value = '';  // Campo oculto vacío
    }

    // Mostrar el modal manipulando la clase CSS
    productModal.classList.add('show');
}

function closeModal() {
    productModal.classList.remove('show');
}

function saveProduct(e) {
    e.preventDefault(); // Evita recarga de página del formulario

    // Leer valores del formulario
    const id    = parseInt(productId.value);
    const name  = productName.value.trim();
    const price = parseFloat(productPrice.value);
    const stock = parseInt(productStock.value);
    const category = productCategory.value;
    const image    = productImage.value.trim();

    // Validación básica
    if (!name || isNaN(price) || isNaN(stock) || !category) {
        showToast('Completa todos los campos obligatorios.', 'error');
        return;
    }

    if (id) {
        // ===== MODO EDICIÓN =====
        // Encontrar índice del producto a editar
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            // Actualizar el objeto en el array
            products[index] = { id, name, price, stock, category, image };
            showToast('Producto actualizado correctamente.', 'success');
        }
    } else {
        // ===== MODO CREACIÓN =====
        // Generar nuevo ID único (máximo + 1)
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, name, price, stock, category, image });
        showToast('Producto agregado exitosamente.', 'success');
    }

    // Persistir en localStorage y refrescar la vista
    saveToStorage('products', products);
    closeModal();
    renderCategoryFilters();
    renderProducts();
}

function deleteProduct(id) {
    // Confirmación nativa del navegador
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    // filter() crea un nuevo array excluyendo el producto con ese ID
    products = products.filter(p => p.id !== id);

    saveToStorage('products', products);
    renderCategoryFilters();
    renderProducts();
    showToast('Producto eliminado.', 'info');
}


// =========================================================
// 10. CARRITO DE COMPRAS
// =========================================================

function openCart() {
    cartOverlay.classList.add('show');
    cartSidebar.classList.add('show');
    renderCart();
}

function closeCartSidebar() {
    cartOverlay.classList.remove('show');
    cartSidebar.classList.remove('show');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock <= 0) {
        showToast('Producto sin stock disponible.', 'error');
        return;
    }

    // Buscar si ya está en el carrito
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        // Agregar nuevo item al array del carrito
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    // Descontar 1 unidad del stock del inventario
    product.stock -= 1;

    saveToStorage('cart', cart);
    saveToStorage('products', products);
    updateCartCounter();
    renderProducts(); // Refrescar tarjetas para mostrar stock actualizado
    showToast('Producto agregado al carrito.', 'success');
}

function removeFromCart(productId) {
    // Obtener la cantidad del item ANTES de eliminarlo para restaurar stock
    const itemToRemove = cart.find(item => item.id === productId);
    if (!itemToRemove) return;

    // Restaurar el stock del producto en el inventario
    const product = products.find(p => p.id === productId);
    if (product) {
        product.stock += itemToRemove.quantity;
    }

    // Filtrar el producto del carrito
    cart = cart.filter(item => item.id !== productId);

    saveToStorage('cart', cart);
    saveToStorage('products', products);
    renderCart();
    updateCartCounter();
    renderProducts(); // Refrescar tarjetas para mostrar stock actualizado
}

function renderCart() {
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Tu carrito está vacío.</p>
            </div>
        `;
        cartTotal.textContent = '$0.00';
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image || 'https://placehold.co/50?text=?'}" alt="" class="cart-item-img"
                 onerror="this.src='https://placehold.co/50?text=?'">
            <div class="cart-item-info">
                <div class="cart-item-name">${escapeHtml(item.name)}</div>
                <div class="cart-item-price">
                    ${formatCurrency(item.price)} × ${item.quantity}
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}" title="Quitar">
                🗑️
            </button>
        `;
        cartItems.appendChild(div);
    });

    cartTotal.textContent = formatCurrency(total);

    // Listeners para botones de eliminar del carrito
    cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
    });
}

function updateCartCounter() {
    // Suma total de unidades en el carrito
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
}


// =========================================================
// 11. TOASTS (NOTIFICACIONES)
// =========================================================

function showToast(message, type = 'info') {
    // Crear elemento toast dinámicamente
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Icono según tipo
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.textContent = `${icons[type] || 'ℹ️'} ${message}`;

    // Insertar en el contenedor
    toastContainer.appendChild(toast);

    // Eliminar del DOM después de la animación (3 segundos)
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}


// =========================================================
// 12. UTILIDADES DE TEXTO
// =========================================================

function capitalize(str) {
    // Primera letra en mayúscula
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    // Evita inyección de código malicioso (XSS básico)
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// =========================================================
// 13. DELEGACIÓN DE EVENTOS EN TARJETAS
// =========================================================
// Vinculamos los botones Editar, Eliminar y Agregar al carrito
// de las tarjetas recién creadas.

function attachCardListeners() {
    // Botones EDITAR
    productsGrid.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const product = products.find(p => p.id === id);
            if (product) openModal('edit', product);
        });
    });

    // Botones ELIMINAR
    productsGrid.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            deleteProduct(parseInt(btn.dataset.id));
        });
    });

    // Botones AGREGAR AL CARRITO
    productsGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            addToCart(parseInt(btn.dataset.id));
        });
    });
}


// =========================================================
// 14. EVENT LISTENERS GLOBALES
// =========================================================
// Se registran una sola vez al cargar la página.

// Búsqueda en tiempo real: escucha cada vez que el usuario teclea
searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderProducts();
});

// Botón "Nuevo Producto"
btnAddProduct.addEventListener('click', () => openModal('add'));

// Cerrar modal (botón X)
modalClose.addEventListener('click', closeModal);

// Cancelar formulario
btnCancel.addEventListener('click', closeModal);

// Enviar formulario (guardar producto)
productForm.addEventListener('submit', saveProduct);

// Cerrar modal al hacer click fuera del contenido
productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeModal();
});

// Carrito: abrir, cerrar
 cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCartSidebar);
cartOverlay.addEventListener('click', closeCartSidebar);

// Checkout (solo muestra mensaje de demo)
btnCheckout.addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('El carrito está vacío.', 'error');
    } else {
        showToast('¡Gracias por tu compra! (Demo)', 'success');
        cart = [];
        saveToStorage('cart', cart);
        renderCart();
        updateCartCounter();
        closeCartSidebar();
    }
});


// =========================================================
// 15. INICIALIZACIÓN DE LA APLICACIÓN
// =========================================================
// Se ejecuta cuando el DOM ya está completamente cargado.

document.addEventListener('DOMContentLoaded', () => {
    // Dibujar los filtros de categoría
    renderCategoryFilters();

    // Dibujar la cuadrícula de productos
    renderProducts();

    // Actualizar contador del carrito
    updateCartCounter();
});

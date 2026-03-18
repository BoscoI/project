

// Текущие параметры фильтрации
let currentPage = 1;
let currentCategory = 'all';
let currentBrand = 'all';
let searchQuery = '';
let sortOrder = 'default';
let priceRange = { min: 0, max: 1000000 };

// Константы
const ITEMS_PER_PAGE = 9;

// Получение избранного
function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

// Проверка, в избранном ли товар
function isFavorite(productId) {
    const favorites = getFavorites();
    return favorites.includes(productId);
}

// Создание карточки товара для каталога
function createCatalogCard(product) {
    const isFav = isFavorite(product.id);
    
    return `
        <div class="product-card" data-id="${product.id}" data-category="${product.category}" data-brand="${product.brand || ''}">
            <div class="product-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                ${product.inStock ? 'В наличии' : 'Нет в наличии'}
            </div>
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/200'}" 
                     alt="${product.name}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/200'">
            </div>
            <div class="product-info">
                <h3 class="product-title">
                    <a href="product.html?id=${product.id}">${product.name}</a>
                </h3>
                <div class="product-rating">
                    ${generateRatingStars(product.rating || 5)}
                    <span class="rating-count">(${product.reviews || 0})</span>
                </div>
                <div class="product-price-block">
                    <span class="product-price">${product.price.toLocaleString('ru-RU')} ₽</span>
                    ${product.oldPrice ? `<span class="product-old-price">${product.oldPrice.toLocaleString('ru-RU')} ₽</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary add-to-cart" 
                            onclick="addToCartFromCatalog(${product.id})"
                            ${!product.inStock ? 'disabled' : ''}>
                        ${product.inStock ? 'В корзину' : 'Нет в наличии'}
                    </button>
                    <button class="favorite-btn ${isFav ? 'active' : ''}" 
                            onclick="toggleFavoriteFromCatalog(${product.id})"
                            title="${isFav ? 'Удалить из избранного' : 'Добавить в избранное'}">
                        ${isFav ? '♥' : '♡'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Генерация звезд рейтинга
function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

// Добавление в корзину из каталога
function addToCartFromCatalog(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.inStock) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Показываем уведомление
    showNotification(`Товар "${product.name}" добавлен в корзину`);
    
    // Обновляем счетчик
    updateCartBadge();
}

// Переключение избранного из каталога
function toggleFavoriteFromCatalog(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    let favorites = getFavorites();
    const index = favorites.indexOf(productId);
    let isNowFavorite = false;
    
    if (index === -1) {
        favorites.push(productId);
        isNowFavorite = true;
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Обновляем кнопку в карточке
    const card = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (card) {
        const favBtn = card.querySelector('.favorite-btn');
        if (favBtn) {
            favBtn.classList.toggle('active', isNowFavorite);
            favBtn.textContent = isNowFavorite ? '♥' : '♡';
            favBtn.title = isNowFavorite ? 'Удалить из избранного' : 'Добавить в избранное';
        }
    }
    
    // Показываем уведомление
    showNotification(isNowFavorite 
        ? `Товар "${product.name}" добавлен в избранное` 
        : `Товар "${product.name}" удален из избранного`);
    
    // Обновляем счетчик
    updateFavoritesBadge();
}

// Обновление счетчика корзины
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Обновление счетчика избранного
function updateFavoritesBadge() {
    const favorites = getFavorites();
    const favCount = document.getElementById('favCount');
    if (favCount) {
        favCount.textContent = favorites.length;
    }
}

// Показ уведомления
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Получение уникальных категорий
function getCategories() {
    const categories = ['all', ...new Set(products.map(p => p.category))];
    return categories;
}

// Получение уникальных брендов
function getBrands() {
    const brands = ['all', ...new Set(products.filter(p => p.brand).map(p => p.brand))];
    return brands;
}

// Фильтрация товаров
function getFilteredProducts() {
    let filtered = [...products];
    
    // Фильтр по категории
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
    
    // Фильтр по бренду
    if (currentBrand !== 'all') {
        filtered = filtered.filter(p => p.brand === currentBrand);
    }
    
    // Поиск по названию
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) || 
            (p.description && p.description.toLowerCase().includes(query))
        );
    }
    
    // Фильтр по цене
    filtered = filtered.filter(p => 
        p.price >= priceRange.min && p.price <= priceRange.max
    );
    
    // Сортировка
    if (sortOrder !== 'default') {
        filtered.sort((a, b) => {
            switch(sortOrder) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'rating-desc':
                    return (b.rating || 0) - (a.rating || 0);
                default:
                    return 0;
            }
        });
    }
    
    return filtered;
}

// Рендер товаров
function renderProducts() {
    const filtered = getFilteredProducts();
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    
    // Корректировка текущей страницы
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageProducts = filtered.slice(start, start + ITEMS_PER_PAGE);
    
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (pageProducts.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <p>Товары не найдены</p>
                <button class="btn btn-primary" onclick="resetFilters()">Сбросить фильтры</button>
            </div>
        `;
    } else {
        grid.innerHTML = pageProducts.map(p => createCatalogCard(p)).join('');
    }
    
    renderPagination(totalPages);
    updateResultsCount(filtered.length);
}

// Рендер пагинации
function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Кнопка "Первая"
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(1)">«</button>`;
    
    // Кнопка "Предыдущая"
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">‹</button>`;
    
    // Номера страниц
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    
    // Кнопка "Следующая"
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">›</button>`;
    
    // Кнопка "Последняя"
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${totalPages})">»</button>`;
    
    pagination.innerHTML = html;
}

// Переход на страницу
function goToPage(page) {
    currentPage = page;
    renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Обновление счетчика результатов
function updateResultsCount(count) {
    const countSpan = document.getElementById('resultsCount');
    if (countSpan) {
        countSpan.textContent = count;
    }
}

// Сброс фильтров
function resetFilters() {
    currentCategory = 'all';
    currentBrand = 'all';
    searchQuery = '';
    sortOrder = 'default';
    priceRange = { min: 0, max: 1000000 };
    currentPage = 1;
    
    // Обновление UI
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('brandFilter').value = 'all';
    document.getElementById('searchInput').value = '';
    document.getElementById('sortSelect').value = 'default';
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    
    renderProducts();
}

// Настройка фильтров
function setupFilters() {
    // Категории
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        const categories = getCategories();
        categoryFilter.innerHTML = categories.map(cat => 
            `<option value="${cat}">${cat === 'all' ? 'Все категории' : cat}</option>`
        ).join('');
        
        categoryFilter.addEventListener('change', function() {
            currentCategory = this.value;
            currentPage = 1;
            renderProducts();
        });
    }
    
    // Бренды
    const brandFilter = document.getElementById('brandFilter');
    if (brandFilter) {
        const brands = getBrands();
        brandFilter.innerHTML = brands.map(brand => 
            `<option value="${brand}">${brand === 'all' ? 'Все бренды' : brand}</option>`
        ).join('');
        
        brandFilter.addEventListener('change', function() {
            currentBrand = this.value;
            currentPage = 1;
            renderProducts();
        });
    }
    
    // Поиск
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                searchQuery = this.value;
                currentPage = 1;
                renderProducts();
            }, 300);
        });
    }
    
    // Сортировка
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortOrder = this.value;
            currentPage = 1;
            renderProducts();
        });
    }
    
    // Цена
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    
    if (priceMin && priceMax) {
        const applyPriceFilter = () => {
            priceRange.min = priceMin.value ? Number(priceMin.value) : 0;
            priceRange.max = priceMax.value ? Number(priceMax.value) : 1000000;
            currentPage = 1;
            renderProducts();
        };
        
        priceMin.addEventListener('change', applyPriceFilter);
        priceMax.addEventListener('change', applyPriceFilter);
    }
    
    // Кнопка сброса
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    setupFilters();
    renderProducts();
    updateCartBadge();
    updateFavoritesBadge();
    
    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
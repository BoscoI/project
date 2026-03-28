// favorites.js - логика работы с избранным

// Получение списка избранного из localStorage
function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

// Сохранение избранного в localStorage
function saveFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Добавление/удаление из избранного
function toggleFavorite(product) {
    let favorites = getFavorites();
    const index = favorites.indexOf(product.id);
    
    if (index === -1) {
        favorites.push(product.id);
    } else {
        favorites.splice(index, 1);
    }
    
    saveFavorites(favorites);
    updateBadges();
    renderFavorites(); // Обновляем отображение на странице избранного
    return favorites;
}

// Проверка, находится ли товар в избранном
function isFavorite(productId) {
    const favorites = getFavorites();
    return favorites.includes(productId);
}

// Создание карточки товара для отображения
function createFavoriteCard(product) {
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/200'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">${product.price.toLocaleString('ru-RU')} ₽</p>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-actions">
                    <button class="btn btn-primary add-to-cart" onclick="addToCartFromFavorites(${product.id})">
                        В корзину
                    </button>
                    <button class="favorite-btn active" onclick="removeFromFavorites(${product.id})" title="Удалить из избранного">
                        ♥
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Добавление товара в корзину со страницы избранного
function addToCartFromFavorites(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        if (typeof addToCart === 'function') {
            addToCart(product);
        } else {
            // Если addToCart не определена (на странице избранного), используем свою логику
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id: productId, quantity: 1 });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Обновляем счетчик корзины
            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                cartCount.textContent = totalItems;
            }
        }
        alert('Товар добавлен в корзину!');
    }
}

// Удаление из избранного
function removeFromFavorites(productId) {
    toggleFavorite({ id: productId });
}

// Отрисовка страницы избранного
function renderFavorites() {
    const favorites = getFavorites();
    const grid = document.getElementById('favoritesGrid');
    const emptyMsg = document.getElementById('emptyFavorites');
    const authMessage = document.getElementById('authMessage');
    
    if (!grid) return;
    
    // Проверка авторизации
    if (!isLoggedIn()) {
        grid.style.display = 'none';
        if (emptyMsg) emptyMsg.style.display = 'none';
        if (authMessage) authMessage.style.display = 'block';
        return;
    }
    
    // Если авторизован
    if (authMessage) authMessage.style.display = 'none';
    grid.style.display = 'grid';
    
    const favoriteProducts = products.filter(p => favorites.includes(p.id));
    
    if (favoriteProducts.length === 0) {
        grid.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }
    
    if (emptyMsg) emptyMsg.style.display = 'none';
    grid.innerHTML = favoriteProducts
        .map(product => createFavoriteCard(product))
        .join('');
}

// Настройка кнопки входа на странице избранного
function setupLoginButton() {
    const loginBtn = document.getElementById('loginFromFavorites');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            if (typeof openAuthModal === 'function') {
                openAuthModal();
            }
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    renderFavorites();
    setupLoginButton();
});
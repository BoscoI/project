// profile.js - полная логика личного кабинета

// Получение корзины из localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Получение избранного из localStorage
function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

// Создание карточки товара
function createProductCard(product) {
    const isFav = getFavorites().includes(product.id);
    
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/200'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="product-price">${product.price.toLocaleString('ru-RU')} ₽</p>
                <div class="product-actions">
                    <button class="btn btn-small add-to-cart" onclick="addToCartFromProfile(${product.id})">
                        В корзину
                    </button>
                    <button class="favorite-btn ${isFav ? 'active' : ''}" 
                            onclick="toggleFavoriteFromProfile(${product.id})"
                            title="${isFav ? 'Удалить из избранного' : 'Добавить в избранное'}">
                        ${isFav ? '♥' : '♡'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Добавление в корзину из профиля
function addToCartFromProfile(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    let cart = getCart();
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Обновляем отображение, если открыта вкладка корзины
    if (document.getElementById('cartTab')?.classList.contains('active')) {
        renderProfileCart();
    }
    
    // Обновляем счетчик
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Переключение избранного из профиля
function toggleFavoriteFromProfile(productId) {
    let favorites = getFavorites();
    const index = favorites.indexOf(productId);
    
    if (index === -1) {
        favorites.push(productId);
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Обновляем отображение, если открыта вкладка избранного
    if (document.getElementById('favoritesTab')?.classList.contains('active')) {
        renderProfileFavorites();
    }
    
    // Обновляем счетчик
    const favCount = document.getElementById('favCount');
    if (favCount) {
        favCount.textContent = favorites.length;
    }
}

// Проверка авторизации
function checkProfileAuth() {
    const unauthMessage = document.getElementById('unauthMessage');
    const profileContent = document.getElementById('profileContent');
    const user = getCurrentUser();
    
    if (!isLoggedIn() || !user) {
        if (unauthMessage) unauthMessage.style.display = 'block';
        if (profileContent) profileContent.style.display = 'none';
        return false;
    }
    
    if (unauthMessage) unauthMessage.style.display = 'none';
    if (profileContent) profileContent.style.display = 'block';
    
    // Заполняем информацию о пользователе
    document.getElementById('userName').textContent = user.name || 'Пользователь';
    document.getElementById('userEmail').textContent = user.email || '';
    
    // Дата регистрации (если есть)
    const regDateSpan = document.getElementById('regDate');
    if (regDateSpan) {
        // Используем дату из localStorage или текущую
        const regDate = localStorage.getItem('user_reg_date') || 
                        new Date().toLocaleDateString('ru-RU');
        regDateSpan.textContent = regDate;
    }
    
    return true;
}

// Рендер истории заказов
function renderOrderHistory() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const user = getCurrentUser();
    const ordersList = document.getElementById('ordersList');
    
    if (!ordersList) return;
    
    // Фильтруем заказы текущего пользователя (по email или userId)
    const userOrders = user 
        ? orders.filter(order => 
            order.customer?.email === user.email || 
            order.customer?.userId === user.id)
        : orders;
    
    if (userOrders.length === 0) {
        ordersList.innerHTML = '<p class="empty-message">У вас пока нет заказов</p>';
        return;
    }
    
    // Сортируем по дате (сначала новые)
    userOrders.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    
    ordersList.innerHTML = userOrders.map(order => {
        // Определяем статус и класс для него
        const statusClass = {
            'Новый': 'status-new',
            'В обработке': 'status-processing',
            'Отправлен': 'status-shipped',
            'Доставлен': 'status-delivered',
            'Отменён': 'status-cancelled'
        }[order.status] || 'status-new';
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-number">
                        <strong>Заказ #${order.id}</strong>
                    </div>
                    <div class="order-date">${order.date}</div>
                    <div class="order-status ${statusClass}">${order.status}</div>
                </div>
                <div class="order-body">
                    <div class="order-items-preview">
                        ${order.items.slice(0, 3).map(item => `
                            <div class="order-item-preview">
                                <img src="${item.image || 'https://via.placeholder.com/40'}" 
                                     alt="${item.name}" class="order-item-thumb">
                                <span>${item.name} (${item.quantity} шт.)</span>
                            </div>
                        `).join('')}
                        ${order.items.length > 3 ? 
                            `<div class="order-more-items">и еще ${order.items.length - 3} товара(ов)</div>` : ''}
                    </div>
                </div>
                <div class="order-footer">
                    <div class="order-address">Адрес: ${order.address ? 
                        `${order.address.city}, ${order.address.street}, д. ${order.address.house}${order.address.apartment ? `, кв. ${order.address.apartment}` : ''}` : 
                        order.address}</div>
                    <div class="order-total">Сумма: <strong>${order.total?.toLocaleString('ru-RU') || order.subtotal?.toLocaleString('ru-RU')} ₽</strong></div>
                </div>
                <button class="btn btn-small order-details-btn" onclick="showOrderDetails(${order.id})">Подробнее</button>
            </div>
        `;
    }).join('');
}

// Показать детали заказа
function showOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const detailsHTML = `
        <div class="order-details-modal">
            <h4>Заказ #${order.id}</h4>
            <p><strong>Дата:</strong> ${order.date}</p>
            <p><strong>Статус:</strong> ${order.status}</p>
            <p><strong>Получатель:</strong> ${order.customer?.fullName || '-'}</p>
            <p><strong>Телефон:</strong> ${order.customer?.phone || '-'}</p>
            <p><strong>Email:</strong> ${order.customer?.email || '-'}</p>
            <p><strong>Адрес:</strong> ${order.address ? 
                `${order.address.city}, ${order.address.street}, д. ${order.address.house}${order.address.apartment ? `, кв. ${order.address.apartment}` : ''}` : 
                '-'}</p>
            <p><strong>Оплата:</strong> ${
                order.payment === 'card' ? 'Банковской картой' :
                order.payment === 'cash' ? 'Наличными' :
                order.payment === 'sbp' ? 'СБП' : '-'
            }</p>
            <hr>
            <h5>Товары:</h5>
            <ul>
                ${order.items.map(item => `
                    <li>${item.name} — ${item.quantity} шт. × ${item.price.toLocaleString('ru-RU')} ₽ = ${item.total.toLocaleString('ru-RU')} ₽</li>
                `).join('')}
            </ul>
            <p><strong>Сумма:</strong> ${order.subtotal?.toLocaleString('ru-RU')} ₽</p>
            <p><strong>Доставка:</strong> ${order.deliveryCost?.toLocaleString('ru-RU')} ₽</p>
            <p><strong>Итого:</strong> ${order.total?.toLocaleString('ru-RU')} ₽</p>
        </div>
    `;
    
    // Создаем модальное окно для деталей
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content order-details-content">
            <span class="close-modal">&times;</span>
            ${detailsHTML}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Рендер избранного в профиле
function renderProfileFavorites() {
    const favorites = getFavorites();
    const grid = document.getElementById('profileFavoritesGrid');
    
    if (!grid) return;
    
    const favProducts = products.filter(p => favorites.includes(p.id));
    
    if (favProducts.length === 0) {
        grid.innerHTML = '<p class="empty-message">В избранном пока нет товаров</p>';
        return;
    }
    
    grid.innerHTML = favProducts
        .map(product => createProductCard(product))
        .join('');
}

// Рендер корзины в профиле
function renderProfileCart() {
    const cart = getCart();
    const cartDiv = document.getElementById('profileCartContent');
    
    if (!cartDiv) return;
    
    if (cart.length === 0) {
        cartDiv.innerHTML = '<p class="empty-message">Корзина пуста</p>';
        return;
    }
    
    cartDiv.innerHTML = `
        <div class="profile-cart-items">
            ${cart.map(item => {
                const product = products.find(p => p.id === item.id);
                if (!product) return '';
                
                return `
                    <div class="profile-cart-item">
                        <img src="${product.image || 'https://via.placeholder.com/50'}" 
                             alt="${product.name}" class="cart-item-image">
                        <div class="cart-item-info">
                            <h5>${product.name}</h5>
                            <p>${item.quantity} × ${product.price.toLocaleString('ru-RU')} ₽</p>
                        </div>
                        <div class="cart-item-total">
                            <strong>${(product.price * item.quantity).toLocaleString('ru-RU')} ₽</strong>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="profile-cart-total">
            <strong>Итого: ${cart.reduce((sum, item) => {
                const product = products.find(p => p.id === item.id);
                return sum + (product ? product.price * item.quantity : 0);
            }, 0).toLocaleString('ru-RU')} ₽</strong>
            <a href="checkout.html" class="btn btn-primary">Оформить заказ</a>
        </div>
    `;
}

// Переключение табов
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Убираем активный класс у всех табов и контента
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
            
            // Активируем текущий таб
            this.classList.add('active');
            
            // Показываем соответствующий контент
            const contentTab = document.getElementById(`${tabName}Tab`);
            if (contentTab) {
                contentTab.classList.add('active');
                
                // Обновляем контент в зависимости от таба
                if (tabName === 'orders') {
                    renderOrderHistory();
                } else if (tabName === 'favorites') {
                    renderProfileFavorites();
                } else if (tabName === 'cart') {
                    renderProfileCart();
                }
            }
        });
    });
}

// Настройка кнопки выхода
function setupLogout() {
    const logoutBtn = document.getElementById('logoutFromProfile');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof logout === 'function') {
                logout();
            } else {
                localStorage.removeItem('auth_user');
                window.location.reload();
            }
        });
    }
}

// Настройка кнопки входа
function setupLogin() {
    const loginBtn = document.getElementById('loginFromProfile');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof openAuthModal === 'function') {
                openAuthModal('login');
            }
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (!checkProfileAuth()) {
        setupLogin();
        return;
    }
    
    renderOrderHistory();
    renderProfileFavorites();
    renderProfileCart();
    setupTabs();
    setupLogout();
    
    // Слушаем событие входа
    window.addEventListener('storage', function(e) {
        if (e.key === 'auth_user') {
            window.location.reload();
        }
    });
});
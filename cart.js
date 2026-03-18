// cart.js - полная логика работы корзины

// Получение корзины из localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Сохранение корзины в localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Добавление товара в корзину
function addToCart(product) {
    let cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            quantity: 1
        });
    }
    
    saveCart(cart);
    updateBadges();
    return cart;
}

// Удаление товара из корзины
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCart();
    updateBadges();
}

// Обновление количества товара
function updateQuantity(productId, delta) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += delta;
        
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        saveCart(cart);
        renderCart();
        updateBadges();
    }
}

// Очистка всей корзины
function clearCart() {
    saveCart([]);
    renderCart();
    updateBadges();
}

// Подсчет общей суммы
function calculateTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.id);
        return total + (product ? product.price * item.quantity : 0);
    }, 0);
}

// Подсчет общего количества товаров
function calculateTotalItems() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Отрисовка корзины
function renderCart() {
    const cart = getCart();
    const tbody = document.getElementById('cartTableBody');
    const emptyMsg = document.getElementById('emptyCart');
    const table = document.querySelector('.cart-table');
    const summary = document.getElementById('cartSummary');
    const clearBtn = document.getElementById('clearCartBtn');
    const totalPriceSpan = document.getElementById('totalPrice');
    const totalItemsSpan = document.getElementById('totalItems');
    
    if (!tbody) return;
    
    if (cart.length === 0) {
        tbody.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (table) table.style.display = 'none';
        if (summary) summary.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'none';
        return;
    }
    
    if (emptyMsg) emptyMsg.style.display = 'none';
    if (table) table.style.display = 'table';
    if (summary) summary.style.display = 'flex';
    if (clearBtn) clearBtn.style.display = 'inline-block';
    
    tbody.innerHTML = cart.map((item, index) => {
        const product = products.find(p => p.id === item.id);
        if (!product) return '';
        
        const sum = product.price * item.quantity;
        
        return `<tr>
            <td>${index + 1}</td>
            <td>
                <div class="cart-product-info">
                    <img src="${product.image || 'https://via.placeholder.com/50'}" alt="${product.name}" class="cart-product-image">
                    <span>${product.name}</span>
                </div>
            </td>
            <td>${product.price.toLocaleString('ru-RU')} ₽</td>
            <td>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${product.id}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${product.id}, 1)">+</button>
                </div>
            </td>
            <td><strong>${sum.toLocaleString('ru-RU')} ₽</strong></td>
            <td>
                <button class="btn-remove" onclick="removeFromCart(${product.id})" title="Удалить товар">✕</button>
            </td>
        </tr>`;
    }).join('');
    
    if (totalPriceSpan) {
        totalPriceSpan.textContent = calculateTotal().toLocaleString('ru-RU');
    }
    
    if (totalItemsSpan) {
        totalItemsSpan.textContent = calculateTotalItems();
    }
}

// Проверка авторизации для оформления заказа
function setupCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const authHint = document.getElementById('authHint');
    
    if (!checkoutBtn) return;
    
    checkoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (isLoggedIn()) {
            // Переход к оформлению заказа
            window.location.href = 'checkout.html';
        } else {
            // Показываем подсказку и модальное окно авторизации
            if (authHint) authHint.style.display = 'block';
            if (typeof openAuthModal === 'function') {
                openAuthModal();
            }
        }
    });
}

// Кнопка очистки корзины
function setupClearCartButton() {
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Очистить корзину?')) {
                clearCart();
            }
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    setupCheckoutButton();
    setupClearCartButton();
});
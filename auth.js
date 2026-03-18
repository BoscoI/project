// auth.js - полная система авторизации с модальным окном

(function() {
    'use strict';
    
    // Инициализация пользователей (если нет в localStorage)
    function initUsers() {
        if (!localStorage.getItem('auth_users')) {
            const defaultUsers = [
                { id: 1, name: 'Администратор', email: 'admin@techstore.ru', password: 'admin123', role: 'admin' },
                { id: 2, name: 'Иван Петров', email: 'ivan@example.com', password: 'user123', role: 'user' }
            ];
            localStorage.setItem('auth_users', JSON.stringify(defaultUsers));
        }
    }
    
    // Получение всех пользователей
    function getUsers() {
        return JSON.parse(localStorage.getItem('auth_users') || '[]');
    }
    
    // Получение текущего пользователя
    function getCurrentUser() {
        return JSON.parse(localStorage.getItem('auth_user') || 'null');
    }
    
    // Сохранение текущего пользователя
    function saveUser(user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
    }
    
    // Удаление текущего пользователя
    function clearUser() {
        localStorage.removeItem('auth_user');
    }
    
    // Проверка авторизации
    function isLoggedIn() {
        return localStorage.getItem('auth_user') !== null;
    }
    
    // Функция входа
    function login(email, password) {
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            return 'Неверный email или пароль';
        }
        
        // Не сохраняем пароль в сессии
        const { password: pwd, ...safeUser } = user;
        saveUser(safeUser);
        updateNavAuth();
        return null;
    }
    
    // Функция выхода
    function logout() {
        clearUser();
        updateNavAuth();
        
        // Если мы на защищенной странице, можно перенаправить
        if (window.location.pathname.includes('profile') || 
            window.location.pathname.includes('admin')) {
            window.location.href = 'index.html';
        }
    }
    
    // Функция регистрации
    function register(name, email, password) {
        const users = getUsers();
        
        if (users.find(u => u.email === email)) {
            return 'Этот email уже зарегистрирован';
        }
        
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            role: 'user'
        };
        
        users.push(newUser);
        localStorage.setItem('auth_users', JSON.stringify(users));
        
        // Автоматический вход после регистрации
        const { password: pwd, ...safeUser } = newUser;
        saveUser(safeUser);
        updateNavAuth();
        return null;
    }
    
    // Обновление навигации (отображение имени пользователя)
    function updateNavAuth() {
        const nav = document.querySelector('.nav-list');
        if (!nav) return;
        
        const user = getCurrentUser();
        const authLinks = document.querySelectorAll('.auth-link');
        
        // Удаляем старые ссылки авторизации
        authLinks.forEach(link => link.remove());
        
        if (user) {
            // Пользователь авторизован
            const userLi = document.createElement('li');
            userLi.className = 'auth-link';
            userLi.innerHTML = `<span class="user-name">${user.name}</span> <a href="#" id="logoutBtn">(Выйти)</a>`;
            nav.appendChild(userLi);
            
            // Добавляем обработчик выхода
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
        } else {
            // Гость
            const loginLi = document.createElement('li');
            loginLi.className = 'auth-link';
            loginLi.innerHTML = '<a href="#" id="loginBtn">Войти</a> | <a href="#" id="registerBtn">Регистрация</a>';
            nav.appendChild(loginLi);
            
            // Добавляем обработчики для открытия модального окна
            document.getElementById('loginBtn')?.addEventListener('click', function(e) {
                e.preventDefault();
                openAuthModal('login');
            });
            
            document.getElementById('registerBtn')?.addEventListener('click', function(e) {
                e.preventDefault();
                openAuthModal('register');
            });
        }
        
        // Обновляем счетчики
        updateBadges();
    }
    
    // Создание HTML для форм авторизации
    function createAuthForms() {
        return `
            <div class="auth-tabs">
                <button class="tab-btn active" data-tab="login">Вход</button>
                <button class="tab-btn" data-tab="register">Регистрация</button>
            </div>
            
            <form id="loginForm" class="auth-form active">
                <h3>Вход в систему</h3>
                <div class="form-group">
                    <label for="loginEmail">Email:</label>
                    <input type="email" id="loginEmail" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Пароль:</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <div class="form-error" id="loginError"></div>
                <button type="submit" class="btn btn-primary">Войти</button>
            </form>
            
            <form id="registerForm" class="auth-form">
                <h3>Регистрация</h3>
                <div class="form-group">
                    <label for="registerName">Имя:</label>
                    <input type="text" id="registerName" required>
                </div>
                <div class="form-group">
                    <label for="registerEmail">Email:</label>
                    <input type="email" id="registerEmail" required>
                </div>
                <div class="form-group">
                    <label for="registerPassword">Пароль:</label>
                    <input type="password" id="registerPassword" required>
                </div>
                <div class="form-group">
                    <label for="registerConfirm">Подтверждение:</label>
                    <input type="password" id="registerConfirm" required>
                </div>
                <div class="form-error" id="registerError"></div>
                <button type="submit" class="btn btn-primary">Зарегистрироваться</button>
            </form>
        `;
    }
    
    // Открытие модального окна
    function openAuthModal(tab = 'login') {
        let modal = document.getElementById('authModal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'authModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal" id="closeModal">&times;</span>
                    <div id="authForms">${createAuthForms()}</div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Добавляем обработчик закрытия
            document.getElementById('closeModal').addEventListener('click', closeAuthModal);
            
            window.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeAuthModal();
                }
            });
        }
        
        // Обновляем содержимое, если нужно
        const formsContainer = document.getElementById('authForms');
        if (formsContainer) {
            formsContainer.innerHTML = createAuthForms();
        }
        
        modal.style.display = 'flex';
        setupAuthForms(tab);
    }
    
    // Закрытие модального окна
    function closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // Настройка обработчиков форм
    function setupAuthForms(activeTab = 'login') {
        const tabs = document.querySelectorAll('.tab-btn');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        // Переключение табов
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                if (this.dataset.tab === 'login') {
                    loginForm.classList.add('active');
                    registerForm.classList.remove('active');
                } else {
                    registerForm.classList.add('active');
                    loginForm.classList.remove('active');
                }
            });
        });
        
        // Устанавливаем активный таб
        if (activeTab === 'login') {
            tabs[0]?.click();
        } else {
            tabs[1]?.click();
        }
        
        // Обработка формы входа
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                const errorDiv = document.getElementById('loginError');
                
                const error = login(email, password);
                
                if (error) {
                    errorDiv.textContent = error;
                } else {
                    closeAuthModal();
                    // Обновляем страницу, если нужно
                    if (window.location.pathname.includes('favorites.html')) {
                        window.location.reload();
                    }
                }
            });
        }
        
        // Обработка формы регистрации
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = document.getElementById('registerName').value;
                const email = document.getElementById('registerEmail').value;
                const password = document.getElementById('registerPassword').value;
                const confirm = document.getElementById('registerConfirm').value;
                const errorDiv = document.getElementById('registerError');
                
                if (password !== confirm) {
                    errorDiv.textContent = 'Пароли не совпадают';
                    return;
                }
                
                const error = register(name, email, password);
                
                if (error) {
                    errorDiv.textContent = error;
                } else {
                    closeAuthModal();
                    if (window.location.pathname.includes('favorites.html')) {
                        window.location.reload();
                    }
                }
            });
        }
    }
    
    // Экспорт функций в глобальную область
    window.auth = {
        login,
        logout,
        register,
        getCurrentUser,
        isLoggedIn
    };
    
    // Делаем функции доступными глобально
    window.getCurrentUser = getCurrentUser;
    window.isLoggedIn = isLoggedIn;
    window.openAuthModal = openAuthModal;
    window.closeAuthModal = closeAuthModal;
    window.logout = logout;
    
    // Инициализация при загрузке
    document.addEventListener('DOMContentLoaded', function() {
        initUsers();
        updateNavAuth();
    });
})();
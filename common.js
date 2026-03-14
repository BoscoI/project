function getCart()        { return JSON.parse(localStorage.getItem('cart')       || '[]') }
   function saveCart(cart)   { localStorage.setItem('cart', JSON.stringify(cart)) }
   function getFavorites()   { return JSON.parse(localStorage.getItem('favorites')  || '[]') }
   function saveFavorites(f) { localStorage.setItem('favorites', JSON.stringify(f)) }
   function getProductStats() {
       return JSON.parse(localStorage.getItem('productStats') || '{}')
   }
   function saveProductStats(s) {
       localStorage.setItem('productStats', JSON.stringify(s))
   }
   function getOrderHistory() {
       return JSON.parse(localStorage.getItem('orders') || '[]')
   }
  
   function updateBadges() {
       const cartCount = document.getElementById('cartCount');
       const favCount  = document.getElementById('favCount');
       if (cartCount) cartCount.textContent = getCart().length;
       if (favCount)  favCount.textContent  = getFavorites().length;
   }
  
   function createProductCard(product) {
       const favs   = getFavorites();
       const isFav  = favs.includes(product.id);
       const cart   = getCart();
       const inCart = cart.find(i => i.id === product.id);
       return `
       <div class="product-card">
           <div class="product-emoji">${product.image}</div>
           <div class="product-info">
               <h3 class="product-name">${product.name}</h3>
               <p class="product-price">${product.price.toLocaleString('ru-RU')} ₽</p>
               <p class="product-stock">Остаток: ${product.stock} шт.</p>
           </div>
           <div class="product-actions">
               <button class="btn btn-favorite ${isFav ? 'active' : ''}"
                       onclick="toggleFavorite(${product.id})">
                   ${isFav ? '❤️' : '🤍'}
               </button>
               <button class="btn btn-cart"
                       onclick="addToCart(${product.id})">
                   ${inCart ? '✓ В корзине' : 'В корзину'}
               </button>
           </div>
       </div>`;
   }
  
   function addToCart(productId) {
       const product = products.find(p => p.id === productId);
       if (!product) return;
       let cart = getCart();
       const item = cart.find(i => i.id === productId);
       if (item) item.quantity++;
       else cart.push({ id: productId, quantity: 1 });
       saveCart(cart);
       updateBadges();
       typeof renderProducts === 'function' && renderProducts();
   }
  
   function toggleFavorite(productId) {
       let favs = getFavorites();
       if (favs.includes(productId))
           favs = favs.filter(id => id !== productId);
       else
           favs.push(productId);
       saveFavorites(favs);
       updateBadges();
       typeof renderProducts  === 'function' && renderProducts();
       typeof renderFavorites === 'function' && renderFavorites();
   }
  
   // Бургер-меню
   document.addEventListener('DOMContentLoaded', () => {
       updateBadges();
       const burger = document.getElementById('burger');
       const nav    = document.getElementById('nav');
       if (burger && nav)
           burger.addEventListener('click', () => nav.classList.toggle('open'));
   });
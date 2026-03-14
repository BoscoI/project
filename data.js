// Данные товаров TechStore
   const products = [
       // ─── Сотовые телефоны (id 1-20) ───
       { id: 1,  name: 'iPhone 15 Pro',           category: 'phones',      price: 129990, image: '📱', stock: 15 },
       { id: 2,  name: 'Samsung Galaxy S24',       category: 'phones',      price:  89990, image: '📱', stock: 20 },
       { id: 3,  name: 'Xiaomi 14 Pro',            category: 'phones',      price:  79990, image: '📱', stock: 25 },
       { id: 4,  name: 'Google Pixel 8 Pro',       category: 'phones',      price:  99990, image: '📱', stock: 12 },
       { id: 5,  name: 'OnePlus 12',               category: 'phones',      price:  69990, image: '📱', stock: 18 },
       // ... (ещё 15 телефонов — смотри полный data.js из репозитория)
  
       // ─── Ноутбуки (id 21-40) ───
       { id: 21, name: 'MacBook Pro 16"',          category: 'laptops',     price: 249990, image: '💻', stock:  8 },
       { id: 22, name: 'Dell XPS 15',              category: 'laptops',     price: 189990, image: '💻', stock: 12 },
       { id: 23, name: 'ASUS ROG Zephyrus G14',    category: 'laptops',     price: 159990, image: '💻', stock: 10 },
       { id: 24, name: 'Lenovo ThinkPad X1',       category: 'laptops',     price: 179990, image: '💻', stock:  6 },
       { id: 25, name: 'HP Spectre x360',          category: 'laptops',     price: 149990, image: '💻', stock:  9 },
       // ... (ещё 15 ноутбуков)
  
       // ─── Аксессуары (id 41-60) ───
       { id: 41, name: 'AirPods Pro 2',            category: 'accessories', price:  24990, image: '🎧', stock: 50 },
       { id: 42, name: 'Samsung Galaxy Buds2 Pro', category: 'accessories', price:  12990, image: '🎧', stock: 60 },
       { id: 43, name: 'Apple Watch Series 9',     category: 'accessories', price:  39990, image: '⌚', stock: 30 },
       { id: 44, name: 'Logitech MX Master 3',     category: 'accessories', price:   8990, image: '🖱️', stock: 40 },
       { id: 45, name: 'Samsung 65W Charger',      category: 'accessories', price:   3990, image: '🔌', stock: 80 },
       // ... (ещё 15 аксессуаров)
   ];
  
   // ► ПОЛНЫЙ список (60 товаров) содержится в файле data.js репозитория!
   // ► Скопируй всё содержимое Inter_mag1/data.js
  
   function initProductStats() {
       const stats = {};
       products.forEach(product => {
           stats[product.id] = {
               inCart: 0, inFavorites: 0, ordered: 0, purchased: 0
           };
       });
       return stats;
   }
  
   function getProductStats() {
       const stored = localStorage.getItem('productStats');
       if (stored) return JSON.parse(stored);
       const stats = initProductStats();
       localStorage.setItem('productStats', JSON.stringify(stats));
       return stats;
   }
-- =====================================
-- 🍕 Rapida&Sabrosa - Datos iniciales
-- =====================================

-- =========================
-- Categorías base
-- =========================
INSERT INTO categories (name, description)
VALUES
  ('Pizzas Tradicionales', 'Recetas clásicas con masa artesanal y queso mozzarella'),
  ('Pizzas Especiales', 'Combinaciones premium de la casa'),
  ('Bebidas', 'Refrescos, aguas y jugos naturales'),
  ('Postres', 'Dulces artesanales para acompañar tu pedido');

-- =========================
-- Productos
-- =========================
INSERT INTO products (name, description, price, image_url, category_id, available, stock, discount)
VALUES
  -- 🍕 Pizzas Tradicionales
  ('Pizza Napolitana', 'Base de tomate, mozzarella y albahaca fresca', 8990.00,
   'https://rapidaysabrosa.cl/img/pizza-napolitana.jpg', 1, true, 0, NULL),

  ('Pizza Pepperoni', 'Masa delgada, salsa de tomate y abundante pepperoni', 9490.00,
   'https://rapidaysabrosa.cl/img/pizza-pepperoni.jpg', 1, true, 0, NULL),

  -- 🍕 Pizzas Especiales
  ('Pizza Cuatro Quesos', 'Mozzarella, gorgonzola, parmesano y queso de cabra', 10990.00,
   'https://rapidaysabrosa.cl/img/pizza-cuatro-quesos.jpg', 2, true, 0, NULL),

  ('Pizza BBQ Pollo', 'Pollo desmenuzado, cebolla morada y salsa barbacoa casera', 10490.00,
   'https://rapidaysabrosa.cl/img/pizza-bbq.jpg', 2, true, 0, NULL),

  -- 🥤 Bebidas
  ('Coca-Cola 1.5L', 'Bebida gaseosa original', 2490.00,
   'https://rapidaysabrosa.cl/img/coca-cola.jpg', 3, true, 0, NULL),

  ('Agua Mineral 600ml', 'Agua purificada sin gas', 1490.00,
   'https://rapidaysabrosa.cl/img/agua.jpg', 3, true, 0, NULL),

  -- 🍮 Postres
  ('Tiramisú', 'Postre frío con café, cacao y mascarpone', 3990.00,
   'https://rapidaysabrosa.cl/img/tiramisu.jpg', 4, true, 0, NULL),

  ('Brownie con helado', 'Brownie artesanal con helado de vainilla', 4490.00,
   'https://rapidaysabrosa.cl/img/brownie.jpg', 4, true, 0, NULL);

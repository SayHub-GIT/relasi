-- Insert dummy data for Relasi Store laptop catalog
INSERT INTO laptops (name, description, condition, year, price, specs, image_url, is_sold_out) VALUES
(
  'MacBook Pro 14" M3 Max',
  'Powerful professional laptop with stunning Retina display. Perfect for creative professionals and developers.',
  'new',
  2024,
  35000000,
  '{"processor":"Apple M3 Max", "ram":"24GB", "storage":"512GB SSD", "display":"14-inch Liquid Retina XDR", "gpu":"GPU 16-core"}'::jsonb,
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
  false
),
(
  'Dell XPS 15 Plus',
  'Premium ultrabook with InfinityEdge display and powerful performance. Ideal for professionals on the go.',
  'new',
  2024,
  28000000,
  '{"processor":"Intel Core i7-13700H", "ram":"32GB", "storage":"1TB SSD", "display":"15.6-inch OLED", "gpu":"RTX 4070"}'::jsonb,
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&h=500&fit=crop',
  false
),
(
  'Lenovo ThinkPad X1 Carbon',
  'Business-class ultrabook built tough. Premium build quality and excellent keyboard.',
  'second',
  2023,
  18000000,
  '{"processor":"Intel Core i7-1365U", "ram":"16GB", "storage":"512GB SSD", "display":"14-inch 2.8K OLED", "gpu":"Iris Xe"}'::jsonb,
  'https://images.unsplash.com/photo-1588872657840-218e412ee914?w=500&h=500&fit=crop',
  false
),
(
  'ASUS ROG Zephyrus G16',
  'High-performance gaming laptop with next-gen graphics and blazing-fast refresh rates.',
  'new',
  2024,
  42000000,
  '{"processor":"Intel Core i9-14900H", "ram":"32GB", "storage":"2TB SSD", "display":"16-inch 240Hz", "gpu":"RTX 4090"}'::jsonb,
  'https://images.unsplash.com/photo-1551288049-bebda4e267f71?w=500&h=500&fit=crop',
  false
),
(
  'HP Pavilion 15',
  'Budget-friendly laptop for everyday tasks. Great battery life and reliable performance.',
  'second',
  2022,
  8000000,
  '{"processor":"AMD Ryzen 5 5500U", "ram":"8GB", "storage":"256GB SSD", "display":"15.6-inch FHD", "gpu":"Radeon Vega"}'::jsonb,
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
  false
),
(
  'Framework Laptop 13.3"',
  'Modular and repairable laptop. Customize and upgrade your way. Right to repair champion.',
  'new',
  2024,
  18000000,
  '{"processor":"Intel Core Ultra 7", "ram":"32GB", "storage":"1TB SSD", "display":"13.3-inch 3:2 2560x1700", "gpu":"Intel Arc"}'::jsonb,
  'https://images.unsplash.com/photo-1588872657840-218e412ee914?w=500&h=500&fit=crop',
  true
),
(
  'MSI GE76 Raider',
  'Gaming beast with high refresh rate display. Designed for competitive gaming.',
  'second',
  2023,
  22000000,
  '{"processor":"Intel Core i7-12700H", "ram":"16GB", "storage":"512GB SSD", "display":"17.3-inch 144Hz", "gpu":"RTX 3070 Ti"}'::jsonb,
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
  false
),
(
  'Apple MacBook Air M2',
  'Lightweight and powerful. The perfect everyday laptop for students and professionals.',
  'new',
  2023,
  24000000,
  '{"processor":"Apple M2", "ram":"16GB", "storage":"512GB SSD", "display":"13.6-inch Liquid Retina", "gpu":"GPU 10-core"}'::jsonb,
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
  false
);

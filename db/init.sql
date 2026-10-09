-- BỔ SUNG 30 SẢN PHẨM MỚI CHO POS SYSTEM (ID từ 7 đến 36)
INSERT INTO products (id, name, category_id, price, stock) VALUES
-- Đồ uống (category_id = 1)
(7, 'Cà phê sữa Nescafé 180ml', 1, 15000, 120),
(8, 'Trà xanh C2 hương chanh 455ml', 1, 8000, 200),
(9, 'Trà ô long Tea+ Plus 455ml', 1, 10000, 150),
(10, 'Sữa tươi Vinamilk có đường 220ml', 1, 9500, 180),
(11, 'Sữa hạt óc chó TH True Milk 180ml', 1, 14000, 90),
(12, 'Bia Heineken lon 330ml', 1, 21000, 300),
(13, 'Bia Saigon Chill lon 330ml', 1, 17000, 250),
(14, 'Nước tăng lực Redbull 250ml', 1, 13000, 110),

-- Bánh kẹo (category_id = 2)
(15, 'Bánh ChocoPie hộp 6 cái', 2, 35000, 60),
(16, 'Bánh quy Cosy Marie 136g', 2, 18000, 85),
(17, 'Kẹo mút Chupa Chups vị dâu', 2, 2000, 500),
(18, 'Socola KitKat thanh 35g', 2, 16000, 100),
(19, 'Bánh xốp Nabati phô mai 140g', 2, 12000, 140),
(20, 'Kẹo ngậm C_C200 vị cam', 2, 7000, 220),

-- Mì & Thực phẩm ăn liền (category_id = 3)
(21, 'Mì 3 Miền tôm chua cay', 3, 4500, 300),
(22, 'Phở bò VIFON gói 65g', 3, 8500, 120),
(23, 'Mì trộn Koreno vị cay Hàn Quốc', 3, 13500, 95),
(24, 'Cháo ăn liền Yến Việt vị gà', 3, 11000, 70),
(25, 'Xúc xích tiệt trùng Ponnie 4 cây', 3, 19000, 160),

-- Gia vị & Đồ khô (category_id = 4)
(26, 'Nước mắm Nam Ngư 500ml', 4, 32000, 50),
(27, 'Dầu ăn Tường An Slim 1 Lit', 4, 48000, 40),
(28, 'Hạt nêm Knorr thịt thăn 400g', 4, 38000, 65),
(29, 'Tương ớt Chinsu 250g', 4, 14000, 130),
(30, 'Muối I-ốt Vifon 500g', 4, 5000, 200),
(31, 'Gạo thơm Jasmine 5kg', 4, 125000, 30),

-- Hóa mỹ phẩm & Giấy (category_id = 5)
(32, 'Dầu gội Clear mát lạnh 170g', 5, 52000, 45),
(33, 'Sữa tắm Lifebuoy bảo vệ vượt trội 200g', 5, 45000, 55),
(34, 'Kem đánh răng P/S 180g', 5, 28000, 80),
(35, 'Nước rửa chén Sunlight chanh 750g', 5, 31000, 75),
(36, 'Khăn giấy rút Pulppy 180 tờ', 5, 22000, 110)
ON DUPLICATE KEY UPDATE 
  name=VALUES(name), 
  category_id=VALUES(category_id), 
  price=VALUES(price), 
  stock=VALUES(stock);
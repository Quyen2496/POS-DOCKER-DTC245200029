SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS pos_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE pos_db;

-- =========================================
-- BẢNG LOẠI SẢN PHẨM
-- =========================================

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- BẢNG NGƯỜI DÙNG
-- =========================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STAFF') NOT NULL DEFAULT 'STAFF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- BẢNG KHÁCH HÀNG
-- =========================================

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- BẢNG SẢN PHẨM
-- =========================================

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
);

-- =========================================
-- BẢNG HÓA ĐƠN
-- =========================================

CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    user_id INT NOT NULL,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoices_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id),

    CONSTRAINT fk_invoices_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

-- =========================================
-- CHI TIẾT HÓA ĐƠN
-- =========================================

CREATE TABLE invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,

    CONSTRAINT fk_invoice_items_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(id),

    CONSTRAINT fk_invoice_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
);

-- =========================================
-- DỮ LIỆU LOẠI SẢN PHẨM
-- =========================================

INSERT INTO categories (name) VALUES
('Đồ uống'),
('Bánh kẹo'),
('Mì ăn liền'),
('Đồ gia dụng'),
('Sữa');

-- =========================================
-- DỮ LIỆU TÀI KHOẢN
-- =========================================

INSERT INTO users (username, password, role) VALUES
('admin', 'Admin@123456', 'ADMIN'),
('staff', 'Staff@123456', 'STAFF');

-- =========================================
-- DỮ LIỆU KHÁCH HÀNG
-- =========================================

INSERT INTO customers (name, phone) VALUES
('Nguyễn Văn An', '0901000001'),
('Trần Thị Bình', '0901000002'),
('Lê Văn Cường', '0901000003');

-- =========================================
-- DỮ LIỆU SẢN PHẨM
-- =========================================

INSERT INTO products
(category_id, name, price, stock)
VALUES

(1, 'Coca Cola 330ml', 10000, 100),
(1, 'Pepsi 330ml', 10000, 80),
(1, 'Sting dâu', 12000, 60),
(1, 'Aquafina 500ml', 7000, 150),

(2, 'Bánh Oreo', 15000, 50),
(2, 'Snack khoai tây', 12000, 70),
(2, 'Kẹo dẻo trái cây', 20000, 40),

(3, 'Mì Hảo Hảo tôm chua cay', 5000, 200),
(3, 'Mì Omachi', 12000, 100),

(4, 'Nước rửa chén', 25000, 40),
(4, 'Khăn giấy', 18000, 60),

(5, 'Sữa tươi Vinamilk', 32000, 80),
(5, 'Sữa chua Vinamilk', 10000, 100);

-- =========================================
-- DỮ LIỆU HÓA ĐƠN MẪU
-- =========================================

INSERT INTO invoices (id, customer_id, user_id, total) VALUES
(1, 1, 2, 35000.00),
(2, 2, 2, 52000.00);
-- =========================================
-- CHI TIẾT HÓA ĐƠN MẪU
-- =========================================
INSERT INTO invoice_items
(invoice_id, product_id, quantity, price, subtotal)
VALUES
(1, 1, 2, 10000.00, 20000.00),
(1, 5, 1, 15000.00, 15000.00),
(2, 2, 2, 10000.00, 20000.00),
(2, 12, 1, 32000.00, 32000.00);

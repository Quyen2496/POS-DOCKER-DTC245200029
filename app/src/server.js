const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();

const PORT = process.env.APP_PORT || 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.MYSQL_USER || "pos_app",
  password: process.env.MYSQL_PASSWORD || "PosApp@2026!Strong",
  database: process.env.MYSQL_DATABASE || "pos_db",
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

/*
 * Health check
 */
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "OK",
      message: "POS application is running",
      database: "connected"
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: error.message
    });
  }
});

/*
 * Categories
 */
app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, created_at
      FROM categories
      ORDER BY id
    `);

    res.json({
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot load categories",
      error: error.message
    });
  }
});

/*
 * Products
 */
app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.price,
        p.stock,
        c.name AS category_name,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.id
    `);

    res.json({
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot load products",
      error: error.message
    });
  }
});

/*
 * Customers
 */
app.get("/api/customers", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, phone, created_at
      FROM customers
      ORDER BY id
    `);

    res.json({
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot load customers",
      error: error.message
    });
  }
});

/*
 * Invoices
 */
app.get("/api/invoices", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        i.id,
        i.total,
        i.created_at,
        c.name AS customer_name,
        u.username AS cashier
      FROM invoices i
      LEFT JOIN customers c ON c.id = i.customer_id
      INNER JOIN users u ON u.id = i.user_id
      ORDER BY i.id DESC
    `);

    res.json({
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot load invoices",
      error: error.message
    });
  }
});

/*
 * Inventory
 */
app.get("/api/inventory", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.name,
        c.name AS category_name,
        p.stock,
        p.price,
        CASE
          WHEN p.stock = 0 THEN 'OUT_OF_STOCK'
          WHEN p.stock <= 10 THEN 'LOW_STOCK'
          ELSE 'AVAILABLE'
        END AS stock_status
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.stock ASC, p.id ASC
    `);

    res.json({
      data: rows,
      total: rows.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot load inventory",
      error: error.message
    });
  }
});

/*
 * Dashboard summary
 */
app.get("/api/dashboard", async (req, res) => {
  try {
    const [[products]] = await pool.query(
      "SELECT COUNT(*) AS total FROM products"
    );

    const [[categories]] = await pool.query(
      "SELECT COUNT(*) AS total FROM categories"
    );

    const [[customers]] = await pool.query(
      "SELECT COUNT(*) AS total FROM customers"
    );

    const [[invoices]] = await pool.query(
      "SELECT COUNT(*) AS total FROM invoices"
    );

    const [[revenue]] = await pool.query(
      "SELECT COALESCE(SUM(total), 0) AS total FROM invoices"
    );

    res.json({
      products: products.total,
      categories: categories.total,
      customers: customers.total,
      invoices: invoices.total,
      revenue: revenue.total
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot load dashboard",
      error: error.message
    });
  }
});

/*
 * Frontend fallback
 */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`POS application running on port ${PORT}`);
});

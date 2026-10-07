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
 * Create invoice
 */
app.post("/api/invoices", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { customer_id, user_id, items } = req.body;

    // Validate request
    if (!user_id) {
      return res.status(400).json({
        message: "user_id is required"
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "items must be a non-empty array"
      });
    }

    await connection.beginTransaction();

    // Check user
    const [users] = await connection.query(
      `
      SELECT id, username, role
      FROM users
      WHERE id = ?
      `,
      [user_id]
    );

    if (users.length === 0) {
      throw new Error("User not found");
    }

    // Check customer if provided
    if (customer_id !== null && customer_id !== undefined) {
      const [customers] = await connection.query(
        `
        SELECT id
        FROM customers
        WHERE id = ?
        `,
        [customer_id]
      );

      if (customers.length === 0) {
        throw new Error("Customer not found");
      }
    }

    let total = 0;
    const invoiceItems = [];

    // Check products and stock
    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(productId) || productId <= 0) {
        throw new Error("Invalid product_id");
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Quantity must be a positive integer");
      }

      const [products] = await connection.query(
        `
        SELECT id, name, price, stock
        FROM products
        WHERE id = ?
        FOR UPDATE
        `,
        [productId]
      );

      if (products.length === 0) {
        throw new Error(`Product ${productId} not found`);
      }

      const product = products[0];

      if (product.stock < quantity) {
        throw new Error(
          `Insufficient stock for product "${product.name}". Available: ${product.stock}`
        );
      }

      const price = Number(product.price);
      const subtotal = price * quantity;

      total += subtotal;

      invoiceItems.push({
        product_id: product.id,
        quantity,
        price,
        subtotal
      });
    }

    // Create invoice
    const [invoiceResult] = await connection.query(
      `
      INSERT INTO invoices
        (customer_id, user_id, total)
      VALUES
        (?, ?, ?)
      `,
      [
        customer_id || null,
        user_id,
        total
      ]
    );

    const invoiceId = invoiceResult.insertId;

    // Create invoice items and decrease stock
    for (const item of invoiceItems) {
      await connection.query(
        `
        INSERT INTO invoice_items
          (invoice_id, product_id, quantity, price, subtotal)
        VALUES
          (?, ?, ?, ?, ?)
        `,
        [
          invoiceId,
          item.product_id,
          item.quantity,
          item.price,
          item.subtotal
        ]
      );

      await connection.query(
        `
        UPDATE products
        SET stock = stock - ?
        WHERE id = ?
        `,
        [
          item.quantity,
          item.product_id
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: "Invoice created successfully",
      data: {
        id: invoiceId,
        customer_id: customer_id || null,
        user_id,
        total,
        items: invoiceItems
      }
    });
  } catch (error) {
    await connection.rollback();

    res.status(400).json({
      message: "Cannot create invoice",
      error: error.message
    });
  } finally {
    connection.release();
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

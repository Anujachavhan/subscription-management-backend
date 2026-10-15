
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


const db = require("./db");

app.get("/api/subscriptions", (req, res) => {
  db.query("SELECT * FROM subscriptions", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});


app.post("/api/subscriptions", (req, res) => {
  const {
    user_email,
    plan_name,
    start_date,
    end_date,
    monthly_cost,
    status,
  } = req.body;

  if (
    !user_email ||
    !plan_name ||
    !start_date ||
    !end_date ||
    monthly_cost === undefined ||
    monthly_cost === null ||
    !status
  ) {
    return res.status(400).json({
      error: "All subscription fields are required.",
    });
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user_email) ||
    new Date(end_date) < new Date(start_date) ||
    !Number.isFinite(Number(monthly_cost)) ||
    Number(monthly_cost) < 0 ||
    !["Active", "Expired", "Cancelled"].includes(status)
  ) {
    return res.status(400).json({
      error: "Please check the subscription details.",
    });
  }

  const sql = `
    INSERT INTO subscriptions
    (user_email, plan_name, start_date, end_date, monthly_cost, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [user_email, plan_name, start_date, end_date, monthly_cost, status],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Subscription created successfully!",
        subscription_id: result.insertId,
      });
    }
  );
});


app.put("/api/subscriptions/:id", (req, res) => {
  const {
    user_email,
    plan_name,
    start_date,
    end_date,
    monthly_cost,
    status,
  } = req.body;

  if (
    !user_email ||
    !plan_name ||
    !start_date ||
    !end_date ||
    monthly_cost === undefined ||
    monthly_cost === null ||
    !status
  ) {
    return res.status(400).json({
      error: "All subscription fields are required.",
    });
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user_email) ||
    new Date(end_date) < new Date(start_date) ||
    !Number.isFinite(Number(monthly_cost)) ||
    Number(monthly_cost) < 0 ||
    !["Active", "Expired", "Cancelled"].includes(status)
  ) {
    return res.status(400).json({
      error: "Please check the subscription details.",
    });
  }

  const sql = `
    UPDATE subscriptions
    SET user_email = ?, plan_name = ?, start_date = ?,
        end_date = ?, monthly_cost = ?, status = ?
    WHERE subscription_id = ?
  `;

  db.query(
    sql,
    [
      user_email,
      plan_name,
      start_date,
      end_date,
      monthly_cost,
      status,
      req.params.id,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "Subscription not found.",
        });
      }

      res.json({
        message: "Subscription updated successfully!",
      });
    }
  );
});



app.delete("/api/subscriptions/:id", (req, res) => {
  const sql =
    "DELETE FROM subscriptions WHERE subscription_id = ?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Subscription not found.",
      });
    }

    res.json({
      message: "Subscription deleted successfully!",
    });
  });
});

app.get("/", (req, res) => {
  res.send("Subscription Management API is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

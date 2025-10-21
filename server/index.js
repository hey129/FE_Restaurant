// Restaurant Backend Server
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paymentRoutes from "./routes/payment.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/momo", paymentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Restaurant server is running",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Restaurant Payment Server",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      payment: {
        create: "POST /api/momo/create-payment",
        ipn: "POST /api/momo/ipn",
        callback: "GET /api/momo/callback",
        query: "POST /api/momo/query-status",
      },
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(" Server error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(" Restaurant Server started");
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(` MoMo endpoint: ${process.env.MOMO_ENDPOINT}`);

  // Check Supabase configuration
  const hasSupabaseUrl = !!process.env.SUPABASE_URL;
  const hasSupabaseKey = !!process.env.SUPABASE_ANON_KEY;
  console.log(
    ` Supabase URL: ${hasSupabaseUrl ? "✓ Configured" : "✗ Missing"}`
  );
  console.log(
    ` Supabase Key: ${hasSupabaseKey ? "✓ Configured" : "✗ Missing"}`
  );

  console.log("");
  console.log("Available routes:");
  console.log("  GET  / - Server info");
  console.log("  GET  /health - Health check");
  console.log("  POST /api/momo/create-payment - Create MoMo payment");
  console.log("  POST /api/momo/ipn - MoMo IPN callback");
  console.log("  GET  /api/momo/callback - MoMo redirect callback");
  console.log("  POST /api/momo/query-status - Query payment status");
});

export default app;

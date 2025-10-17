// Payment Routes
import express from "express";
import {
  createPayment,
  handleIPN,
  handleCallback,
  queryPaymentStatus,
} from "../controllers/momoController.js";

const router = express.Router();

// Create MoMo payment
router.post("/create-payment", createPayment);

// MoMo IPN callback
router.post("/ipn", handleIPN);

// MoMo redirect callback
router.get("/callback", handleCallback);

// Query payment status
router.post("/query-status", queryPaymentStatus);

export default router;

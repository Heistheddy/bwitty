import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";




dotenv.config();
const app = express();
app.use(express.json());
// ✅ Enable CORS
app.use(cors({
  origin: "http://localhost:5173", // frontend origin
  credentials: true,
}));
// Initialize payment
app.post("/api/paystack/init", async (req, res) => {
  const { email, amount } = req.body;
  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, amount }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

// ✅ Verify payment
app.post("/api/verify-payment", async (req, res) => {
  const { reference } = req.body;

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.status && data.data.status === "success") {
      res.json({ success: true, data: data.data });
    } else {
      res.json({ success: false, data: data.data });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Payment verification failed" });
  }
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));

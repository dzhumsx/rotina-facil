const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Rotina Fácil API is running" });
});

// Webhook endpoint
app.post("/webhook", (req, res) => {
  console.log("Webhook received:", req.body);
  res.json({ message: "Webhook recebido com sucesso!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
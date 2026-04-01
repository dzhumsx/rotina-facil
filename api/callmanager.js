const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Rotina Fácil API is running" });
    console.log("System ok")
});

// Webhook endpoint
app.post("/webhook", (req, res) => {
    console.log("Webhook received:", req.body);
    res.json({ message: "Webhook recebido com sucesso!" });
});

app.get("/api/message", async (req, res) => {
    try {
        // Função assíncrona que retorna uma string para o cliente
        res.send("Conectado pela api callmanager");
    } catch (error) {
        res.status(500).send("Erro no servidor");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
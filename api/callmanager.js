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
        res.status(500).send("Erro na api");
    }
});

app.get("/api/test-server", async (req, res) => {
    try {
        const result = await testServer();
        res.send(result);
    } catch (error) {
        res.status(500).send("Erro ao executar testServer");
    }
});

async function testServer() {
    console.log("API testServer executing...");
    try {
        // Corrigido para http:// (tráfego interno local) e utilizando await
        const response = await fetch("http://rotina-facil.railway.internal:8080/api/message");
        const data = await response.text();
        console.log("Resposta do servidor (/api/message):", data);
        return data;
    } catch (err) {
        console.error("Erro ao conectar na API:", err.message);
        return "Falhou o testServer: " + err.message;
    }
}

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
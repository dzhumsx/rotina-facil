require('dotenv').config();
const express = require("express");
const cors = require("cors");
const db = require('./data/db');
const credentials = btoa(process.env.USER + ':' + process.env.PASSWORD);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const requireAuth = (req, res, next) => {
    // Access the header using req.headers
    const authHeader = req.headers['authorization'];

    // Basic check: Does the header exist?
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    // Example: Verify a simple static Bearer token
    if (authHeader !== credentials) {
        return res.status(403).json({ error: 'Invalid token, recieved: ' + authHeader + ';expected: ' + credentials });
    }

    // If valid, proceed to the next function
    next();
};

// Health check
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Rotina Fácil Server is running" });
});

app.get("/api/message", async (req, res) => {
    try {
        // Função assíncrona que retorna uma string para o cliente
        res.send("Conectado ao server principal");
    } catch (error) {
        res.status(500).send("Erro no servidor");
    }
});

app.get("/api/database", async (req, res) => {
    try {
        res.send("Conectado ao database principal");
    } catch (error) {
        res.status(500).send("Erro no servidor interno");
    }
});

// Create a new route to get a user by ID
app.get("/api/user/:id", requireAuth, async (req, res) => {
    try {
        const result = await getUser(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).send("Erro ao executar getUser");
    }
});

async function getUser(userId) {
    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        return result.rows[0] || "Usuário não encontrado";
    } catch (err) {
        console.error("Erro ao conectar na API:", err.message);
        return "Falhou o getUser: " + err.message;
    }
}

// Chama a inicialização de tabelas e usuários do banco ao iniciar a aplicação
db.initDb();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
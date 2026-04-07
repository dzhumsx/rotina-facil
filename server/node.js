require('dotenv').config();
const express = require("express");
const cors = require("cors");
const db = require('./data/db');
const jwt = require('jsonwebtoken');

const auth = require('./auth');

const KEY = btoa(process.env.KEY);

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// Ativando os webhooks do auth.js
app.use(auth.router);

//Query tasks from user
app.post("/api/queryTask", auth.requireAuth, async (req, res) => {
    try {
        const token = req.body.jwt;
        const userId = jwt.verify(token, KEY).userId;
        console.log("User ID: " + userId);
        const result = await queryTasks(userId);
        res.status(200).send(result);
    } catch (err) {
        console.error("Erro ao conectar na API de task:", err.message);
        res.status(500).send("Falhou o queryTask: " + err.message);
    }
});

async function queryTasks(userId) {
    try {
        const result = await db.query('SELECT * FROM tasks WHERE userId = $1', [userId]);
        return result.rows || "Nenhuma tarefa encontrada";
    } catch (err) {
        console.error("Erro ao conectar na API:", err.message);
        return "Falhou o queryTasks: " + err.message;
    }
}

app.post("/api/createTask", auth.requireAuth, async (req, res) => {

    try {
        const token = req.body.jwt;
        const userId = jwt.verify(token, KEY).userId;
        const { title, description } = req.body;
        const result = await createTask(userId, title, description);
        res.status(200).send(result);
    } catch (err) {
        console.error("Erro ao conectar na API de task:", err.message);
        res.status(401).send("Falhou o createTask: " + err.message);
    }

});

async function createTask(userId, title, description) {
    try {
        let id = Math.floor(Math.random() * 999999999) + 1;
        checkId = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
        while (checkId.rows[0]) {
            id = Math.floor(Math.random() * 999999999) + 1;
            checkId = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
        }
        const result = await db.query('INSERT INTO tasks (id, userId, title, description) VALUES ($1, $2, $3, $4)', [id, userId, title, description]);
        return result.rows[0] || "Tarefa criada com sucesso";
    } catch (err) {
        console.error("Erro ao conectar na API:", err.message);
        return "Falhou o createTask: " + err.message;
    }
}


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const db = require('./data/db');
const jwt = require('jsonwebtoken');

const sha512 = require('js-sha512');



const KEY = btoa(process.env.KEY);
let VerificationToken = "";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());


//Register User
app.post("/api/register", async (req, res) => {
    const { nome, user, password } = req.body;

    //Check if registered
    checkDuplicate = await db.query('SELECT * FROM auth WHERE email = $1', [user]);
    if (checkDuplicate.rows[0]) {
        return res.status(400).send("Usuário já cadastrado");
    }

    //Generate Unique ID
    let id = Math.floor(Math.random() * 9999) + 1;
    checkId = await db.query('SELECT * FROM auth WHERE id = $1', [id]);
    while (checkId.rows[0]) {
        id = Math.floor(Math.random() * 9999) + 1;
        checkId = await db.query('SELECT * FROM auth WHERE id = $1', [id]);
    }

    const hashedPassword = sha512(password);
    const result = await db.query('INSERT INTO auth (id, nome, email, senha) VALUES ($1, $2, $3, $4)', [id, nome, user, hashedPassword]);
    console.log(result)
    res.status(200).send("Usuário registrado com sucesso");
});

//Sing JWT Token
app.post("/api/getToken", async (req, res) => {
    // Access the header using req.headers
    const authHeader = req.headers['authorization'];

    // Basic check: Does the header exist?
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    // Example: Verify a simple static Bearer token
    if (authHeader !== btoa(process.env.TOKEN_GEN_KEY)) {
        return res.status(403).json({ error: 'Invalid call' });
    }

    const userName = await validateUser(req.body.user, req.body.password);
    if (userName == false) {
        return res.status(401).json({ error: 'Invalid user or password' });
    }

    const userId = await getUserId(req.body.user);
    if (userId == false) {
        return res.status(401).json({ error: 'Invalid user or password' });
    }

    // Salva o token fornecido pelo cliente para uso pelo middleware de autentição requireAuth
    const { user, password } = req.body;

    VerificationToken = await generateJWT(userId, userName, user, password);
    res.status(200).send(VerificationToken); // Retorna o JWT real para a web!
    console.log("Token JWT gerado e registrado: " + VerificationToken);
});

async function validateUser(user, password) {
    try {
        const result = await db.query('SELECT nome FROM auth WHERE email = $1 AND senha = $2', [user, sha512(password)]);
        if (result.rows[0]) {
            return result.rows[0].nome;
        } else {
            return false;
        }
    } catch (err) {
        console.error("Erro ao conectar na API:", err.message);
        return "Falha na validação: " + err.message;
    }
}

async function getUserId(user) {
    try {
        const result = await db.query('SELECT id FROM auth WHERE email = $1', [user]);
        if (result.rows[0]) {
            return result.rows[0].id;
        } else {
            return false;
        }
    } catch {
        return false;
    }
}

//Gera o Token
async function generateJWT(userId, userName, user, password) {
    token = jwt.sign(
        { userId: userId, userName: userName, user: user, password: password },
        KEY,
        { algorithm: 'HS512', expiresIn: '1h' }
    );

    return token;
}

//Check if token is valid
const requireAuth = (req, res, next) => {
    // Access the header using req.headers]
    const authHeader = req.headers['authorization'];

    // Basic check: Does the header exist?
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    // Example: Verify a simple static Bearer token
    try {
        jwt.verify(authHeader, KEY);
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token, recieved: ' + authHeader });
    }

    next();
}

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



//Função de checar token
app.get("/api/checkToken", requireAuth, async (req, res) => {
    try {
        var decoded = jwt.verify(VerificationToken, KEY);
        res.send(decoded.userName);
    } catch (error) {
        res.status(403).send("Erro ao executar checkToken");
    }
});

//Query tasks from user
app.post("/api/queryTask", requireAuth, async (req, res) => {
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



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
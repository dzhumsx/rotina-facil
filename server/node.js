require('dotenv').config();
const express = require("express");
const cors = require("cors");

const auth = require('./auth');
const tasks = require('./managetasks');

const app = express();
const PORT = process.env.PORT;

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS.split(',')
};

app.use(cors(corsOptions));
app.use(express.json());

// Ativando os webhooks do auth.js
app.use(auth.router);
app.use(tasks.router);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const { Pool } = require('pg');

// Configure connection details
const pool = new Pool({
    // Utilizamos a string inteira de conexão porque a Railway providencia uma proxy externa específica:
    connectionString: process.env.DATABASE_URL,

    // Configuração de SSL para poder se conectar de modo externo se necessário
    ssl: process.env.NODE_ENV === "production" ? false : { rejectUnauthorized: false }
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};
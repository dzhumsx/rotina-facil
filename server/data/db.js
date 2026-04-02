const { Pool } = require('pg');

// Configure connection details
const pool = new Pool({
    // Utilizamos a string inteira de conexão porque a Railway providencia uma proxy externa específica:
    connectionString: process.env.DATABASE_URL || "fallback url",

    // Configuração de SSL para poder se conectar de modo externo se necessário
    ssl: process.env.NODE_ENV === "production" ? false : { rejectUnauthorized: false }
});

// Inicialização automática do banco e criação dos usuários
const initDb = async () => {
    try {
        // Criar a tabela se não existir
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                nome VARCHAR(100),
                email VARCHAR(100)
            );
        `);

        // Criar 3 usuários com ids 1, 2 e 3 caso não existam
        const ids = [1, 2, 3];
        for (let i of ids) {
            const res = await pool.query('SELECT id FROM users WHERE id = $1', [i]);
            if (res.rowCount === 0) {
                await pool.query(
                    'INSERT INTO users (id, nome, email) VALUES ($1, $2, $3)',
                    [i, `Usuário ${i}`, `usuario${i}@rotinafacil.com`]
                );
                console.log(`Usuário ${i} inserido no banco de dados!`);
            }
        }
    } catch (err) {
        console.error("Erro ao inicializar o banco de dados:", err.message);
    }
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    initDb
};
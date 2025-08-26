const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'secrets-db.json');
const API_KEY = process.env.VAULT_API_KEY;

const apiKeyAuth = (req, res, next) => {
    const providedKey = req.headers['x-api-key'];
    if (!API_KEY || providedKey !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
    next();
};

const readDb = async () => {
    try {
        await fs.access(DB_PATH);
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
};

app.post('/secrets', apiKeyAuth, async (req, res) => {
    const secretData = req.body;
    if (!secretData || !secretData.Secret) {
        return res.status(400).json({ error: 'Invalid secret data provided' });
    }

    const db = await readDb();
    const id = crypto.randomBytes(8).toString('hex');
    db[id] = { ...secretData, receivedAt: new Date().toISOString() };

    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`[Vault Server] Secret ${id} stored successfully.`);
    res.status(201).json({ message: 'Secret stored', id });
});

app.get('/secrets/:id', apiKeyAuth, async (req, res) => {
    const db = await readDb();
    const secret = db[req.params.id];

    if (!secret) {
        return res.status(404).json({ error: 'Secret not found' });
    }
    res.status(200).json(secret);
});

app.listen(PORT, () => {
    console.log(`[Vault Server] Self-hosted vault running on http://localhost:${PORT}`);
    if (!API_KEY) {
        console.warn('[Vault Server] WARNING: VAULT_API_KEY is not set. The server is insecure.');
    }
});
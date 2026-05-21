const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'night_market'
});

db.connect(err => {
    if (err) console.error('DB Error:', err.message);
    else console.log('✅ MySQL Connected!');
});

// --- Stalls API ---
app.get('/api/stalls', (req, res) => {
    db.query('SELECT * FROM stalls', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/api/stalls', (req, res) => {
    const { market_id, name, category, latitude, longitude } = req.body;
    const sql = 'INSERT INTO stalls (market_id, name, category, latitude, longitude) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [market_id, name, category, latitude, longitude], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: '新增成功', id: result.insertId });
    });
});

app.delete('/api/stalls/:id', (req, res) => {
    db.query('DELETE FROM stalls WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: '刪除成功' });
    });
});

// --- Reviews API (Phase A) ---
app.get('/api/reviews/:stall_id', (req, res) => {
    db.query('SELECT * FROM reviews WHERE stall_id = ? ORDER BY created_at DESC', [req.params.stall_id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/api/reviews', (req, res) => {
    const { stall_id, user_name, rating, comment } = req.body;
    db.query('INSERT INTO reviews (stall_id, user_name, rating, comment) VALUES (?, ?, ?, ?)', 
    [stall_id, user_name, rating, comment], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: '評價成功' });
    });
});

app.listen(3000, () => console.log('🚀 Server running on port 3000'));
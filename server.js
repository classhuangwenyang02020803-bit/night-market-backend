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
    if (err) console.error('DB 連線失敗:', err.message);
    else console.log('✅ MySQL 商業大數據引擎連線成功！');
});

const adminAuth = (req, res, next) => {
    const token = req.headers['admin-token'];
    if (token === 'TaichungBestEat666') next();
    else res.status(403).json({ error: '拒絕存取：Token 驗證失敗' });
};

// 1. 取得所有店家（包含 description 描述）
app.get('/api/stalls', (req, res) => {
    db.query('SELECT * FROM stalls', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 2. 新增店家（納入 description）
app.post('/api/stalls', adminAuth, (req, res) => {
    const { market_id, name, category, latitude, longitude, description } = req.body;
    const sql = 'INSERT INTO stalls (market_id, name, category, latitude, longitude, description) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [market_id, name, category, latitude, longitude, description], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: '新增成功', id: result.insertId });
    });
});

// 3. 刪除店家
app.delete('/api/stalls/:id', adminAuth, (req, res) => {
    db.query('DELETE FROM stalls WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: '刪除成功' });
    });
});

// 4. 取得留言
app.get('/api/reviews/:stall_id', (req, res) => {
    db.query('SELECT * FROM reviews WHERE stall_id = ? ORDER BY created_at DESC', [req.params.stall_id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 5. 新增留言
app.post('/api/reviews', (req, res) => {
    const { stall_id, user_name, rating, comment } = req.body;
    db.query('INSERT INTO reviews (stall_id, user_name, rating, comment) VALUES (?, ?, ?, ?)', 
    [stall_id, user_name, rating, comment], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: '評價成功' });
    });
});

app.listen(3000, () => console.log('🚀 懂逛懂吃後端服務於 Port 3000 全力運作中'));
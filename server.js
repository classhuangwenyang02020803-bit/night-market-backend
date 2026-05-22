const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config(); // 💡 商業實務：引入環境變數保護敏感資料

const app = express();
app.use(cors());
app.use(express.json());

// 💡 商業實務：優先讀取雲端環境變數，若不存在才使用本地開發環境 (Fallback)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'night_market',
    port: process.env.DB_PORT || 3306
});

db.connect(err => {
    if (err) {
        console.error('❌ 雲端資料庫連線失敗:', err.message);
    } else {
        console.log('✅ 雲端 MySQL 商業大數據引擎連線成功！');
    }
});

const adminAuth = (req, res, next) => {
    const token = req.headers['admin-token'];
    // 💡 安全憑證同樣收納至環境變數
    const SECRET_TOKEN = process.env.ADMIN_TOKEN || 'TaichungBestEat666';
    if (token === SECRET_TOKEN) next();
    else res.status(403).json({ error: '拒絕存取：Token 驗證失敗' });
};

// 1. 取得所有店家
app.get('/api/stalls', (req, res) => {
    db.query('SELECT * FROM stalls', (err, results) => {
        if (err) return res.status(500).json({ error: '資料庫查詢失敗' });
        res.json(results);
    });
});

// 2. 新增店家
app.post('/api/stalls', adminAuth, (req, res) => {
    const { market_id, name, category, latitude, longitude, description } = req.body;
    const sql = 'INSERT INTO stalls (market_id, name, category, latitude, longitude, description) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [market_id, name, category, latitude, longitude, description], (err, result) => {
        if (err) return res.status(500).json({ error: '寫入失敗' });
        res.json({ message: '新增成功', id: result.insertId });
    });
});

// 3. 刪除店家
app.delete('/api/stalls/:id', adminAuth, (req, res) => {
    db.query('DELETE FROM stalls WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: '刪除失敗' });
        res.json({ message: '刪除成功' });
    });
});

// 4. 取得留言
app.get('/api/reviews/:stall_id', (req, res) => {
    db.query('SELECT * FROM reviews WHERE stall_id = ? ORDER BY created_at DESC', [req.params.stall_id], (err, results) => {
        if (err) return res.status(500).json({ error: '讀取留言失敗' });
        res.json(results);
    });
});

// 5. 新增留言
app.post('/api/reviews', (req, res) => {
    const { stall_id, user_name, rating, comment } = req.body;
    db.query('INSERT INTO reviews (stall_id, user_name, rating, comment) VALUES (?, ?, ?, ?)', 
    [stall_id, user_name, rating, comment], (err) => {
        if (err) return res.status(500).json({ error: '儲存留言失敗' });
        res.json({ message: '評價成功' });
    });
});

// 💡 商業實務：雲端平台上線時，Port 必須由 process.env.PORT 動態決定
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 懂逛懂吃後端服務於 Port ${PORT} 全力運作中`);
});
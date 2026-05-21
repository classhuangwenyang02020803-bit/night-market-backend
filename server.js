const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // 允許 Vue 跨網域來拿資料
app.use(express.json());

// 1. 設定 MySQL 連線 (XAMPP 預設環境)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',         
    password: '',         
    database: 'night_market' 
});

// 測試連線
db.connect((err) => {
    if (err) {
        console.error('資料庫連線失敗：', err.message);
        return;
    }
    console.log('✅ 成功連線到 MySQL 資料庫！');
});

// 2. 建立 API 路由：取得所有攤位
app.get('/api/stalls', (req, res) => {
    const sql = 'SELECT * FROM stalls';
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: '資料庫查詢失敗' });
        }
        res.json(results);
    });
});

// 3. 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 伺服器已啟動，請在瀏覽器打開 http://localhost:${PORT}/api/stalls`);
});
const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MySQL 연결 설정
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

// DB 및 테이블 초기화
async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
        await connection.end();

        const pool = mysql.createPool(dbConfig);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS analysis_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                saju_text VARCHAR(255),
                pillar_text VARCHAR(255),
                analysis_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database and Table initialized');
        return pool;
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
}

let pool;
initDB().then(p => pool = p);

// AI 분석 엔드포인트
app.post('/api/analyze', async (req, res) => {
    const { pillarText, sajuInfo, name } = req.body;

    if (!pillarText || !sajuInfo) {
        return res.status(400).json({ error: '사주 정보가 부족합니다.' });
    }

    try {
        // 1. AI 분석 요청 (백엔드에서 API KEY 사용)
        const prompt = `너는 현대적인 관점에서 사주를 해석하는 명리학 전문가야. 다음 사주 데이터를 바탕으로, 아래 각 주제에 대해 상세하게 풀이해줘.
이름: ${name || '익명'}
각 주제는 반드시 다음 형식을 따라서 '### 주제명'으로 시작해야 해: '### 직업운', '### 연애운', '### 재물운', '### 보완할 점과 장소'.

요구사항:
1. '### 보완할 점과 장소' 섹션에서는 사주의 단점을 가감 없이 냉철하게 분석하고, 이를 극복하기 위한 실천적인 코멘트를 3가지 이상 작성해줘.
2. 단점을 보완하고 기운을 북돋아 줄 수 있는 구체적인 장소(예: 깊은 산속, 조용한 도서관, 흐르는 강가, 탁 트인 광장 등)를 이유와 함께 추천해줘.
3. 답변은 마크다운 형식의 한국어로, 친근하고 이해하기 쉽게 작성해줘.

사주: ${pillarText}
일시: ${sajuInfo}`;

        const aiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.AI_MODEL}:generateContent?key=${process.env.AI_API_KEY}`;
        
        const aiResponse = await axios.post(aiUrl, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        const analysisData = aiResponse.data.candidates[0].content.parts[0].text;

        // 2. MySQL에 결과 저장
        if (pool) {
            await pool.query(
                'INSERT INTO analysis_results (name, saju_text, pillar_text, analysis_data) VALUES (?, ?, ?, ?)',
                [name || '익명', sajuInfo, pillarText, analysisData]
            );
            console.log('Analysis result saved to DB');
        }

        // 3. 결과 응답
        res.json({ analysis: analysisData });

    } catch (error) {
        console.error('Analysis error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'AI 분석 중 오류가 발생했습니다.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// api/analyze.js - Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pillarText, sajuInfo } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; // 환경 변수 사용 (보안!)
  const MODEL = 'gemini-1.5-flash';

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  
  const prompt = `너는 현대적인 관점에서 사주를 해석하는 명리학 전문가야. 다음 사주 데이터를 바탕으로, 아래 각 주제에 대해 상세하게 풀이해줘.
각 주제는 반드시 다음 형식을 따라서 '### 주제명'으로 시작해야해: '### 직업운', '### 연애운', '### 재물운'.
답변은 마크다운 형식의 한국어로, 친근하고 이해하기 쉽게 작성해줘.

사주: ${pillarText}
일시: ${sajuInfo}`;

  try {
    // 백엔드에서 서버측 재시도 로직 구현
    let response;
    let retries = 3;
    let backoff = 2000;

    for (let i = 0; i < retries; i++) {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (response.ok) break;
      if (response.status === 503 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2;
        continue;
      }
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

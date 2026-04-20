export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { pillarText, sajuInfo, name } = await request.json();

    if (!pillarText || !sajuInfo) {
      return new Response(JSON.stringify({ error: '사주 정보가 부족합니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Cloudflare Environment Variables (Must be set in CF Dashboard)
    const AI_API_KEY = env.AI_API_KEY;
    const AI_MODEL = env.AI_MODEL || 'gemini-1.5-flash';

    const prompt = `너는 현대적인 관점에서 사주를 해석하는 명리학 전문가야. 다음 사주 데이터를 바탕으로, 아래 각 주제에 대해 상세하게 풀이해줘.
이름: ${name || '익명'}
각 주제는 반드시 다음 형식을 따라서 '### 주제명'으로 시작해야 해: '### 직업운', '### 연애운', '### 재물운', '### 보완할 점과 장소'.

요구사항:
1. '### 보완할 점과 장소' 섹션에서는 사주의 단점을 가감 없이 냉철하게 분석하고, 이를 극복하기 위한 실천적인 코멘트를 3가지 이상 작성해줘.
2. 단점을 보완하고 기운을 북돋아 줄 수 있는 구체적인 장소(예: 깊은 산속, 조용한 도서관, 흐르는 강가, 탁 트인 광장 등)를 이유와 함께 추천해줘.
3. 답변은 마크다운 형식의 한국어로, 친근하고 이해하기 쉽게 작성해줘.

사주: ${pillarText}
일시: ${sajuInfo}`;

    const aiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${AI_API_KEY}`;

    const aiResponse = await fetch(aiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      return new Response(JSON.stringify({ error: 'AI 분석 요청 실패', details: errorData }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const aiData = await aiResponse.json();
    const analysisData = aiData.candidates[0].content.parts[0].text;

    // Note: Database (MySQL) is skipped as per request. 
    // If needed later, Cloudflare D1 or a fetch-based DB proxy should be used.

    return new Response(JSON.stringify({ analysis: analysisData }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: '서버 내부 오류', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

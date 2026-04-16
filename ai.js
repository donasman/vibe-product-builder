export const CONFIG = {
  API_KEY: 'AIzaSyCXl9anPpc8BfMz1jB3qj7b7ZTR31hp_h8',
  MODEL: 'gemini-1.5-flash',
  BASE_URL: 'https://generativelanguage.googleapis.com/v1'
};

export const createPrompt = (pillarText, sajuInfo, name) => {
  return `너는 현대적인 관점에서 사주를 해석하는 명리학 전문가야. 다음 사주 데이터를 바탕으로, 아래 각 주제에 대해 상세하게 풀이해줘.
이름: ${name || '익명'}
각 주제는 반드시 다음 형식을 따라서 '### 주제명'으로 시작해야 해: '### 직업운', '### 연애운', '### 재물운', '### 보완할 점과 장소'.

요구사항:
1. '### 보완할 점과 장소' 섹션에서는 사주의 단점을 가감 없이 냉철하게 분석하고, 이를 극복하기 위한 실천적인 코멘트를 3가지 이상 작성해줘.
2. 단점을 보완하고 기운을 북돋아 줄 수 있는 구체적인 장소(예: 깊은 산속, 조용한 도서관, 흐르는 강가, 탁 트인 광장 등)를 이유와 함께 추천해줘.
3. 답변은 마크다운 형식의 한국어로, 친근하고 이해하기 쉽게 작성해줘.

사주: ${pillarText}
일시: ${sajuInfo}`;
};

export async function fetchFullAnalysis(pillarText, sajuInfo, name, retries = 3, backoff = 2000, signal = null) {
  const url = `${CONFIG.BASE_URL}/models/${CONFIG.MODEL}:generateContent?key=${CONFIG.API_KEY}`;
  const prompt = createPrompt(pillarText, sajuInfo, name);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    signal
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `API 오류: ${response.status}`);
  }
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

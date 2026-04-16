export const CONFIG = {
  API_KEY: 'AIzaSyCXl9anPpc8BfMz1jB3qj7b7ZTR31hp_h8',
  MODEL: 'gemini-1.5-flash',
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models'
};

export const createPrompt = (pillarText, sajuInfo) => {
  return `너는 현대적인 관점에서 사주를 해석하는 명리학 전문가야. 다음 사주 데이터를 바탕으로, 아래 각 주제에 대해 상세하게 풀이해줘.
각 주제는 반드시 다음 형식을 따라서 '### 주제명'으로 시작해야해: '### 직업운', '### 연애운', '### 재물운'.
답변은 마크다운 형식의 한국어로, 친근하고 이해하기 쉽게 작성해줘.

사주: ${pillarText}
일시: ${sajuInfo}`;
};

export async function fetchFullAnalysis(pillarText, sajuInfo, retries = 3, backoff = 2000, signal = null) {
  const url = `${CONFIG.BASE_URL}/${CONFIG.MODEL}:generateContent?key=${CONFIG.API_KEY}`;
  const prompt = createPrompt(pillarText, sajuInfo);

  let response;
  for (let i = 0; i < retries; i++) {
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal
      });

      if (response.ok) break;
      if (response.status === 503 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2;
        continue;
      }
      throw new Error(`API 오류: ${response.status}`);
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(resolve => setTimeout(resolve, backoff));
      backoff *= 2;
    }
  }

  if (!response) throw new Error("API로부터 응답을 받지 못했습니다.");
  
  const data = await response.json();
  if (!data.candidates || !data.candidates[0].content) {
    throw new Error("API로부터 유효한 답변을 받지 못했습니다.");
  }
  return data.candidates[0].content.parts[0].text;
}

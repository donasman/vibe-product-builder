export const CONFIG = {
  BASE_URL: ''
};

export async function fetchFullAnalysis(pillarText, sajuInfo, name, retries = 3, backoff = 2000, signal = null) {
  const url = `${CONFIG.BASE_URL}/api/analyze`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pillarText, sajuInfo, name }),
      signal
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `서버 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis;
  } catch (e) {
    throw e;
  }
}

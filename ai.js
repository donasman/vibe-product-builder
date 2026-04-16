export async function fetchFullAnalysis(pillarText, sajuInfo, signal = null) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pillarText, sajuInfo }),
    signal
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '분석 중 오류 발생');
  
  return data.candidates[0].content.parts[0].text;
}


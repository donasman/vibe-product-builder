const yearSelectHeader = document.getElementById('yearSelectHeader');
const monthSelectHeader = document.getElementById('monthSelectHeader');
const calendarDays = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const selectedDateDisplay = document.getElementById('selectedDateDisplay');
const confirmBtn = document.getElementById('confirmBtn');
const hourSelect = document.getElementById('hourSelect');
const minuteSelect = document.getElementById('minuteSelect');
const resultContainer = document.getElementById('resultContainer');
const sajuTextDisplay = document.getElementById('sajuText');

// 기본 API 키 설정 (보안 주의: 공개 저장소 업로드 시 삭제 권장)
const DEFAULT_API_KEY = 'AIzaSyCXl9anPpc8BfMz1jB3qj7b7ZTR31hp_h8'; 

// AI Elements
const aiAnalysisBtn = document.getElementById('aiAnalysisBtn');
const aiLoading = document.getElementById('aiLoading');
const aiResultArea = document.getElementById('aiResultArea');
const aiContent = document.getElementById('aiContent');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const modelSelect = document.getElementById('modelSelect');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

let currentDate = new Date();
let selectedDate = null;
let currentPillars = null;

// Initialize Header Selects (1900 to 2100)
for (let i = 1900; i <= 2100; i++) {
  const opt = document.createElement('option');
  opt.value = i;
  opt.innerText = `${i}년`;
  yearSelectHeader.appendChild(opt);
}
for (let i = 1; i <= 12; i++) {
  const opt = document.createElement('option');
  opt.value = i - 1;
  opt.innerText = `${i}월`;
  monthSelectHeader.appendChild(opt);
}

// Initialize Time Selects
for (let i = 0; i < 24; i++) {
  const opt = document.createElement('option');
  opt.value = i;
  opt.innerText = `${i}시`;
  hourSelect.appendChild(opt);
}
for (let i = 0; i < 60; i += 5) {
  const opt = document.createElement('option');
  opt.value = i;
  opt.innerText = `${i}분`;
  minuteSelect.appendChild(opt);
}

const elementsMap = {
  '甲': 'wood', '乙': 'wood', '寅': 'wood', '卯': 'wood',
  '丙': 'fire', '丁': 'fire', '巳': 'fire', '午': 'fire',
  '戊': 'earth', '己': 'earth', '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
  '庚': 'metal', '辛': 'metal', '申': 'metal', '酉': 'metal',
  '壬': 'water', '癸': 'water', '亥': 'water', '子': 'water'
};

const elementsDesc = { 'wood': '나무(木)', 'fire': '불(火)', 'earth': '흙(土)', 'metal': '금(金)', 'water': '물(水)' };

const dayMasterInfo = {
  '甲': { title: '갑목(甲木) - 숲속의 큰 나무', desc: '강직하고 진취적이며 우두머리 기질이 있습니다. 성실하고 책임감이 강하지만, 때로는 고집이 세고 융통성이 부족할 수 있습니다.' },
  '乙': { title: '을목(乙木) - 유연한 꽃과 넝쿨', desc: '외유내강의 전형으로 환경 적응력이 뛰어납니다. 사교적이고 부드러우며 끈기가 있지만, 남에게 의지하려는 성향이 있을 수 있습니다.' },
  '丙': { title: '병화(丙火) - 하늘의 태양', desc: '밝고 열정적이며 추진력이 대단합니다. 화끈하고 뒤끝이 없지만, 성격이 급하고 다소 독단적일 수 있습니다.' },
  '丁': { title: '정화(丁火) - 따뜻한 등불과 촛불', desc: '예의 바르고 섬세하며 분석적인 면이 강합니다. 속정이 깊고 헌신적이지만, 생각이 많아 예민해지기 쉽습니다.' },
  '戊': { title: '무토(戊土) - 믿음직한 태산', desc: '중심을 잘 잡고 포용력이 넓어 신뢰를 줍니다. 우직하고 듬직하지만, 변화를 싫어하고 다소 무뚝뚝할 수 있습니다.' },
  '己': { title: '기토(己土) - 비옥한 전답', desc: '조용하고 현실적이며 어머니와 같은 자애로움이 있습니다. 성실하고 적응력이 좋으나, 우유부단하게 보일 수 있습니다.' },
  '庚': { title: '경금(庚金) - 단단한 무쇠와 도끼', desc: '의리가 깊고 결단력이 강하며 불의를 참지 못합니다. 리더십이 뛰어나지만, 말투가 직설적이고 차가운 인상을 줄 수 있습니다.' },
  '辛': { title: '신금(辛金) - 정교한 보석과 칼', desc: '섬세하고 깔끔하며 명예를 소중히 여깁니다. 자존심이 강하고 매사에 정확하지만, 다소 까다롭고 예민할 수 있습니다.' },
  '壬': { title: '임수(壬水) - 깊고 넓은 바다', desc: '지혜롭고 포용력이 있으며 스케일이 큽니다. 유연하고 창의적이지만, 속을 알기 어렵고 변덕이 있을 수 있습니다.' },
  '癸': { title: '계수(癸水) - 맑은 이슬과 빗물', desc: '상냥하고 영리하며 눈치가 빠릅니다. 주변 사람을 잘 챙기고 꼼꼼하지만, 마음이 여려 상처를 잘 받을 수 있습니다.' }
};

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  yearSelectHeader.value = year;
  monthSelectHeader.value = month;
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  
  calendarDays.innerHTML = "";
  for (let i = 0; i < firstDayOfMonth; i++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day", "empty");
    calendarDays.appendChild(dayDiv);
  }
  for (let i = 1; i <= lastDateOfMonth; i++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.innerText = i;
    const today = new Date();
    if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayDiv.classList.add("today");
    }
    if (selectedDate && i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
      dayDiv.classList.add("selected");
    }
    dayDiv.addEventListener("click", () => {
      selectedDate = new Date(year, month, i);
      updateSelectedDisplay();
      renderCalendar();
    });
    calendarDays.appendChild(dayDiv);
  }
}

function updateSelectedDisplay() {
  if (selectedDate) {
    selectedDateDisplay.innerText = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
    confirmBtn.disabled = false;
  }
}

function getPillar(eightChar, lunar, type) {
  const methods = [`get${type}`, `get${type}GanZhi`, `get${type}InGanZhi`, type === 'Hour' ? 'getTime' : null, type === 'Hour' ? 'getTimeGanZhi' : null].filter(Boolean);
  for (let m of methods) {
    if (typeof eightChar[m] === 'function') return eightChar[m]();
  }
  const ganMethod = `get${type}Gan`, zhiMethod = `get${type}Zhi`;
  if (typeof eightChar[ganMethod] === 'function' && typeof eightChar[zhiMethod] === 'function') {
    return eightChar[ganMethod]() + eightChar[zhiMethod]();
  }
  return "??";
}

function updateInterpretation(pillars) {
  const elementsCount = { 'wood': 0, 'fire': 0, 'earth': 0, 'metal': 0, 'water': 0 };
  pillars.forEach(p => {
    if (!p.data) return;
    const stem = p.data.substring(0, 1), branch = p.data.substring(1, 2);
    if (elementsMap[stem]) elementsCount[elementsMap[stem]]++;
    if (elementsMap[branch]) elementsCount[elementsMap[branch]]++;
  });
  
  const dayMaster = pillars.find(p => p.id === 'dayPillar').data.substring(0, 1);
  const info = dayMasterInfo[dayMaster] || { title: '분석 불가', desc: '정확한 정보를 불러올 수 없습니다.' };
  document.getElementById('dayMasterTitle').innerText = info.title;
  document.getElementById('personalityText').innerText = info.desc;
  
  const statsContainer = document.getElementById('elementsStats');
  statsContainer.innerHTML = '';
  
  Object.keys(elementsCount).forEach(key => {
    const count = elementsCount[key], percentage = (count / 8) * 100;
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <div class="stat-label">${elementsDesc[key]}</div>
      <div class="stat-bar-bg">
        <div class="stat-bar-fill" style="width: 0; background-color: var(--${key})"></div>
      </div>
      <div class="stat-count">${count}</div>
    `;
    statsContainer.appendChild(row);
    
    // Trigger animation
    setTimeout(() => {
      row.querySelector('.stat-bar-fill').style.width = `${percentage}%`;
    }, 100);
  });
}

function calculateSaju() {
  if (!selectedDate) return;
  const year = selectedDate.getFullYear(), month = selectedDate.getMonth() + 1, day = selectedDate.getDate(), hour = parseInt(hourSelect.value), minute = parseInt(minuteSelect.value);
  
  if (typeof Solar === 'undefined') { alert("라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요."); return; }
  
  try {
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0), lunar = solar.getLunar(), eightChar = lunar.getEightChar();
    const yearP = getPillar(eightChar, lunar, 'Year'), monthP = getPillar(eightChar, lunar, 'Month'), dayP = getPillar(eightChar, lunar, 'Day'), hourP = getPillar(eightChar, lunar, 'Hour');
    
    currentPillars = [{ id: 'yearPillar', data: yearP }, { id: 'monthPillar', data: monthP }, { id: 'dayPillar', data: dayP }, { id: 'hourPillar', data: hourP }];
    
    currentPillars.forEach(p => {
      const el = document.getElementById(p.id);
      if (!el || !p.data) return;
      const stem = p.data.substring(0, 1), branch = p.data.substring(1, 2);
      const stemDiv = el.querySelector('.stem'), branchDiv = el.querySelector('.branch');
      if (stemDiv) { stemDiv.innerText = stem; stemDiv.className = `stem ${elementsMap[stem] || ''}`; }
      if (branchDiv) { branchDiv.innerText = branch; branchDiv.className = `branch ${elementsMap[branch] || ''}`; }
    });
    
    updateInterpretation(currentPillars);
    sajuTextDisplay.innerText = `${yearP}년 ${monthP}월 ${dayP}일 ${hourP}시`;
    
    resultContainer.classList.remove('hidden');
    aiResultArea.classList.add('hidden'); 
    resultContainer.scrollIntoView({ behavior: 'smooth' });
  } catch (error) { console.error("Saju error:", error); alert("계산 중 오류가 발생했습니다."); }
}

async function callGeminiAPI() {
  // localStorage에 키가 없으면 DEFAULT_API_KEY를 사용합니다.
  const apiKey = (localStorage.getItem('gemini_api_key') || DEFAULT_API_KEY || '').trim();
  const selectedModel = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

  if (!apiKey || apiKey === '여기에_실제_API_키를_넣으세요') { 
    alert("API 키가 설정되지 않았습니다. 설정(⚙️)에서 입력하거나 코드의 DEFAULT_API_KEY를 수정해주세요."); 
    settingsModal.classList.remove('hidden'); 
    return; 
  }
  if (!currentPillars) return;

  aiLoading.classList.remove('hidden');
  aiAnalysisBtn.disabled = true;
  aiResultArea.classList.add('hidden');

  const pillarText = currentPillars.map(p => p.data).join(' ');
  const prompt = `너는 명리학 전문가야. 다음 사주 데이터를 바탕으로 성격, 직업운, 재물운을 상세히 풀이해줘. 마크다운 형식을 사용하고 한국어로 답변해줘.\n\n사주: ${pillarText}\n일시: ${sajuTextDisplay.innerText}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) throw new Error(`API 오류: ${response.status}`);

    const data = await response.json();
    if (data.candidates && data.candidates[0].content) {
      const markdownText = data.candidates[0].content.parts[0].text;
      aiContent.innerHTML = marked.parse(markdownText);
      aiResultArea.classList.remove('hidden');
      aiResultArea.scrollIntoView({ behavior: 'smooth' });
    }
  } catch (error) {
    alert(`오류가 발생했습니다: ${error.message}`);
  } finally {
    aiLoading.classList.add('hidden');
    aiAnalysisBtn.disabled = false;
  }
}

// Settings Logic
settingsBtn.onclick = () => {
  // localStorage에 키가 없으면 코드에 설정된 기본 키를 보여줍니다.
  apiKeyInput.value = localStorage.getItem('gemini_api_key') || (DEFAULT_API_KEY !== '여기에_실제_API_키를_넣으세요' ? DEFAULT_API_KEY : '');
  modelSelect.value = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';
  settingsModal.classList.remove('hidden');
};
closeModalBtn.onclick = () => settingsModal.classList.add('hidden');
saveKeyBtn.onclick = () => {
  localStorage.setItem('gemini_api_key', apiKeyInput.value.trim());
  localStorage.setItem('gemini_model', modelSelect.value);
  alert("설정이 저장되었습니다.");
  settingsModal.classList.add('hidden');
};

// Events
yearSelectHeader.addEventListener('change', () => { currentDate.setFullYear(yearSelectHeader.value); renderCalendar(); });
monthSelectHeader.addEventListener('change', () => { currentDate.setMonth(monthSelectHeader.value); renderCalendar(); });
prevMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
nextMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
confirmBtn.onclick = calculateSaju;
aiAnalysisBtn.onclick = callGeminiAPI;

renderCalendar();

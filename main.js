import { elementsMap, elementsDesc, dayMasterInfo } from './data.js';

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
const aiLoading = document.getElementById('aiLoading');
const aiResultArea = document.getElementById('aiResultArea');
const aiContent = document.getElementById('aiContent');
const analysisTabs = document.querySelector('.analysis-tabs');

let currentDate = new Date();
let selectedDate = null;
let currentPillars = null;
let currentTopic = 'personality'; // 기본 탭을 성격으로 변경
let fullAnalysisData = null; // 전체 분석 결과를 저장할 변수
let currentSajuInfo = null; // 현재 사주 정보 캐시

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
        resultContainer.scrollIntoView({ behavior: 'smooth' });

        // 로딩 초기화
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.tab-btn[data-topic="personality"]').classList.add('active');
        currentTopic = 'personality';
        fullAnalysisData = null; 
        
        aiLoading.classList.remove('hidden');
        aiResultArea.classList.add('hidden');
        
        // 데이터 가져오기 시작
        getAIFullAnalysis();

    } catch (error) { console.error("Saju error:", error); alert("계산 중 오류가 발생했습니다."); }
}

function displayTopicContent(topic) {
    // 데이터가 아직 없으면 로딩 표시
    if (!fullAnalysisData && topic !== 'personality') {
        aiLoading.classList.remove('hidden');
        aiResultArea.classList.add('hidden');
        return;
    }

    aiLoading.classList.add('hidden');
    aiResultArea.classList.remove('hidden');

    if (topic === 'personality') {
        if (!currentPillars) return;
        const dayMaster = currentPillars.find(p => p.id === 'dayPillar').data.substring(0, 1);
        const info = dayMasterInfo[dayMaster] || { title: '분석 불가', desc: '정확한 정보를 불러올 수 없습니다.' };
        const content = `### ${info.title}\n${info.desc}`;
        aiContent.innerHTML = marked.parse(content);
        return;
    }
    
    const topicInfo = {
        job: { name: '직업운', pattern: '[\\*\\s]*직업( ?운)?' },
        love: { name: '연애운', pattern: '[\\*\\s]*연애( ?운)?' },
        wealth: { name: '재물운', pattern: '[\\*\\s]*재물( ?운)?' }
    };

    const currentTopicInfo = topicInfo[topic];
    if (!currentTopicInfo) return;

    const regex = new RegExp(`(###\\s*${currentTopicInfo.pattern}[\\s\\S]*?)(?=(###|$))`);
    const match = fullAnalysisData.match(regex);

    let contentToShow = '';
    if (match && match[1]) {
        contentToShow = match[1].trim();
    } else {
        contentToShow = `### 오류\n'${currentTopicInfo.name}'에 대한 분석을 찾을 수 없습니다. AI가 아직 답변을 생성 중이거나, 내용을 분석하는 데 실패했습니다. 잠시 후 다시 시도해주세요.`;
    }

    aiContent.innerHTML = marked.parse(contentToShow);
}

async function getAIFullAnalysis(retries = 3, backoff = 2000) {
    const sajuInfo = sajuTextDisplay.innerText;
    currentSajuInfo = sajuInfo;

    const apiKey = 'AIzaSyCXl9anPpc8BfMz1jB3qj7b7ZTR31hp_h8';
    const selectedModel = 'gemini-2.5-flash';

    if (!currentPillars) return;

    const otherTabs = analysisTabs.querySelectorAll('button:not([data-topic="personality"])');
    otherTabs.forEach(btn => btn.disabled = true);

    const pillarText = currentPillars.map(p => p.data).join(' ');
    const prompt = `너는 현대적인 관점에서 사주를 해석하는 명리학 전문가야. 다음 사주 데이터를 바탕으로, 아래 각 주제에 대해 상세하게 풀이해줘.
각 주제는 반드시 다음 형식을 따라서 '### 주제명'으로 시작해야해: '### 직업운', '### 연애운', '### 재물운'.
답변은 마크다운 형식의 한국어로, 친근하고 이해하기 쉽게 작성해줘.

사주: ${pillarText}
일시: ${sajuTextDisplay.innerText}`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
        
        let response;
        for (let i = 0; i < retries; i++) {
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (response.ok) break;
            if (response.status === 503 && i < retries - 1) {
                console.warn(`503 발생, ${backoff}ms 후 재시도 (${i + 1}/${retries})...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                backoff *= 2; // 지수 백오프
                continue;
            }
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            fullAnalysisData = data.candidates[0].content.parts[0].text;
            if (currentTopic !== 'personality') {
                displayTopicContent(currentTopic);
            }
        } else {
            throw new Error("API로부터 유효한 답변을 받지 못했습니다.");
        }
    } catch (error) {
        console.error("Gemini API call failed:", error);
        if (currentTopic !== 'personality') {
            aiContent.innerHTML = `<p style="color:red;"><strong>오류가 발생했습니다:</strong> ${error.message}</p><p>잠시 후 다시 시도해주세요.</p>`;
        }
        fullAnalysisData = null;
    } finally {
        aiLoading.classList.add('hidden');
        otherTabs.forEach(btn => btn.disabled = false);
    }
}


// --- 이벤트 리스너 --- //
yearSelectHeader.addEventListener('change', () => { currentDate.setFullYear(yearSelectHeader.value); renderCalendar(); });
monthSelectHeader.addEventListener('change', () => { currentDate.setMonth(monthSelectHeader.value); renderCalendar(); });
prevMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
nextMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
confirmBtn.onclick = calculateSaju;

analysisTabs.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const topic = e.target.dataset.topic;
        if (topic !== currentTopic) {
            currentTopic = topic;
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            displayTopicContent(topic);
        }
    }

  });

renderCalendar();

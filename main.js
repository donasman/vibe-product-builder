import { elementsMap, elementsDesc, dayMasterInfo } from './data.js';
import { fetchFullAnalysis } from './ai.js';

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

// AI Elements
const aiLoading = document.getElementById('aiLoading');
const aiResultArea = document.getElementById('aiResultArea');
const aiContent = document.getElementById('aiContent');
const analysisTabs = document.querySelector('.analysis-tabs');

let currentDate = new Date();
let selectedDate = null;
let currentPillars = null;
let currentTopic = 'personality'; 
let fullAnalysisData = null; 

// (초기화 코드 동일)
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

        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.tab-btn[data-topic="personality"]').classList.add('active');
        currentTopic = 'personality';
        fullAnalysisData = null; 
        
        aiLoading.classList.remove('hidden');
        aiResultArea.classList.add('hidden');
        
        runAIAnalysis();

    } catch (error) { console.error("Saju error:", error); alert("계산 중 오류가 발생했습니다."); }
}

function displayTopicContent(topic) {
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

    aiContent.innerHTML = match && match[1] ? marked.parse(match[1].trim()) : `### 오류\n'${currentTopicInfo.name}' 분석을 찾을 수 없습니다.`;
}

async function runAIAnalysis() {
    const pillarText = currentPillars.map(p => p.data).join(' ');
    const sajuInfo = sajuTextDisplay.innerText;
    
    const otherTabs = analysisTabs.querySelectorAll('button:not([data-topic="personality"])');
    otherTabs.forEach(btn => btn.disabled = true);

    try {
        fullAnalysisData = await fetchFullAnalysis(pillarText, sajuInfo);
        // 분석 완료 시 로딩 감추고 결과 영역 표시
        aiLoading.classList.add('hidden');
        aiResultArea.classList.remove('hidden');
        displayTopicContent(currentTopic);
    } catch (error) {
        console.error(error);
        aiLoading.classList.add('hidden');
        aiResultArea.classList.remove('hidden');
        aiContent.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="color:red; margin-bottom: 20px;">분석 중 오류가 발생했습니다: ${error.message}</p>
                <button id="retryBtn" class="confirm-btn" style="padding: 10px 20px; font-size: 0.9rem;">다시 시도하기</button>
            </div>
        `;
        document.getElementById('retryBtn').onclick = runAIAnalysis;
        fullAnalysisData = null;
    } finally {
        otherTabs.forEach(btn => btn.disabled = false);
    }
}

// 이벤트 리스너...
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

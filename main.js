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
let currentTopic = 'personality'; // 기본 탭을 성격으로 변경
let fullAnalysisData = null; // 전체 분석 결과를 저장할 변수
let currentSajuInfo = null; // 현재 사주 정보 캐시

// (이전과 동일한 초기화 코드...)
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

const elementsMap = {
  '甲': 'wood', '乙': 'wood', '寅': 'wood', '卯': 'wood',
  '丙': 'fire', '丁': 'fire', '巳': 'fire', '午': 'fire',
  '戊': 'earth', '己': 'earth', '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
  '庚': 'metal', '辛': 'metal', '申': 'metal', '酉': 'metal',
  '壬': 'water', '癸': 'water', '亥': 'water', '子': 'water'
};

const elementsDesc = { 'wood': '나무(木)', 'fire': '불(火)', 'earth': '흙(土)', 'metal': '금(金)', 'water': '물(수)' };

// 일간별 성격 정보
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
        const personalityTab = document.querySelector('.tab-btn[data-topic="personality"]');
        personalityTab.classList.add('active');
        currentTopic = 'personality';
        fullAnalysisData = null; // 분석 데이터 초기화
        
        // 1. 성격 탭 내용 즉시 표시
        displayTopicContent('personality');
        aiResultArea.classList.remove('hidden');
        aiLoading.classList.add('hidden');
        
        // 2. 나머지 운세 정보는 백그라운드에서 가져옴
        getAIFullAnalysis();

    } catch (error) { console.error("Saju error:", error); alert("계산 중 오류가 발생했습니다."); }
}

function displayTopicContent(topic) {
    aiLoading.classList.add('hidden');

    if (topic === 'personality') {
        if (!currentPillars) return;
        const dayMaster = currentPillars.find(p => p.id === 'dayPillar').data.substring(0, 1);
        const info = dayMasterInfo[dayMaster] || { title: '분석 불가', desc: '정확한 정보를 불러올 수 없습니다.' };
        const content = `### ${info.title}\n${info.desc}`;
        aiContent.innerHTML = marked.parse(content);
        return;
    }

    if (!fullAnalysisData) {
        aiLoading.classList.remove('hidden');
        aiContent.innerHTML = ""; 
        return;
    }
    
    const topicInfo = {
        job: { name: '직업운', pattern: '[\\*\\s]*직업( ?운)?' },
        love: { name: '연애운', pattern: '[\\*\\s]*연애( ?운)?' },
        wealth: { name: '재물운', pattern: '[\\*\\s]*재물( ?운)?' }
    };

    const currentTopicInfo = topicInfo[topic];
    if (!currentTopicInfo) return;

    // 정규식 설명: ### 뒤에 공백이나 별표(*)가 있을 수 있고, 주제명 뒤에도 별표가 있을 수 있음을 고려
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

async function getAIFullAnalysis() {
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
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API 오류: ${response.status} - ${errorData.error?.message || '알 수 없는 오류'}`);
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

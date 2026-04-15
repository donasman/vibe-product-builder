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

let currentDate = new Date();
let selectedDate = null;

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

// Helper to get pillar safely
function getPillar(eightChar, lunar, type) {
  // Try various method names based on different library versions
  const methods = [
    `get${type}`, 
    `get${type}GanZhi`, 
    `get${type}InGanZhi`,
    // Some versions use 'Time' instead of 'Hour'
    type === 'Hour' ? 'getTime' : null,
    type === 'Hour' ? 'getTimeGanZhi' : null
  ].filter(Boolean);
  
  for (let m of methods) {
    if (typeof eightChar[m] === 'function') return eightChar[m]();
  }
  
  // Fallback to separate Gan and Zhi
  const ganMethod = `get${type}Gan`;
  const zhiMethod = `get${type}Zhi`;
  if (typeof eightChar[ganMethod] === 'function' && typeof eightChar[zhiMethod] === 'function') {
    return eightChar[ganMethod]() + eightChar[zhiMethod]();
  }

  // Final fallback: try getting from lunar object directly
  const lunarMethods = [
    `get${type}InGanZhi`,
    `get${type}GanZhi`,
    type === 'Hour' ? 'getTimeInGanZhi' : null
  ].filter(Boolean);

  for (let m of lunarMethods) {
    if (typeof lunar[m] === 'function') return lunar[m]();
  }
  
  return "??";
}

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

const elementsDesc = {
  'wood': '나무(木)', 'fire': '불(火)', 'earth': '흙(土)', 'metal': '금(金)', 'water': '물(水)'
};

function updateInterpretation(pillars) {
  const elementsCount = { 'wood': 0, 'fire': 0, 'earth': 0, 'metal': 0, 'water': 0 };
  
  // 1. Count Elements from Stems and Branches
  pillars.forEach(p => {
    if (!p.data) return;
    const stem = p.data.substring(0, 1);
    const branch = p.data.substring(1, 2);
    
    if (elementsMap[stem]) elementsCount[elementsMap[stem]]++;
    if (elementsMap[branch]) elementsCount[elementsMap[branch]]++;
  });

  // 2. Identify Day Master (Ilgan)
  const dayMaster = pillars.find(p => p.id === 'dayPillar').data.substring(0, 1);
  const info = dayMasterInfo[dayMaster] || { title: '분석 불가', desc: '정확한 정보를 불러올 수 없습니다.' };
  
  document.getElementById('dayMasterTitle').innerText = `나의 성향: ${info.title}`;
  document.getElementById('personalityText').innerText = info.desc;

  // 3. Render Stats Chart
  const statsContainer = document.getElementById('elementsStats');
  statsContainer.innerHTML = '';
  
  Object.keys(elementsCount).forEach(key => {
    const count = elementsCount[key];
    const percentage = (count / 8) * 100; // total characters is 8
    
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <div class="stat-label">${elementsDesc[key]}</div>
      <div class="stat-bar-bg">
        <div class="stat-bar-fill" style="width: ${percentage}%; background-color: var(--${key})"></div>
      </div>
      <div class="stat-count">${count}</div>
    `;
    statsContainer.appendChild(row);
  });
}

function calculateSaju() {
  if (!selectedDate) return;
...
    pillars.forEach(p => {
...
    });

    updateInterpretation(pillars);
    
    sajuTextDisplay.innerText = `${yearP}년 ${monthP}월 ${dayP}일 ${hourP}시`;
...

  } catch (error) {
    console.error("Saju calculation error:", error);
    alert("계산 중 오류가 발생했습니다. 라이브러리 구조가 다를 수 있습니다.");
  }
}

// Event Listeners for Header Selects
yearSelectHeader.addEventListener('change', () => {
  currentDate.setFullYear(yearSelectHeader.value);
  renderCalendar();
});
monthSelectHeader.addEventListener('change', () => {
  currentDate.setMonth(monthSelectHeader.value);
  renderCalendar();
});

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

confirmBtn.addEventListener("click", calculateSaju);

// Initial render
renderCalendar();

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

function calculateSaju() {
  if (!selectedDate) return;

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();
  const hour = parseInt(hourSelect.value);
  const minute = parseInt(minuteSelect.value);

  if (typeof Solar === 'undefined') {
    alert("라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  try {
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();

    // Debug: Log available methods if ?? appears
    console.log("EightChar methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(eightChar)));

    const yearP = getPillar(eightChar, lunar, 'Year');
    const monthP = getPillar(eightChar, lunar, 'Month');
    const dayP = getPillar(eightChar, lunar, 'Day');
    const hourP = getPillar(eightChar, lunar, 'Hour');

    const pillars = [
      { id: 'yearPillar', data: yearP },
      { id: 'monthPillar', data: monthP },
      { id: 'dayPillar', data: dayP },
      { id: 'hourPillar', data: hourP }
    ];

    pillars.forEach(p => {
      const el = document.getElementById(p.id);
      if (!el || !p.data) return;

      const stem = p.data.substring(0, 1);
      const branch = p.data.substring(1, 2);

      const stemDiv = el.querySelector('.stem');
      const branchDiv = el.querySelector('.branch');

      if (stemDiv) {
        stemDiv.innerText = stem;
        stemDiv.className = `stem ${elementsMap[stem] || ''}`;
      }
      
      if (branchDiv) {
        branchDiv.innerText = branch;
        branchDiv.className = `branch ${elementsMap[branch] || ''}`;
      }
    });

    sajuTextDisplay.innerText = `${yearP}년 ${monthP}월 ${dayP}일 ${hourP}시`;
    resultContainer.classList.remove('hidden');
    resultContainer.scrollIntoView({ behavior: 'smooth' });

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

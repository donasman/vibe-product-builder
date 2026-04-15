const monthDisplay = document.getElementById('monthDisplay');
const calendarDays = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const selectedDateDisplay = document.getElementById('selectedDateDisplay');
const confirmBtn = document.getElementById('confirmBtn');

let currentDate = new Date();
let selectedDate = null;

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthDisplay.innerText = `${months[month]} ${year}`;

  // First day of the month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Last day of the month
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  // Last day of previous month
  const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

  calendarDays.innerHTML = "";

  // Fill empty slots for previous month
  for (let i = firstDayOfMonth; i > 0; i--) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day", "empty");
    calendarDays.appendChild(dayDiv);
  }

  // Fill days of current month
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
      selectDate(new Date(year, month, i));
    });

    calendarDays.appendChild(dayDiv);
  }
}

function selectDate(date) {
  selectedDate = date;
  selectedDateDisplay.innerText = date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  confirmBtn.disabled = false;
  renderCalendar();
}

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

confirmBtn.addEventListener("click", () => {
  if (selectedDate) {
    alert(`Confirmed: ${selectedDate.toLocaleDateString()}`);
  }
});

// Initial render
renderCalendar();

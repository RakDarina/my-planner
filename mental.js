// 1. ИНИЦИАЛИЗАЦИЯ ДАННЫХ (Один общий блок для всего)
window.addEventListener('DOMContentLoaded', () => {
    if (!window.appData) {
        window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {};
    }
    // Проверка всех разделов
    if (!window.appData.mental) window.appData.mental = { gratitude: [], emotions: [], achievements: [], good_day: [] };
    if (!window.appData.water) window.appData.water = { current: 0, goal: 2000, glassSize: 250, consumedGlasses: 0 };
    if (!window.appData.sleep) window.appData.sleep = [];
    if (!window.appData.cycle) window.appData.cycle = { periodDays: [], cycleLength: 28, periodLength: 5 };

    // Запуск всех систем
    updateWaterUI();
    updateSleepUI();
    renderCalendar();
});

// Переменные для графиков и календаря
let sleepChart = null;
let editingSleepIndex = null;
let currentCalDate = new Date();

// --- ТРЕКЕР ВОДЫ ---
function updateWaterUI() {
    const currentEl = document.getElementById('water-current');
    const goalEl = document.getElementById('water-goal');
    if (currentEl) currentEl.innerText = window.appData.water.current;
    if (goalEl) goalEl.innerText = window.appData.water.goal;
    
    const container = document.getElementById('glasses-container');
    if (!container) return;
    
    const totalGlasses = Math.ceil(window.appData.water.goal / window.appData.water.glassSize);
    container.innerHTML = '';
    
    for (let i = 0; i < totalGlasses; i++) {
        const glass = document.createElement('div');
        glass.className = 'glass-icon' + (i < window.appData.water.consumedGlasses ? ' active' : '');
        glass.innerHTML = '<div class="water"></div>';
        glass.onclick = () => toggleGlass(i);
        container.appendChild(glass);
    }
}

function toggleGlass(index) {
    const w = window.appData.water;
    w.consumedGlasses = (index < w.consumedGlasses) ? index : index + 1;
    w.current = w.consumedGlasses * w.glassSize;
    saveData();
    updateWaterUI();
}

function openWaterSettings() {
    document.getElementById('water-modal').style.display = 'flex';
    document.getElementById('input-water-goal').value = window.appData.water.goal;
    document.getElementById('input-glass-size').value = window.appData.water.glassSize;
}

function closeWaterModal() { document.getElementById('water-modal').style.display = 'none'; }

function saveWaterSettings() {
    window.appData.water.goal = parseInt(document.getElementById('input-water-goal').value) || 2000;
    window.appData.water.glassSize = parseInt(document.getElementById('input-glass-size').value) || 250;
    window.appData.water.current = window.appData.water.consumedGlasses * window.appData.water.glassSize;
    saveData(); updateWaterUI(); closeWaterModal();
}

function calculateWaterGoal() {
    const weight = prompt("Введите ваш вес в кг:");
    if (weight) document.getElementById('input-water-goal').value = weight * 30;
}

// --- ДНЕВНИКИ ---
function openMentalModal(question, defaultValue, onSave, isSMER = false) {
    const modal = document.getElementById('mental-modal');
    const textarea = document.getElementById('modal-textarea');
    const saveBtn = document.getElementById('modal-save-btn');
    document.getElementById('modal-question').innerText = question;

    if (isSMER) {
        textarea.style.display = 'none';
        let formHtml = `<div id="smer-form" style="display:flex; flex-direction:column; gap:10px; width:100%; text-align:left;">
            <div><b>1. Ситуация:</b><textarea id="sm-1" class="smer-input"></textarea></div>
            <div><b>2. Эмоции:</b><textarea id="sm-2" class="smer-input"></textarea></div>
            <div><b>3. Мысли:</b><textarea id="sm-3" class="smer-input"></textarea></div>
            <div><b>4. Поведение:</b><textarea id="sm-4" class="smer-input"></textarea></div>
            <div><b>5. Альтернатива:</b><textarea id="sm-5" class="smer-input"></textarea></div>
        </div>`;
        if (!document.getElementById('smer-form')) textarea.insertAdjacentHTML('afterend', formHtml);
        else document.getElementById('smer-form').style.display = 'flex';

        if (typeof defaultValue === 'object') {
            document.getElementById('sm-1').value = defaultValue.situation || "";
            document.getElementById('sm-2').value = defaultValue.emotion || "";
            document.getElementById('sm-3').value = defaultValue.thoughts || "";
            document.getElementById('sm-4').value = defaultValue.behavior || "";
            document.getElementById('sm-5').value = defaultValue.alternative || "";
        }
    } else {
        textarea.style.display = 'block';
        if (document.getElementById('smer-form')) document.getElementById('smer-form').style.display = 'none';
        textarea.value = defaultValue || "";
    }
    modal.style.display = 'flex';
    saveBtn.onclick = () => {
        if (isSMER) {
            onSave({
                situation: document.getElementById('sm-1').value,
                emotion: document.getElementById('sm-2').value,
                thoughts: document.getElementById('sm-3').value,
                behavior: document.getElementById('sm-4').value,
                alternative: document.getElementById('sm-5').value,
                isComplex: true
            });
        } else { onSave(textarea.value.trim()); }
        closeMentalModal();
    };
}

function closeMentalModal() { document.getElementById('mental-modal').style.display = 'none'; }

function openDiary(type, title) {
    window.currentDiaryType = type;
    document.getElementById('diary-title').innerText = title;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('view-diary-details').classList.add('active');
    renderDiaryEntries();
}

function renderDiaryEntries() {
    const list = document.getElementById('diary-content-list');
    list.innerHTML = '';
    const entries = window.appData.mental[window.currentDiaryType] || [];
    entries.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'goal-card';
        let content = item.isComplex ? `<div>...СМЭР контент...</div>` : `<span>${item.text}</span>`;
        div.innerHTML = `<div style="display:flex; justify-content:space-between"><b>${item.date}</b>
            <span onclick="deleteDiaryEntry(${index})" class="material-icons-round">delete_outline</span></div>${content}`;
        list.appendChild(div);
    });
}

function deleteDiaryEntry(index) {
    if (confirm("Удалить?")) {
        window.appData.mental[window.currentDiaryType].splice(index, 1);
        saveData(); renderDiaryEntries();
    }
}

// --- ТРЕКЕР СНА ---
function updateSleepUI() {
    renderSleepList();
    renderSleepChart();
}

function openSleepModal(index = null) {
    editingSleepIndex = index;
    const modal = document.getElementById('sleep-modal');
    modal.style.display = 'flex';
    if (index !== null) {
        document.getElementById('sleep-start').value = window.appData.sleep[index].start;
        document.getElementById('sleep-end').value = window.appData.sleep[index].end;
    }
}

function closeSleepModal() { document.getElementById('sleep-modal').style.display = 'none'; }

function saveSleepEntry() {
    const start = document.getElementById('sleep-start').value;
    const end = document.getElementById('sleep-end').value;
    if (!start || !end) return;
    const duration = parseFloat(((new Date(end) - new Date(start)) / (1000 * 60 * 60)).toFixed(1));
    const entry = { start, end, duration, date: new Date(end).toLocaleDateString('ru-RU', {day:'numeric', month:'short'}) };
    
    if (editingSleepIndex !== null) window.appData.sleep[editingSleepIndex] = entry;
    else window.appData.sleep.push(entry);
    
    saveData(); closeSleepModal(); updateSleepUI();
}

function renderSleepList() {
    const list = document.getElementById('sleep-list');
    if (!list) return;
    list.innerHTML = '';
    window.appData.sleep.slice(-5).reverse().forEach((entry, i) => {
        const realIdx = window.appData.sleep.indexOf(entry);
        list.innerHTML += `<div style="display:flex; justify-content:space-between; padding:10px 0; border-top:1px solid #eee">
            <span>${entry.date}: ${entry.duration}ч</span>
            <span onclick="deleteSleepEntry(${realIdx})" class="material-icons-round">delete_outline</span>
        </div>`;
    });
}

function deleteSleepEntry(idx) {
    window.appData.sleep.splice(idx, 1);
    saveData(); updateSleepUI();
}

function renderSleepChart() {
    const ctx = document.getElementById('sleepChart');
    if (!ctx || !window.Chart) return;
    const data = window.appData.sleep.slice(-7);
    if (sleepChart) sleepChart.destroy();
    sleepChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                data: data.map(d => d.duration),
                backgroundColor: data.map(d => d.duration >= 8 ? '#4caf50' : (d.duration >= 6 ? '#ffc107' : '#f44336')),
                borderRadius: 5
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 12 } } }
    });
}

// --- ЖЕНСКИЙ КАЛЕНДАРЬ ---
function renderCalendar() {
    const grid = document.getElementById('calendar-days');
    if (!grid) return;
    grid.innerHTML = '';
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    document.getElementById('calendar-month-year').innerText = new Intl.DateTimeFormat('ru-RU', {month:'long', year:'numeric'}).format(currentCalDate);

    // Расчет дат
    const sortedStarts = [...window.appData.cycle.periodDays].filter(d => d.isStart).sort((a,b) => new Date(a.date) - new Date(b.date));
    const lastStart = sortedStarts.length > 0 ? new Date(sortedStarts[sortedStarts.length-1].date) : null;

    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < offset; i++) grid.innerHTML += '<div></div>';

    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
        const curDate = new Date(year, month, day);
        const dateStr = curDate.toISOString().split('T')[0];
        let classes = 'calendar-day';

        if (window.appData.cycle.periodDays.some(d => d.date === dateStr)) classes += ' day-period';
        if (new Date().toDateString() === curDate.toDateString()) classes += ' day-today';

        if (lastStart && !classes.includes('day-period')) {
            const diffDays = Math.floor((curDate - lastStart) / (86400000));
            const cycleDay = diffDays % window.appData.cycle.cycleLength;
            if (diffDays > 0 && cycleDay < window.appData.cycle.periodLength) classes += ' day-prediction';
            if (cycleDay >= 10 && cycleDay <= 15) classes += ' day-fertile';
        }
        grid.innerHTML += `<div class="${classes}" onclick="handleDayClick('${dateStr}')">${day}</div>`;
    }
}

function handleDayClick(dateStr) {
    const idx = window.appData.cycle.periodDays.findIndex(d => d.date === dateStr);
    if (idx > -1) {
        window.appData.cycle.periodDays = window.appData.cycle.periodDays.filter(d => d.date !== dateStr);
    } else {
        for (let i = 0; i < 5; i++) {
            let d = new Date(dateStr); d.setDate(d.getDate() + i);
            window.appData.cycle.periodDays.push({ date: d.toISOString().split('T')[0], isStart: i === 0 });
        }
    }
    saveData(); renderCalendar();
}

function changeMonth(dir) { currentCalDate.setMonth(currentCalDate.getMonth() + dir); renderCalendar(); }
